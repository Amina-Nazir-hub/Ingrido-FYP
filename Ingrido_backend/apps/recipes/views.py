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
from .services import fetch_youtube_video_id, get_groq_client
from apps.common.services import get_ai_generated_image

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

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
        
        if recipe.image:
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

    if not groq_client:
        return Response({'error': 'AI service not configured'}, status=503)

    prompt = f"""Generate a detailed Pakistani recipe for "{recipe_title}".
    Return ONLY valid JSON with this exact structure:
    {{
        "title": "{recipe_title}",
        "description": "Brief description of the dish",
        "ingredients": "List of ingredients, each on new line",
        "instructions": "Step by step instructions, each step on new line",
        "prep_time": 45,
        "kcal": 420,
        "cuisine": "Pakistani",
        "dietary_type": "mixed",
        "spice_level": "Medium"
    }}
    Make sure prep_time and kcal are integers.
    """

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional Pakistani chef. Respond ONLY with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
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

        video_id = fetch_youtube_video_id(recipe_title)
        ai_image = get_ai_generated_image(recipe_title)
        
        saved_recipe = AIGeneratedRecipe.objects.create(
            title=recipe_title,
            description=recipe_data.get('description', ''),
            ingredients=recipe_data.get('ingredients', ''),
            instructions=recipe_data.get('instructions', ''),
            prep_time=recipe_data.get('prep_time', 30),
            kcal=recipe_data.get('kcal', 400),
            cuisine=recipe_data.get('cuisine', 'Pakistani'),
            dietary_type=recipe_data.get('dietary_type', 'mixed'),
            spice_level=recipe_data.get('spice_level', 'Medium'),
            youtube_video_id=video_id,
            image_url=ai_image,
            view_count=1
        )
        
        return Response({
            'title': saved_recipe.title,
            'description': saved_recipe.description,
            'ingredients': saved_recipe.ingredients,
            'instructions': saved_recipe.instructions,
            'prep_time': saved_recipe.prep_time,
            'kcal': saved_recipe.kcal,
            'cuisine': saved_recipe.cuisine,
            'dietary_type': saved_recipe.dietary_type,
            'spice_level': saved_recipe.spice_level,
            'youtube_video_id': saved_recipe.youtube_video_id,
            'image': saved_recipe.image_url,
            'is_ai_generated': True,
            'is_saved': False,
        })
        
    except Exception as e:
        print(f"AI Recipe Error: {e}")
        return Response({'error': f"AI Recipe Error: {str(e)}"}, status=500)

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
- For "green chili" when essential: "Green chili is essential for the heat in this dish. Please buy fresh green chilies from any store."
- For "green chili" when optional: "Green chili adds heat. You can use red chili powder (1/4 tsp per chili) or skip it."
- For "cream" when optional: "Use fresh malai or full-fat coconut milk instead of cream."
- For "onion": "Onion is essential. Please buy fresh onions."
- For "turmeric": "Turmeric is essential for color and flavor. Please buy from store - it's very cheap."
- For "garam masala": "Garam masala is essential for authentic flavor. Please buy from any grocery store."
- For "cardamom": "Cardamom adds aroma. You can skip it or use cinnamon stick as substitute."

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
    """Search recipes using AI"""
    query = request.query_params.get('q', '').strip()
    groq_client = get_groq_client()
    
    if not query or len(query) < 2:
        return Response([], status=200)

    db_recipes = Recipe.objects.filter(
        Q(title__icontains=query) | 
        Q(ingredients__icontains=query) | 
        Q(description__icontains=query)
    )[:6]
    
    db_serialized = RecipeListSerializer(db_recipes, many=True, context={'request': request}).data
    for item in db_serialized:
        item['is_ai_generated'] = False
    
    if len(db_recipes) >= 3 or not groq_client:
        return Response(db_serialized)

    prompt = f"""The user is searching for "{query}" in a Pakistani Recipe App.
    Generate a list of 3 to 5 popular Pakistani dishes related to "{query}".
    Return ONLY valid JSON array: [{{"title":"name","kcal":380,"prep_time":30}}]"""

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an expert Pakistani chef. Output ONLY valid JSON arrays."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        response_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if not json_match:
            return Response(db_serialized)
            
        ai_recipes = json.loads(json_match.group())
        
        for idx, item in enumerate(ai_recipes):
            item['id'] = f"ai-{idx}-{random.randint(1000, 9999)}"
            item['is_ai_generated'] = True
            item['is_saved'] = False
            
            try:
                item['kcal'] = int(item.get('kcal', 350))
            except (ValueError, TypeError):
                item['kcal'] = 350

            try:
                item['prep_time'] = int(item.get('prep_time', 25))
            except (ValueError, TypeError):
                item['prep_time'] = 25

            item['meal'] = item['title']
            item['image'] = get_ai_generated_image(item['title'])
        
        return Response(db_serialized + ai_recipes)
        
    except Exception as e:
        print(f"AI search error: {e}")
        return Response(db_serialized)