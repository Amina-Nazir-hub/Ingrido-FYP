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
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY") or "AIzaSyByBTRLlawcXiiIznJh8rprwrSymEmv8Gc"
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
GROCERY_STORE_URL = "https://www.foodpanda.pk/brand/pandamart"

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
        return Response({'token': token.key, 'user_id': user.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user_id': user.id}, status=200)
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
def city_list(request):
    cities = City.objects.all()
    serializer = CitySerializer(cities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def GetRecipesByCity(request):
    city_id = request.query_params.get('city_id')
    if city_id:
        recipes = Recipe.objects.filter(city_id=city_id)
    else:
        recipes = Recipe.objects.all()
    serializer = RecipeListSerializer(recipes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_dashboard_recipes(request):
    recipes = Recipe.objects.all().order_by('?')[:12]
    serializer = RecipeListSerializer(recipes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def recipe_detail(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    serializer = RecipeDetailSerializer(recipe)
    video_id = fetch_youtube_video_id(recipe.title)
    data = serializer.data
    data['youtube_video_id'] = video_id
    data['grocery_url'] = GROCERY_STORE_URL
    return Response(data)

# --- AI SUBSTITUTE VIEW ---
@api_view(['POST'])
def get_ai_substitute(request, pk=None):
    """
    Get AI substitute for an ingredient.
    Supports:
    - Database recipes by ID (pk)
    - AI-generated recipes by title (recipe_title in request body)
    """
    recipe_title = request.data.get('recipe_title')
    ingredient_to_replace = request.data.get('ingredient')
    
    # Validate ingredient
    if not ingredient_to_replace:
        return Response({'error': 'Ingredient name required'}, status=400)
    
    # Get recipe title from either pk or request body
    if pk and str(pk).isdigit():
        # Database recipe by ID
        recipe = get_object_or_404(Recipe, pk=pk)
        recipe_title = recipe.title
    elif recipe_title:
        # AI-generated recipe by title
        recipe_title = recipe_title
    else:
        return Response({'error': 'Recipe identifier required (either pk or recipe_title)'}, status=400)
    
    # Check Groq client
    if not groq_client:
        return Response({'error': 'Groq Client not configured'}, status=500)
    
    # Generate substitute suggestion
    prompt = f"In the recipe '{recipe_title}', what is a good Pakistani substitute for '{ingredient_to_replace}'? Keep response brief and helpful (max 2 sentences)."
    
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
    """
    Get details for an AI-generated recipe by title
    """
    # Decode URL-encoded title and format it properly
    recipe_title = unquote(recipe_title).replace('-', ' ').title()
    
    # Validate title isn't empty
    if not recipe_title or len(recipe_title.strip()) < 2:
        return Response({'error': 'Invalid recipe title'}, status=400)
    
    if not groq_client:
        return Response({'error': 'AI service not configured'}, status=500)
    
    prompt = f"""
    Generate a detailed Pakistani recipe for "{recipe_title}".
    
    Return ONLY valid JSON with this exact structure:
    {{
        "title": "{recipe_title}",
        "description": "Brief description of the dish (1-2 sentences)",
        "ingredients": "List of ingredients, each on a new line",
        "instructions": "Step by step cooking instructions, each step on a new line",
        "prep_time": "Time in minutes as number only",
        "kcal": "Calories per serving as number only",
        "cuisine": "Pakistani",
        "dietary_type": "veg or non_veg or mixed",
        "spice_level": "Mild/Medium/Hot"
    }}
    
    Make it authentic and detailed.
    """
    
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional Pakistani chef. Respond ONLY with valid JSON, no other text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Extract JSON
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            return Response({'error': 'Failed to generate recipe'}, status=500)
        
        recipe_data = json.loads(json_match.group())
        
        # Get YouTube video ID
        video_id = fetch_youtube_video_id(recipe_title)
        recipe_data['youtube_video_id'] = video_id
        recipe_data['grocery_url'] = GROCERY_STORE_URL
        recipe_data['is_ai_generated'] = True
        
        return Response(recipe_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- BOOKMARK VIEWS ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    bookmark, created = SavedRecipe.objects.get_or_create(user=request.user, recipe=recipe)
    if not created:
        bookmark.delete()
        return Response({'status': 'removed'})
    return Response({'status': 'saved'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_recipes(request):
    bookmarks = SavedRecipe.objects.filter(user=request.user)
    serializer = SavedRecipeSerializer(bookmarks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def health_check(request):
    return Response({"status": "healthy"}, status=200)

# --- MEAL PLANNER VIEWS ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_and_save_meal_plan(request):
    try:
        selected_health = request.data.get('health_condition', 'balanced')
        selected_diet = request.data.get('dietary_preference', 'both')

        dessert_instruction = ""
        if selected_health != 'diabetes':
            dessert_instruction = "Include a traditional Pakistani dessert (e.g., Kheer, Sooji Halwa) 2-3 times a week."
        else:
            dessert_instruction = "Strictly NO sugar or desserts."

        prompt = f"""
        Create a 7-day Pakistani meal plan JSON for a {selected_health} patient who prefers {selected_diet} food.
        GUIDELINES:
        1. Authentic Pakistani dishes only.
        2. Include snacks (Pakoras, Chaat), Pasta, or Sandwiches for lunch/dinner side.
        3. DESSERTS: {dessert_instruction}
        4. STRUCTURE: Respond ONLY with a valid JSON. Use keys: "weekly_plan", "day", "breakfast", "lunch", "dinner", "title", "description", "calories", "prep_time".
        """

        if not groq_client:
            return Response({'error': 'Groq client not initialized'}, status=500)

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional Pakistani nutritionist. Respond ONLY in JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4
        )

        response_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        
        if not json_match:
            return Response({'error': 'AI failed to generate valid JSON'}, status=500)
            
        data = json.loads(json_match.group())
        weekly_plan = data.get('weekly_plan', [])

        SavedMealPlan.objects.filter(user=request.user, is_active=True).update(is_active=False)

        saved_plan = SavedMealPlan.objects.create(
            user=request.user,
            weekly_plan=weekly_plan,
            health_condition=selected_health,
            dietary_preference=selected_diet,
            is_active=True
        )

        return Response({
            'weekly_plan': weekly_plan,
            'plan_id': saved_plan.id
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

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
    try:
        plan = SavedMealPlan.objects.get(id=plan_id, user=request.user)
        plan.delete()
        return Response({'message': 'Meal plan deleted'}, status=200)
    except SavedMealPlan.DoesNotExist:
        return Response({'error': 'Plan not found'}, status=404)

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