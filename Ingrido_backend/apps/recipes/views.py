import json
import re
import random
from dotenv import load_dotenv
import os
from urllib.parse import unquote
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.shortcuts import get_object_or_404
from groq import Groq

from .models import City, Recipe, AIGeneratedRecipe
from .serializers import CitySerializer, RecipeListSerializer, RecipeDetailSerializer
from .services import fetch_youtube_video_id, get_groq_client, CHANNEL_NAMES
from apps.common.services import get_ai_generated_image
from django.core.files.storage import default_storage

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = get_groq_client()

# ========== CITY & RECIPE VIEWS ==========

@api_view(['GET'])
@permission_classes([AllowAny])
def city_list(request):
    """Get all cities"""
    cities = City.objects.all()
    serializer = CitySerializer(cities, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def GetRecipesByCity(request):
    """Get recipes by city name"""
    city_name = request.query_params.get('city')
    city_id = request.query_params.get('city_id')
    search_query = request.query_params.get('search', None)

    if city_name:
        recipes = Recipe.objects.filter(city__name__iexact=city_name)
    elif city_id:
        recipes = Recipe.objects.filter(city_id=city_id)
    else:
        recipes = Recipe.objects.all()

    if search_query:
        recipes = recipes.filter(Q(title__icontains=search_query) | Q(description__icontains=search_query))

    serializer = RecipeListSerializer(recipes, many=True, context={'request': request})

    city_info = None
    if city_name:
        city_obj = City.objects.filter(name__iexact=city_name).first()
        if city_obj:
            city_info = CitySerializer(city_obj, context={'request': request}).data

    return Response({
        'recipes': serializer.data,
        'city': city_info
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def recipe_detail(request, pk):
    """Get single recipe details"""
    try:
        recipe = get_object_or_404(Recipe, pk=pk)
        
        data = {
            'id': recipe.id,
            'title': recipe.title,
            'description': recipe.description,
            'ingredients': recipe.ingredients,
            'instructions': recipe.instructions,
            'prep_time': recipe.prep_time,
            'kcal': recipe.calories,
            'cuisine': recipe.cuisine,
            'dietary_type': recipe.dietary_type,
            'spice_level': recipe.spice_level,
            'estimated_protein': recipe.estimated_protein,
            'is_vegetarian': recipe.is_vegetarian,
            'is_sugar_free': recipe.is_sugar_free,
            'is_low_fat': recipe.is_low_fat,
        }
        
        if recipe.image and default_storage.exists(recipe.image.name):
            if request:
                data['image'] = request.build_absolute_uri(recipe.image.url)
            else:
                data['image'] = recipe.image.url
        else:
            data['image'] = get_ai_generated_image(recipe.title)
        
        if recipe.city:
            data['city_name'] = recipe.city.name
        else:
            data['city_name'] = None
        
        try:
            data['youtube_video_id'] = fetch_youtube_video_id(recipe.title)
        except:
            data['youtube_video_id'] = None
        
        if request.user.is_authenticated:
            from apps.account.models import SavedRecipe
            data['is_saved'] = SavedRecipe.objects.filter(
                user=request.user,
                recipe=recipe
            ).exists()
        else:
            data['is_saved'] = False
        
        return Response(data)
        
    except Exception as e:
        print(f"Error in recipe_detail: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_dashboard_recipes(request):
    """Get random recipes for dashboard"""
    recipes = Recipe.objects.all().order_by('?')[:12]
    serializer = RecipeListSerializer(recipes, many=True, context={'request': request})
    return Response(serializer.data)

# ========== AI RECIPE DETAIL ==========

@api_view(['GET'])
@permission_classes([AllowAny])
def get_ai_recipe_detail(request, recipe_title):
    """Get AI generated recipe details"""
    recipe_title = unquote(recipe_title).replace('-', ' ').title()
    groq_client = get_groq_client()

    cached_recipe = AIGeneratedRecipe.objects.filter(title__iexact=recipe_title).first()
    if cached_recipe:
        cached_recipe.view_count += 1
        cached_recipe.save()
        return Response({
            'title': cached_recipe.title,
            'description': cached_recipe.description,
            'ingredients': cached_recipe.ingredients,
            'instructions': cached_recipe.instructions,
            'prep_time': cached_recipe.prep_time,
            'kcal': cached_recipe.kcal,
            'cuisine': cached_recipe.cuisine,
            'dietary_type': cached_recipe.dietary_type,
            'spice_level': cached_recipe.spice_level,
            'youtube_video_id': cached_recipe.youtube_video_id,
            'image': cached_recipe.image_url if cached_recipe.image_url else get_ai_generated_image(recipe_title),
            'is_ai_generated': True,
            'is_saved': False,
        })

    # Create a default entry first so subsequent requests always find cache
    default_recipe, created = AIGeneratedRecipe.objects.get_or_create(
        title__iexact=recipe_title,
        defaults={
            'title': recipe_title,
            'description': f'A traditional Pakistani dish.',
            'ingredients': 'Ingredients not available',
            'instructions': 'Instructions not available',
            'prep_time': 30,
            'kcal': 400,
            'cuisine': 'Pakistani',
            'dietary_type': 'mixed',
            'spice_level': 'Medium',
            'youtube_video_id': fetch_youtube_video_id(recipe_title, restrict_to_channels=True),
            'image_url': get_ai_generated_image(recipe_title),
            'view_count': 1
        }
    )
    if not created:
        # Cache hit from concurrent request
        default_recipe.view_count += 1
        default_recipe.save()
        return Response({
            'title': default_recipe.title,
            'description': default_recipe.description,
            'ingredients': default_recipe.ingredients,
            'instructions': default_recipe.instructions,
            'prep_time': default_recipe.prep_time,
            'kcal': default_recipe.kcal,
            'cuisine': default_recipe.cuisine,
            'dietary_type': default_recipe.dietary_type,
            'spice_level': default_recipe.spice_level,
            'youtube_video_id': default_recipe.youtube_video_id,
            'image': default_recipe.image_url if default_recipe.image_url else get_ai_generated_image(recipe_title),
            'is_ai_generated': True,
            'is_saved': False,
        })

    if not groq_client:
        return Response({
            'title': default_recipe.title,
            'description': default_recipe.description,
            'ingredients': default_recipe.ingredients,
            'instructions': default_recipe.instructions,
            'prep_time': default_recipe.prep_time,
            'kcal': default_recipe.kcal,
            'cuisine': default_recipe.cuisine,
            'dietary_type': default_recipe.dietary_type,
            'spice_level': default_recipe.spice_level,
            'youtube_video_id': default_recipe.youtube_video_id,
            'image': default_recipe.image_url if default_recipe.image_url else get_ai_generated_image(recipe_title),
            'is_ai_generated': True,
            'is_saved': False,
        })

    channels_str = ', '.join(CHANNEL_NAMES)

    prompt = f"""Generate a detailed Pakistani recipe for "{recipe_title}".

    This dish is from one of these YouTube channels: {channels_str}.
    Follow the authentic cooking style and ingredients typical of these channels.

    Return ONLY valid JSON with this exact structure:
    {{
        "title": "{recipe_title}",
        "description": "Brief description of the dish",
        "ingredients": "List of ingredients with measurements, each on new line",
        "instructions": "Step by step cooking instructions as shown in YouTube cooking videos, each step on new line",
        "prep_time": 45,
        "kcal": 420,
        "cuisine": "Pakistani",
        "dietary_type": "mixed",
        "spice_level": "Medium"
    }}
    Make sure prep_time and kcal are integers.
    Make ingredients and instructions detailed and authentic to Pakistani cooking channels.
    """

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional Pakistani chef. Respond ONLY with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            timeout=30
        )
        
        response_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            return Response({'error': 'Failed to generate recipe'}, status=500)
            
        recipe_data = json.loads(json_match.group())
        
        try:
            recipe_data['kcal'] = int(recipe_data.get('kcal', 400))
        except (ValueError, TypeError):
            recipe_data['kcal'] = 400

        try:
            recipe_data['prep_time'] = int(recipe_data.get('prep_time', 30))
        except (ValueError, TypeError):
            recipe_data['prep_time'] = 30

        video_id = fetch_youtube_video_id(recipe_title, restrict_to_channels=True) or default_recipe.youtube_video_id
        ai_image = get_ai_generated_image(recipe_title) or default_recipe.image_url

        default_recipe.description = recipe_data.get('description', default_recipe.description)
        default_recipe.ingredients = recipe_data.get('ingredients', default_recipe.ingredients)
        default_recipe.instructions = recipe_data.get('instructions', default_recipe.instructions)
        default_recipe.prep_time = recipe_data.get('prep_time', default_recipe.prep_time)
        default_recipe.kcal = recipe_data.get('kcal', default_recipe.kcal)
        default_recipe.cuisine = recipe_data.get('cuisine', default_recipe.cuisine)
        default_recipe.dietary_type = recipe_data.get('dietary_type', default_recipe.dietary_type)
        default_recipe.spice_level = recipe_data.get('spice_level', default_recipe.spice_level)
        default_recipe.youtube_video_id = video_id
        default_recipe.image_url = ai_image
        default_recipe.save()

        return Response({
            'title': default_recipe.title,
            'description': default_recipe.description,
            'ingredients': default_recipe.ingredients,
            'instructions': default_recipe.instructions,
            'prep_time': default_recipe.prep_time,
            'kcal': default_recipe.kcal,
            'cuisine': default_recipe.cuisine,
            'dietary_type': default_recipe.dietary_type,
            'spice_level': default_recipe.spice_level,
            'youtube_video_id': default_recipe.youtube_video_id,
            'image': default_recipe.image_url,
            'is_ai_generated': True,
            'is_saved': False,
        })

    except Exception as e:
        print(f"AI Recipe Error: {e}")
        default_recipe.view_count = 0
        default_recipe.save()
        return Response({
            'title': default_recipe.title,
            'description': default_recipe.description,
            'ingredients': default_recipe.ingredients,
            'instructions': default_recipe.instructions,
            'prep_time': default_recipe.prep_time,
            'kcal': default_recipe.kcal,
            'cuisine': default_recipe.cuisine,
            'dietary_type': default_recipe.dietary_type,
            'spice_level': default_recipe.spice_level,
            'youtube_video_id': default_recipe.youtube_video_id,
            'image': default_recipe.image_url if default_recipe.image_url else get_ai_generated_image(recipe_title),
            'is_ai_generated': True,
            'is_saved': False,
        })

# ========== AI SUBSTITUTE ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def get_ai_substitute(request, pk=None):
    """
    Pure AI substitute - AI reads recipe and decides what to suggest
    Supports both database recipes (by pk) and AI-generated recipes (by title)
    """
    
    # Check if it's AI recipe (by title) or DB recipe (by pk)
    recipe_title = request.data.get('recipe_title')
    ingredient = request.data.get('ingredient', '').strip()

    if not ingredient:
        return Response({"error": "Ingredient name missing"}, status=400)

    if not groq_client:
        return Response({
            "error": "GROQ_API_KEY not configured. Please add to .env file",
            "setup_url": "https://console.groq.com",
            "status": "error"
        }, status=500)

    # Get recipe details
    recipe_name = ""
    ingredients_list = ""
    
    if pk and str(pk).isdigit():
        # Database recipe
        recipe = get_object_or_404(Recipe, pk=pk)
        recipe_name = recipe.title
        ingredients_list = recipe.ingredients
    elif recipe_title:
        # AI-generated recipe
        recipe_name = recipe_title
        ai_recipe = AIGeneratedRecipe.objects.filter(title__iexact=recipe_title).first()
        if ai_recipe:
            ingredients_list = ai_recipe.ingredients
        else:
            ingredients_list = "Ingredients not available"
    else:
        return Response({"error": "Recipe identifier required (either pk or recipe_title)"}, status=400)

    try:
        # Pure AI prompt - AI will read recipe and decide
        prompt = f"""You are a professional Pakistani chef giving practical advice.

RECIPE NAME: {recipe_name}

FULL INGREDIENTS LIST:
{ingredients_list}

USER ASKS: "I don't have {ingredient}. What should I do?"

YOUR JOB:
1. First, check if "{ingredient}" is in the ingredients list above.

2. If {ingredient} is NOT in the list:
   Reply: "This ingredient is not used in {recipe_name}. You don't need it. Just follow the recipe as written."

3. If {ingredient} IS in the list:
   - If it's ESSENTIAL (onion, garlic, ginger, tomato, chicken, beef, mutton, salt, oil, ghee, rice, flour, green chili, red chili, turmeric, cumin, coriander powder, garam masala, yogurt, cream, milk, butter, egg, potato, daal, sugar, honey, water):
     Reply: "{ingredient} is essential for {recipe_name}. Please buy it from any grocery store."

   - If it's NOT ESSENTIAL (like optional spice, garnish, or can be substituted):
     Suggest 1-2 practical substitutes that work in Pakistani cooking.

EXAMPLES:
- For "green chili" when it's essential: "Green chili is essential for the heat in this dish. Please buy fresh green chilies from any store."
- For "green chili" when optional: "Green chili adds heat. You can use red chili powder (1/4 tsp per chili) or skip it."
- For "cream" when optional: "Use fresh malai or full-fat coconut milk instead of cream."
- For "onion": "Onion is essential. Please buy fresh onions."
- For "turmeric": "Turmeric is essential for color and flavor. Please buy from store - it's very cheap."
- For "garam masala": "Garam masala is essential for authentic flavor. Please buy from any grocery store."
- For "cardamom": "Cardamom adds aroma. You can skip it or use a cinnamon stick as a substitute."

Keep response SHORT (1-2 sentences). Be honest and practical.

Your response:"""

        print("===================================")
        print(f"🍽️ Recipe: {recipe_name}")
        print(f"🥕 User missing: {ingredient}")
        print("🤖 Asking AI...")
        print("===================================")

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an honest Pakistani chef. Read the recipe ingredients carefully. Tell users to buy only truly essential ingredients. For non-essential items, suggest practical substitutes. Never say 'buy it' for everything. Be specific and helpful. Keep responses short (1-2 sentences)."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=200
        )
        
        ai_response = completion.choices[0].message.content.strip()
        
        print(f"✅ AI Response: {ai_response}")
        print("===================================")
        
        return Response({
            "ingredient": ingredient,
            "recipe": recipe_name,
            "substitute": ai_response,
            "status": "success",
            "provider": "Groq AI"
        })
        
    except Exception as e:
        print(f"❌ Groq Error: {str(e)}")
        return Response({
            "error": str(e),
            "status": "error",
            "message": "AI service error. Please check your API key."
        }, status=500)

# ========== AI SEARCH ==========

@api_view(['GET'])
@permission_classes([AllowAny])
def search_ai_recipes_list(request):
    """Search recipes using AI by combining all input ingredients into unified dishes"""
    query = request.query_params.get('q', '').strip()
    groq_client = get_groq_client()
    
    if not query or len(query) < 2:
        return Response([], status=200)

    # 1. Pehle database se lookup karein
    db_recipes = Recipe.objects.filter(
        Q(title__icontains=query) | 
        Q(ingredients__icontains=query)
    )[:4]
    
    db_serialized = RecipeListSerializer(db_recipes, many=True, context={'request': request}).data
    for item in db_serialized:
        item['is_ai_generated'] = False
    
    # Agar exact match database mein kafi hain, to direct bhejien
    if len(db_recipes) >= 3 or not groq_client:
        return Response(db_serialized)

    # 2. Prompt for relevant dish suggestions
    prompt = f"""You are a precise backend API for a Pakistani Recipe App. 
User search query: "{query}"

This could be a dish name (e.g., "biryani", "karahi") or ingredient(s) (e.g., "chicken", "aloo, gobi").

### RULES:
1. Suggest 3 to 5 authentic traditional Pakistani dishes RELEVANT to "{query}".
   - If query is a dish name → suggest variants of that dish (e.g., "biryani" → "Chicken Biryani", "Sindhi Biryani", "Bombay Biryani")
   - If query is ingredients → suggest dishes that use those ingredients (e.g., "chicken" → "Chicken Karahi", "Chicken Tikka", "Chicken Korma")
   - If query has multiple ingredients → suggest dishes that combine them (e.g., "aloo, gobi" → "Aloo Gobi", "Mixed Sabzi")
2. Only suggest REAL, well-known Pakistani dishes. Do NOT make up fusion dishes.
3. If "{query}" makes no sense (non-food, junk words), return empty array [].
4. Calculate realistic 'kcal' and 'prep_time' for each dish.
5. Return ONLY valid JSON array. No extra text.

### JSON Schema:
[
  {{
    "title": "Authentic Pakistani Dish Name",
    "kcal": 420, 
    "prep_time": 35
  }}
]

### User Query:
"{query}" """

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a strict Pakistani chef API. Output ONLY valid JSON arrays. If the combination of ingredients doesn't make a real Pakistani dish, return []."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0,  # Zero creativity taake bongian bilkul khatam ho jayein
            max_tokens=300
        )
        
        response_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        
        if not json_match:
            return Response(db_serialized)
            
        ai_recipes = json.loads(json_match.group())
        
        if not isinstance(ai_recipes, list) or len(ai_recipes) == 0:
            return Response(db_serialized)
        
        formatted_ai_recipes = []
        for idx, item in enumerate(ai_recipes):
            if not isinstance(item, dict) or 'title' not in item:
                continue
            
            dish_title = item.get('title')

            ai_item = {
                'id': f"ai-{idx}-{random.randint(1000, 9999)}",
                'title': dish_title,
                'is_ai_generated': True,
                'is_saved': False,
                'meal': dish_title,
                'image': get_ai_generated_image(dish_title)  # Har unique dish ka alag image trigger hoga
            }
            
            try:
                ai_item['kcal'] = int(item.get('kcal', 380))
            except (ValueError, TypeError):
                ai_item['kcal'] = 380

            try:
                ai_item['prep_time'] = int(item.get('prep_time', 30))
            except (ValueError, TypeError):
                ai_item['prep_time'] = 30
                
            formatted_ai_recipes.append(ai_item)
        
        return Response(db_serialized + formatted_ai_recipes)
        
    except Exception as e:
        print(f"AI search error: {e}")
        return Response(db_serialized)
