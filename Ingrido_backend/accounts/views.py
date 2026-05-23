import os
import requests
import random
import json
import re
from datetime import datetime, timedelta
from urllib.parse import unquote
from django.utils import timezone
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.db.models import Q 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from dotenv import load_dotenv
from groq import Groq

from .models import Recipe, City, SavedRecipe, UserProfile, SavedMealPlan, AIGeneratedRecipe, UserSearchHistory, UserViewedRecipe
from .serializers import (
    RecipeDetailSerializer,
    CitySerializer,
    RecipeListSerializer,
    SavedRecipeSerializer,
    UserSerializer,
    SavedMealPlanSerializer
)

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY") or "AIzaSyByBTRLlawcXiiIznJh8rprwrSymEmv8Gc"
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


def fetch_youtube_video_id(recipe_title):
    try:
        search_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': f"how to cook {recipe_title} recipe authentic",
            'key': YOUTUBE_API_KEY,
            'maxResults': 1,
            'type': 'video'
        }
        res = requests.get(search_url, params=params, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data.get('items'):
                return data['items'][0]['id']['videoId']
    except Exception as e:
        print(f"YouTube fetch failed: {e}")
    return "dQw4w9WgXcQ"


def fetch_pexels_image(dish_name):
    try:
        if not PEXELS_API_KEY:
            print("Pexels API key not found")
            return get_fallback_image(dish_name)
        search_query = f"{dish_name} pakistani food"
        url = "https://api.pexels.com/v1/search"
        headers = {"Authorization": PEXELS_API_KEY}
        params = {
            "query": search_query,
            "per_page": 1,
            "orientation": "landscape"
        }
        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("photos") and len(data["photos"]) > 0:
                return data["photos"][0]["src"]["medium"]
        print(f"No image found for {dish_name}")
        return get_fallback_image(dish_name)
    except Exception as e:
        print(f"Pexels API error: {e}")
        return get_fallback_image(dish_name)


def get_fallback_image(dish_name):
    dish_lower = dish_name.lower()
    fallbacks = {
        'biryani': 'https://images.pexels.com/photos/16188923/pexels-photo-16188923.jpeg',
        'chicken': 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
        'karahi': 'https://images.pexels.com/photos/2672759/pexels-photo-2672759.jpeg',
        'nihari': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
        'korma': 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg',
        'daal': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        'roti': 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
        'default': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg'
    }
    for key, url in fallbacks.items():
        if key in dish_lower:
            return url
    return fallbacks['default']


def get_current_season():
    month = datetime.now().month
    if month in [12, 1, 2]:
        return "winter"
    elif month in [3, 4, 5]:
        return "spring"
    elif month in [6, 7, 8]:
        return "summer"
    else:
        return "autumn"


def is_valid_search_query(query):
    query = query.strip().lower()
    if len(query) < 2:
        return False, "Please enter at least 2 characters"
    if len(query) > 60:
        return False, "Search is too long, please enter a shorter dish name"
    if not any(c.isalpha() for c in query):
        return False, "Please enter a dish name containing letters"
    letter_count = sum(c.isalpha() for c in query)
    number_count = sum(c.isdigit() for c in query)
    if number_count >= letter_count:
        return False, "Please enter a valid dish name"
    if number_count > 2:
        return False, "Please enter a valid dish name without many numbers"
    vowels = set('aeiou')
    vowel_count = sum(1 for c in query if c in vowels)
    if vowel_count == 0 and len(query) >= 4:
        return False, "Please enter a valid dish name"
    if vowel_count == 0 and number_count > 0:
        return False, "Please enter a valid dish name"
    if re.search(r'(.{2,})\1{2,}', query):
        return False, "Please enter a valid dish name"
    keyboard_patterns = ['asdf', 'qwerty', 'zxcv', 'qwer', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'uiop', 'poiu', 'lkjh']
    for pattern in keyboard_patterns:
        if pattern in query:
            return False, "Please enter a valid dish name"
    if len(set(query)) == 1 and len(query) > 2:
        return False, "Please enter a valid dish name"
    if query.isdigit():
        return False, "Please enter a dish name, not just numbers"
    return True, None


# ========== AUTHENTICATION VIEWS ==========

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'first_name': user.first_name
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email_input = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email_input, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'first_name': user.first_name
        }, status=200)
    return Response({'error': 'Invalid Credentials'}, status=401)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'GET':
        return Response({
            'username': request.user.username,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.email,
            'health_conditions': profile.health_conditions,
            'dietary_preferences': profile.dietary_preferences
        })
    elif request.method == 'PUT':
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.save()
        profile.health_conditions = request.data.get('health_conditions', profile.health_conditions)
        profile.dietary_preferences = request.data.get('dietary_preferences', profile.dietary_preferences)
        profile.save()
        return Response({'message': 'Profile updated successfully'})


