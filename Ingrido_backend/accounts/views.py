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

from .models import Recipe, City, SavedRecipe, UserProfile, SavedMealPlan
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
# Security Note: API Key ko hamesha .env mein rakhen, code mein hardcode na karen
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# --- HELPERS ---
def fetch_youtube_video_id(recipe_title):
    if not YOUTUBE_API_KEY:
        return None
    try:
        search_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'id',
            'q': f"{recipe_title} recipe pakistani style",
            'key': YOUTUBE_API_KEY,
            'maxResults': 1,
            'type': 'video'
        }
        r = requests.get(search_url, params=params)
        data = r.json()
        if 'items' in data and len(data['items']) > 0:
            return data['items'][0]['id']['videoId']
    except Exception as e:
        print(f"YouTube Error: {e}")
    return None

# --- AUTH VIEWS ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        # Consistent response: matching login_user structure
        return Response({'token': token.key, 'user_id': user.id, 'first_name': user.first_name}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user_id': user.id, 'first_name': user.first_name}, status=200)
    return Response({'error': 'Invalid Credentials'}, status=401)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    return Response({
        'username': request.user.username,
        'email': request.user.email,
        'first_name': request.user.first_name
    })

# --- CITY & RECIPE VIEWS ---
@api_view(['GET'])
@permission_classes([AllowAny])
def city_list(request):
    cities = City.objects.all()
    serializer = CitySerializer(cities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def GetRecipesByCity(request):
    """
    Handle city-based filtering with proper serializer context for images.
    """
    city_name = request.query_params.get('city')
    city_id = request.query_params.get('city_id')

    if city_name:
        recipes = Recipe.objects.filter(city__name__iexact=city_name)
    elif city_id:
        recipes = Recipe.objects.filter(city_id=city_id)
    else:
        recipes = Recipe.objects.all()

    # context={'request': request} is CRITICAL for absolute image URLs
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
    # Random recipes for discovery
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

# --- AI SUBSTITUTE VIEW ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_ai_substitute(request, pk=None):
    recipe_title = request.data.get('recipe_title')
    ingredient_to_replace = request.data.get('ingredient')
    
    if not ingredient_to_replace:
        return Response({'error': 'Ingredient name required'}, status=400)
    
    if pk and str(pk).isdigit():
        recipe = get_object_or_404(Recipe, pk=pk)
        recipe_title = recipe.title
    elif not recipe_title:
        return Response({'error': 'Recipe identifier required'}, status=400)
    
    if not groq_client:
        return Response({'error': 'Groq Client not configured'}, status=503)
    
    prompt = f"In the recipe '{recipe_title}', what is a good Pakistani substitute for '{ingredient_to_replace}'? Keep response brief, authentic to Pakistani cooking, and helpful."
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.5,
            max_tokens=150
        )
        substitute = chat_completion.choices[0].message.content
        return Response({'substitute': substitute})
    except Exception as e:
        return Response({'error': f'AI service error: {str(e)}'}, status=500)

# --- AI RECIPE DETAIL VIEW ---
@api_view(['GET'])
@permission_classes([AllowAny])
def get_ai_recipe_detail(request, recipe_title):
    recipe_title = unquote(recipe_title).replace('-', ' ').title()

    if not recipe_title or len(recipe_title.strip()) < 2:
        return Response({'error': 'Invalid recipe title'}, status=400)

    if not groq_client:
        return Response({'error': 'AI service not configured'}, status=503)

    prompt = f"""
    Generate a detailed Pakistani recipe for "{recipe_title}".
    Return ONLY valid JSON with this exact structure:
    {{
        "title": "{recipe_title}",
        "description": "Brief description",
        "ingredients": "Each ingredient on a new line",
        "instructions": "Each step on a new line",
        "prep_time": "30",
        "kcal": "450",
        "cuisine": "Pakistani",
        "dietary_type": "veg or non_veg",
        "spice_level": "Mild/Medium/Hot"
    }}
    """

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional Pakistani chef. Respond ONLY with valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            response_format={ "type": "json_object" }
        )

        response_text = completion.choices[0].message.content.strip()
        recipe_data = json.loads(response_text)
        
        recipe_data['youtube_video_id'] = fetch_youtube_video_id(recipe_title)
        recipe_data['is_ai_generated'] = True
        recipe_data['is_saved'] = False

        if request.user.is_authenticated:
            existing_recipe = Recipe.objects.filter(title__iexact=recipe_title).first()
            if existing_recipe:
                recipe_data['is_saved'] = SavedRecipe.objects.filter(
                    user=request.user,
                    recipe=existing_recipe
                ).exists()

        return Response(recipe_data)

    except Exception as e:
        return Response({'error': f"AI Recipe Error: {str(e)}"}, status=500)

# --- BOOKMARK VIEWS ---
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

# --- MEAL PLANNER VIEWS ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_and_save_meal_plan(request):
    if not groq_client:
        return Response({'error': 'AI Service not configured'}, status=503)

    try:
        selected_health = request.data.get('health_condition', 'balanced')
        selected_diet = request.data.get('dietary_preference', 'both')
        
        dessert_instruction = "Strictly NO sugar." if selected_health == 'diabetes' else "Include traditional dessert 2-3 times a week."

        prompt = f"""
        Create a 7-day Pakistani meal plan for a person with {selected_health} health condition and {selected_diet} dietary preference.
        {dessert_instruction}
        Return ONLY valid JSON with a 'weekly_plan' key containing an array of 7 day objects.
        Each object: {{"day": "Day Name", "breakfast": "...", "lunch": "...", "dinner": "...", "calories": "..."}}
        """

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional Pakistani nutritionist. Respond ONLY in JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            response_format={ "type": "json_object" }
        )

        response_text = completion.choices[0].message.content.strip()
        data = json.loads(response_text)
        weekly_plan = data.get('weekly_plan', [])

        # Deactivate previous active plans
        SavedMealPlan.objects.filter(user=request.user, is_active=True).update(is_active=False)
        
        saved_plan = SavedMealPlan.objects.create(
            user=request.user, 
            weekly_plan=weekly_plan,
            health_condition=selected_health, 
            dietary_preference=selected_diet, 
            is_active=True
        )

        return Response({'weekly_plan': weekly_plan, 'plan_id': saved_plan.id}, status=201)
    except Exception as e:
        return Response({'error': f'Meal plan generation failed: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_meal_plan(request):
    plan = SavedMealPlan.objects.filter(user=request.user, is_active=True).order_by('-created_at').first()
    if plan:
        # Auto-expire plans older than 7 days
        if timezone.now() > plan.created_at + timedelta(days=7):
            plan.is_active = False
            plan.save()
            return Response({'message': 'Expired'}, status=404)
        return Response({'weekly_plan': plan.weekly_plan, 'plan_id': plan.id})
    return Response({'message': 'No active plan'}, status=404)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_meal_plan(request):
    return generate_and_save_meal_plan(request)

@api_view(['GET'])
def health_check(request):
    return Response({"status": "healthy"}, status=200)