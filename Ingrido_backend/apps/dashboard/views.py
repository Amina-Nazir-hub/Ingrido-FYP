# apps/dashboard/views.py
import random
from datetime import datetime
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q

from apps.recipes.models import Recipe, AIGeneratedRecipe
from apps.recipes.serializers import RecipeListSerializer
from apps.recipes.services import get_groq_client
from apps.common.services import get_ai_generated_image


def get_current_season():
    """Get current season based on month"""
    month = datetime.now().month
    if month in [12, 1, 2]:
        return "winter"
    elif month in [3, 4, 5]:
        return "spring"
    elif month in [6, 7, 8]:
        return "summer"
    else:
        return "autumn"


@api_view(['GET'])
@permission_classes([AllowAny])
def get_seasonal_recommendations(request):
    """
    Get seasonal recommendations - Cached so recipes don't change on every render
    """
    # Create cache key (different for each user)
    if request.user.is_authenticated:
        cache_key = f"seasonal_recs_user_{request.user.id}"
    else:
        cache_key = "seasonal_recs_anonymous"
    
    # Try to get from cache first
    cached_recipes = cache.get(cache_key)
    if cached_recipes is not None:
        return Response(cached_recipes)
    
    current_season = get_current_season()
    groq_client = get_groq_client()
    
    seasonal_keywords = {
        'winter': ['nihari', 'haleem', 'soup', 'karahi', 'korma', 'saag', 'paye', 'chai'],
        'summer': ['chaat', 'lassi', 'kheer', 'mango', 'sherbet', 'raita', 'cooling', 'light'],
        'spring': ['fresh', 'peas', 'spinach', 'light curry', 'barbecue', 'kebab'],
        'autumn': ['pumpkin', 'spiced', 'roasted', 'dry curry', 'keema']
    }
    
    keywords = seasonal_keywords.get(current_season, ['pakistani', 'recipe'])
    
    # Get seasonal recipes from database
    seasonal_db_recipes = Recipe.objects.filter(
        Q(title__icontains=keywords[0]) |
        Q(title__icontains=keywords[1]) |
        Q(title__icontains=keywords[2]) |
        Q(description__icontains=keywords[0])
    ).distinct()[:6]
    
    # If we have enough DB recipes, use them
    if len(seasonal_db_recipes) >= 6:
        serializer = RecipeListSerializer(seasonal_db_recipes, many=True, context={'request': request})
        data = serializer.data
        for item in data:
            item['is_ai_generated'] = False
        
        # Cache for 1 hour
        cache.set(cache_key, data, timeout=3600)
        return Response(data)
    
    db_recipes_list = list(seasonal_db_recipes)
    db_count = len(db_recipes_list)
    needed_count = 6 - db_count
    
    # If no AI client, just return DB recipes
    if not groq_client:
        all_recipes = list(Recipe.objects.all())
        if len(all_recipes) >= 6:
            random.shuffle(all_recipes)
            selected = all_recipes[:6]
        else:
            selected = all_recipes
        serializer = RecipeListSerializer(selected, many=True, context={'request': request})
        data = serializer.data
        for item in data:
            item['is_ai_generated'] = False
        
        cache.set(cache_key, data, timeout=3600)
        return Response(data)
    
    # Generate AI recipes for remaining slots
    prompt = f"""Current season: {current_season}. Suggest {needed_count} Pakistani {current_season} dishes with drinks. 
    Return ONLY valid JSON array with EXACTLY {needed_count} items: 
    [{{"title":"dish name","kcal":350,"prep_time":30}}]
    Make sure title is a specific dish name like "Chicken Karahi", "Beef Nihari", etc.
    Do not add any text before or after the JSON."""
    
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": f"You are a Pakistani chef. Output ONLY valid JSON arrays with EXACTLY {needed_count} items."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        import json
        import re
        response_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        
        if not json_match:
            # Fallback to default recipes
            all_recipes = list(Recipe.objects.all())
            random.shuffle(all_recipes)
            final_recipes = all_recipes[:6]
            serializer = RecipeListSerializer(final_recipes, many=True, context={'request': request})
            data = serializer.data
            for item in data:
                item['is_ai_generated'] = False
            cache.set(cache_key, data, timeout=3600)
            return Response(data)
        
        ai_recipes = json.loads(json_match.group())
        
        formatted_ai_recipes = []
        for idx, item in enumerate(ai_recipes):
            # Check if recipe already exists in DB
            db_match = Recipe.objects.filter(title__iexact=item['title']).first()
            
            if db_match:
                serializer = RecipeListSerializer(db_match, context={'request': request})
                recipe_data = serializer.data
                recipe_data['is_ai_generated'] = False
                formatted_ai_recipes.append(recipe_data)
            else:
                # Check cache for AI generated recipe
                cached_ai = AIGeneratedRecipe.objects.filter(title__iexact=item['title']).first()
                image_url = cached_ai.image_url if cached_ai else get_ai_generated_image(item['title'])
                
                formatted_ai_recipes.append({
                    'id': f"ai-seasonal-{idx}-{random.randint(1000, 9999)}",
                    'title': item['title'],
                    'image': image_url,
                    'prep_time': int(item.get('prep_time', 30)),
                    'kcal': int(item.get('kcal', 350)),
                    'category': 'Seasonal',
                    'is_ai_generated': True,
                    'is_saved': False
                })
        
        # Combine DB and AI recipes
        db_serialized = []
        for recipe in db_recipes_list:
            serializer = RecipeListSerializer(recipe, context={'request': request})
            data = serializer.data
            data['is_ai_generated'] = False
            db_serialized.append(data)
        
        combined = db_serialized + formatted_ai_recipes
        combined = combined[:6]
        random.shuffle(combined)
        
        cache.set(cache_key, combined, timeout=3600)
        return Response(combined)
        
    except Exception as e:
        print(f"Seasonal AI error: {e}")
        all_recipes = list(Recipe.objects.all())
        if len(all_recipes) >= 6:
            random.shuffle(all_recipes)
            selected = all_recipes[:6]
        else:
            selected = all_recipes
        serializer = RecipeListSerializer(selected, many=True, context={'request': request})
        data = serializer.data
        for item in data:
            item['is_ai_generated'] = False
        
        cache.set(cache_key, data, timeout=3600)
        return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_recipes(request):
    """
    Get random recipes for dashboard - Fixed order to prevent changes on render
    """
    cache_key = f"dashboard_recipes_{request.user.id}"
   
    cached_recipes = cache.get(cache_key)
    if cached_recipes is not None:
        return Response(cached_recipes)
    
    recipes = Recipe.objects.all().order_by('-id')[:12]
    
    serializer = RecipeListSerializer(recipes, many=True, context={'request': request})
    data = serializer.data
   
    for item in data:
        item['is_ai_generated'] = False

    cache.set(cache_key, data, timeout=1800)
    
    return Response(data)