# ========== CITY & RECIPE VIEWS ==========

@api_view(['GET'])
@permission_classes([AllowAny])
def city_list(request):
    cities = City.objects.all()
    serializer = CitySerializer(cities, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def GetRecipesByCity(request):
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
            city_info = CitySerializer(city_obj).data

    return Response({
        'recipes': serializer.data,
        'city': city_info
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_dashboard_recipes(request):
    recipes = Recipe.objects.all().order_by('?')[:12]
    serializer = RecipeListSerializer(recipes, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def recipe_detail(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    serializer = RecipeDetailSerializer(recipe, context={'request': request})

    data = serializer.data
    data['youtube_video_id'] = fetch_youtube_video_id(recipe.title)

    if request.user.is_authenticated:
        data['is_saved'] = SavedRecipe.objects.filter(
            user=request.user,
            recipe=recipe
        ).exists()
    else:
        data['is_saved'] = False

    return Response(data)


# ========== SEASONAL RECOMMENDATIONS ==========

@api_view(['GET'])
@permission_classes([AllowAny])
def get_seasonal_recommendations(request):
    current_season = get_current_season()
    
    seasonal_keywords = {
        'winter': ['nihari', 'haleem', 'soup', 'karahi', 'korma', 'saag', 'paye', 'chai'],
        'summer': ['chaat', 'lassi', 'kheer', 'mango', 'sherbet', 'raita', 'cooling', 'light'],
        'spring': ['fresh', 'peas', 'spinach', 'light curry', 'barbecue', 'kebab'],
        'autumn': ['pumpkin', 'spiced', 'roasted', 'dry curry', 'keema']
    }
    
    keywords = seasonal_keywords.get(current_season, ['pakistani', 'recipe'])
    
    seasonal_db_recipes = Recipe.objects.filter(
        Q(title__icontains=keywords[0]) |
        Q(title__icontains=keywords[1]) |
        Q(title__icontains=keywords[2]) |
        Q(description__icontains=keywords[0])
    ).distinct()[:6]
    
    if len(seasonal_db_recipes) >= 6:
        db_list = list(seasonal_db_recipes)
        random.shuffle(db_list)
        selected = db_list[:6]
        serializer = RecipeListSerializer(selected, many=True, context={'request': request})
        data = serializer.data
        for item in data:
            item['is_ai_generated'] = False
        return Response(data)
    
    db_recipes_list = list(seasonal_db_recipes)
    db_count = len(db_recipes_list)
    needed_count = 6 - db_count
    
    if not groq_client:
        all_recipes = list(Recipe.objects.all())
        random.shuffle(all_recipes)
        final_recipes = all_recipes[:6]
        serializer = RecipeListSerializer(final_recipes, many=True, context={'request': request})
        return Response(serializer.data)
    
    prompt = f"""Current season: {current_season}. Suggest {needed_count} Pakistani {current_season} dishes with drinks. Return JSON: [{{"title":"name","kcal":350,"prep_time":30}}]"""
    
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": f"You are a Pakistani chef. Output ONLY valid JSON arrays with EXACTLY {needed_count} items."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.9,
            max_tokens=300
        )
        
        response_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        
        if not json_match:
            all_recipes = list(Recipe.objects.all())
            random.shuffle(all_recipes)
            final_recipes = all_recipes[:6]
            serializer = RecipeListSerializer(final_recipes, many=True, context={'request': request})
            return Response(serializer.data)
        
        ai_recipes = json.loads(json_match.group())
        
        formatted_ai_recipes = []
        for idx, item in enumerate(ai_recipes):
            db_match = Recipe.objects.filter(title__iexact=item['title']).first()
            
            if db_match:
                serializer = RecipeListSerializer(db_match, context={'request': request})
                recipe_data = serializer.data
                recipe_data['is_ai_generated'] = False
                formatted_ai_recipes.append(recipe_data)
            else:
                cached = AIGeneratedRecipe.objects.filter(title__iexact=item['title']).first()
                image_url = cached.image_url if cached else fetch_pexels_image(item['title'])
                
                formatted_ai_recipes.append({
                    'id': f"ai-seasonal-{idx}-{random.randint(1000, 9999)}",
                    'title': item['title'],
                    'image': image_url,
                    'prep_time': int(item.get('prep_time', 30)),
                    'kcal': int(item.get('kcal', 350)),
                    'category': 'Seasonal',
                    'is_ai_generated': True
                })
        
        db_serialized = []
        for recipe in db_recipes_list[:6]:
            serializer = RecipeListSerializer(recipe, context={'request': request})
            data = serializer.data
            data['is_ai_generated'] = False
            db_serialized.append(data)
        
        combined = db_serialized + formatted_ai_recipes
        combined = combined[:6]
        random.shuffle(combined)
        
        return Response(combined)
        
    except Exception as e:
        print(f"Seasonal AI error: {e}")
        all_recipes = list(Recipe.objects.all())
        random.shuffle(all_recipes)
        final_recipes = all_recipes[:6]
        serializer = RecipeListSerializer(final_recipes, many=True, context={'request': request})
        return Response(serializer.data)


# ========== AI RECIPE SEARCH ==========

@api_view(['GET'])
@permission_classes([AllowAny])
def search_ai_recipes_list(request):
    query = request.query_params.get('q', '').strip()
    
    if not query or len(query) < 2:
        return Response([], status=200)
    
    is_valid, error_msg = is_valid_search_query(query)
    if not is_valid:
        return Response({
            'error': error_msg,
            'is_invalid': True,
            'suggestions': ['Biryani', 'Chicken Karahi', 'Daal', 'Nihari', 'Korma']
        }, status=400)

    db_recipes = Recipe.objects.filter(
        Q(title__icontains=query) | 
        Q(ingredients__icontains=query) |
        Q(description__icontains=query)
    )[:6]
    
    db_serialized = RecipeListSerializer(db_recipes, many=True, context={'request': request}).data
    
    for item in db_serialized:
        item['is_ai_generated'] = False
    
    if len(db_recipes) >= 3:
        return Response(db_serialized)
    
    if not groq_client:
        return Response(db_serialized)

    prompt = f"""
    The user is searching for "{query}" in a Pakistani Recipe App.
    Generate a list of 3 to 5 popular or relevant Pakistani dishes related to "{query}".
    
    Return ONLY a valid JSON array of objects with this exact structure:
    [
        {{
            "title": "Name of the specific dish",
            "kcal": 380,
            "prep_time": 30
        }},
        ...
    ]
    Return raw JSON data. Make sure kcal and prep_time are plain integers.
    """

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an expert Pakistani chef assistant. Output ONLY valid JSON arrays where metrics are numbers."},
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
            
            try:
                item['kcal'] = int(item.get('kcal', 350))
            except (ValueError, TypeError):
                item['kcal'] = 350

            try:
                item['prep_time'] = int(item.get('prep_time', 25))
            except (ValueError, TypeError):
                item['prep_time'] = 25

            if 'title' in item:
                item['meal'] = item['title']
            
            cached = AIGeneratedRecipe.objects.filter(title__iexact=item['title']).first()
            if cached and cached.image_url:
                item['image'] = cached.image_url
            else:
                item['image'] = fetch_pexels_image(item['title'])
        
        combined_results = db_serialized + ai_recipes
        return Response(combined_results)

    except Exception as e:
        return Response(db_serialized)


# ========== AI SUBSTITUTE ==========

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_ai_substitute(request, pk=None):
    ingredient = request.data.get('ingredient', '').strip()
    recipe_title = request.data.get('recipe_title', '').strip()
    
    if not ingredient:
        return Response({'error': 'Ingredient name is required'}, status=400)
    
    if pk:
        recipe = get_object_or_404(Recipe, pk=pk)
        recipe_title = recipe.title
    
    if not recipe_title:
        recipe_title = "this dish"
    
    if not groq_client:
        return Response({'error': 'AI service not configured'}, status=500)
    
    prompt = f"For '{recipe_title}', instead of '{ingredient}', suggest 2 substitutes in one short sentence. Example: 'Use yogurt or buttermilk instead.'"

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.5,
            max_tokens=80
        )
        substitute = chat_completion.choices[0].message.content.strip()
        return Response({'substitute': substitute})
        
    except Exception as e:
        return Response({'error': f'AI service error: {str(e)}'}, status=500)


# ========== AI RECIPE DETAIL ==========

@api_view(['GET'])
@permission_classes([AllowAny])
def get_ai_recipe_detail(request, recipe_title):
    recipe_title = unquote(recipe_title).replace('-', ' ').title()

    if not recipe_title or len(recipe_title.strip()) < 2:
        return Response({'error': 'Invalid recipe title'}, status=400)
    
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
            'image': cached_recipe.image_url,
            'is_ai_generated': True
        })
    
    if not groq_client:
        return Response({'error': 'AI service not configured'}, status=503)

    prompt = f"""
    Generate a detailed Pakistani recipe for "{recipe_title}".
    Return ONLY valid JSON with this exact structure:
    {{
        "title": "{recipe_title}",
        "description": "Brief description of the dish (1-2 sentences)",
        "ingredients": "List of ingredients, each on a new line",
        "instructions": "Step by step cooking instructions, each step on a new line",
        "prep_time": 45,
        "kcal": 420,
        "cuisine": "Pakistani",
        "dietary_type": "veg or non_veg or mixed",
        "spice_level": "Medium"
    }}
    Ensure prep_time and kcal are integers. Make it authentic and detailed.
    """

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional Pakistani chef. Respond ONLY with valid JSON, numbers as integers, no other text."},
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
        pexels_image = fetch_pexels_image(recipe_title)
        
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
            image_url=pexels_image,
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
            'is_ai_generated': True
        })
        
    except Exception as e:
        return Response({'error': f"AI Recipe Error: {str(e)}"}, status=500)


# ========== BOOKMARK / SAVED RECIPES ==========

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, recipe_id=None):
    recipe_data = request.data.get('recipe_data')
    
    if recipe_id and str(recipe_id).isdigit():
        recipe = get_object_or_404(Recipe, id=recipe_id)
    elif recipe_data:
        recipe_title = recipe_data.get('title')
        existing_recipe = Recipe.objects.filter(title__iexact=recipe_title).first()
        if existing_recipe:
            recipe = existing_recipe
        else:
            try:
                recipe = Recipe.objects.create(
                    title=recipe_data.get('title', 'Untitled Recipe'),
                    description=recipe_data.get('description', ''),
                    ingredients=recipe_data.get('ingredients', ''),
                    instructions=recipe_data.get('instructions', ''),
                    prep_time=int(recipe_data.get('prep_time', 30)),
                    calories=int(recipe_data.get('kcal', 0)),
                    cuisine=recipe_data.get('cuisine', 'Pakistani'),
                    dietary_type=recipe_data.get('dietary_type', 'mixed'),
                    spice_level=recipe_data.get('spice_level', 'Medium')
                )
            except Exception as e:
                return Response({'error': f'Error creating recipe: {str(e)}'}, status=500)
    else:
        return Response({'error': 'No recipe identifier provided'}, status=400)
    
    bookmark, created = SavedRecipe.objects.get_or_create(user=request.user, recipe=recipe)
    if not created:
        bookmark.delete()
        return Response({'saved': False, 'status': 'removed'})
    
    return Response({'saved': True, 'status': 'saved'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_ai_bookmark(request, recipe_title):
    recipe_title = unquote(recipe_title).replace('-', ' ').title()
    
    ai_recipe = AIGeneratedRecipe.objects.filter(title__iexact=recipe_title).first()
    if not ai_recipe:
        return Response({'error': 'Recipe not found'}, status=404)
    
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    
    if not hasattr(profile, 'ai_bookmarks'):
        profile.ai_bookmarks = []
    
    if recipe_title in profile.ai_bookmarks:
        profile.ai_bookmarks.remove(recipe_title)
        profile.save()
        return Response({'status': 'removed', 'saved': False})
    else:
        profile.ai_bookmarks.append(recipe_title)
        profile.save()
        return Response({'status': 'saved', 'saved': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_recipes(request):
    bookmarks = SavedRecipe.objects.filter(user=request.user).select_related('recipe')
    data = []
    for b in bookmarks:
        recipe_data = RecipeListSerializer(b.recipe, context={'request': request}).data
        recipe_data['bookmark_id'] = b.id
        recipe_data['saved_at'] = b.saved_at
        data.append(recipe_data)
    return Response(data)


# ========== MEAL PLANNER VIEWS ==========

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_and_save_meal_plan(request):
    if not groq_client:
        return Response({'error': 'AI Service not configured'}, status=503)

    try:
        profile = UserProfile.objects.get(user=request.user)
        health_conditions = profile.health_conditions or "None"
        dietary_preferences = profile.dietary_preferences or "None"
        
        prompt = f"""
        Act as an expert Pakistani Nutritionist. Generate a 7-day structured meal plan (Breakfast, Lunch, Dinner) customized for a person from Pakistan.
        Health Conditions: {health_conditions}
        Dietary Preferences/Restrictions: {dietary_preferences}
        Return ONLY valid JSON array containing exactly 7 objects (one for each day), with this exact structure:
        [
          {{
            "day": "Day 1",
            "breakfast": "Dish name with key ingredients",
            "lunch": "Dish name with key ingredients",
            "dinner": "Dish name with key ingredients",
            "nutrition_tip": "One concise tip localized to Pakistan"
          }},
          ...
        ]
        Respond with raw JSON only. No text before or after, no markdown backticks.
        """

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional nutritionist. Output ONLY valid JSON arrays."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        response_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if not json_match:
            return Response({'error': 'AI failed to respond in JSON structure'}, status=500)
        
        weekly_plan_data = json.loads(json_match.group())
        
        SavedMealPlan.objects.filter(user=request.user, is_active=True).update(is_active=False)
        
        meal_plan = SavedMealPlan.objects.create(
            user=request.user,
            weekly_plan=weekly_plan_data,
            health_condition=health_conditions,
            dietary_preference=dietary_preferences,
            is_active=True
        )
        
        return Response({
            'weekly_plan': meal_plan.weekly_plan,
            'plan_id': meal_plan.id,
            'created_at': meal_plan.created_at,
            'health_condition': meal_plan.health_condition,
            'dietary_preference': meal_plan.dietary_preference
        }, status=201)

    except Exception as e:
        return Response({'error': f'Meal plan generation failed: {str(e)}'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_meal_plan(request):
    return generate_and_save_meal_plan(request)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_meal_plan(request):
    try:
        plan = SavedMealPlan.objects.filter(user=request.user, is_active=True).order_by('-created_at').first()
        if plan:
            if timezone.now() > plan.created_at + timedelta(days=7):
                plan.is_active = False
                plan.save()
                return Response({'message': 'Plan expired after 7 days'}, status=404)
            return Response({
                'weekly_plan': plan.weekly_plan,
                'plan_id': plan.id,
                'created_at': plan.created_at,
                'health_condition': plan.health_condition,
                'dietary_preference': plan.dietary_preference
            })
        return Response({'message': 'No active plan found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_meal_plan(request, plan_id):
    plan = get_object_or_404(SavedMealPlan, id=plan_id, user=request.user)
    plan.delete()
    return Response({'message': 'Deleted'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_health_preferences(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return Response({
        'health_conditions': profile.health_conditions, 
        'dietary_preferences': profile.dietary_preferences
    })


# ========== SEARCH HISTORY VIEWS ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_search_history(request):
    history = UserSearchHistory.objects.filter(user=request.user)[:10]
    return Response({
        'searches': [item.query for item in history]
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_search_history(request):
    query = request.data.get('query', '').strip()
    if not query:
        return Response({'error': 'Query required'}, status=400)
    
    UserSearchHistory.objects.filter(user=request.user, query=query).delete()
    UserSearchHistory.objects.create(user=request.user, query=query)
    
    history = UserSearchHistory.objects.filter(user=request.user)
    if history.count() > 10:
        history.last().delete()
    
    return Response({'status': 'added'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_search_history(request):
    UserSearchHistory.objects.filter(user=request.user).delete()
    return Response({'status': 'cleared'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_search_item(request, query):
    UserSearchHistory.objects.filter(user=request.user, query=query).delete()
    return Response({'status': 'removed'})


# ========== VIEWED RECIPES VIEWS ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_viewed_recipes(request):
    viewed = UserViewedRecipe.objects.filter(user=request.user)[:20]
    return Response({
        'recipes': [item.recipe_data for item in viewed]
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_viewed_recipe(request):
    recipe_data = request.data.get('recipe_data', {})
    if not recipe_data:
        return Response({'error': 'Recipe data required'}, status=400)
    
    recipe_title = recipe_data.get('title', '')
    recipe_id = recipe_data.get('id', recipe_title)
    
    UserViewedRecipe.objects.filter(user=request.user, recipe_id=recipe_id).delete()
    UserViewedRecipe.objects.create(
        user=request.user,
        recipe_id=recipe_id,
        recipe_title=recipe_title,
        recipe_data=recipe_data
    )
    
    viewed = UserViewedRecipe.objects.filter(user=request.user)
    if viewed.count() > 20:
        viewed.last().delete()
    
    return Response({'status': 'added'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_viewed_recipes(request):
    UserViewedRecipe.objects.filter(user=request.user).delete()
    return Response({'status': 'cleared'})


# ========== HEALTH CHECK ==========

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'timestamp': timezone.now()})