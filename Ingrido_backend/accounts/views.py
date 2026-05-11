import os
import requests
import random
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

from .models import Recipe, City, SavedRecipe, UserProfile
from .serializers import (
    RecipeDetailSerializer,
    CitySerializer,
    RecipeListSerializer,
    SavedRecipeSerializer,
    UserSerializer
)

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY") or "AIzaSyByBTRLlawcXiiIznJh8rprwrSymEmv8Gc"
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
GROCERY_STORE_URL = "https://www.foodpanda.pk/brand/pandamart"

# --- HELPERS ---
def fetch_youtube_video_id(recipe_title):
    if not YOUTUBE_API_KEY: return None
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {'part': 'snippet', 'q': f"{recipe_title} recipe", 'key': YOUTUBE_API_KEY, 'maxResults': 1, 'type': 'video'}
    try:
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        if "items" in data: return data["items"][0]["id"]["videoId"]
    except: return None

def generate_and_save_ai_image(recipe_obj):
    try:
        prompt = f"Professional food photography of {recipe_obj.title}, Pakistani cuisine, 4k"
        encoded_prompt = requests.utils.quote(prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"
        response = requests.get(image_url, timeout=30)
        if response.status_code == 200:
            file_name = f"ai_{recipe_obj.id}.jpg"
            recipe_obj.image.save(file_name, ContentFile(response.content), save=True)
            return True
    except: return False

# --- VIEWS ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        UserProfile.objects.get_or_create(user=user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": {"id": user.id, "email": user.email, "first_name": user.first_name or user.username}})
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if request.method == 'GET':
        return Response({"id": user.id, "first_name": user.first_name, "email": user.email, "health_conditions": profile.health_conditions, "dietary_preferences": profile.dietary_preferences})
    user.first_name = request.data.get('first_name', user.first_name)
    user.save()
    profile.health_conditions = request.data.get('health_conditions', profile.health_conditions)
    profile.dietary_preferences = request.data.get('dietary_preferences', profile.dietary_preferences)
    profile.save()
    return Response({"message": "Profile updated!"})

@api_view(['GET'])
@permission_classes([AllowAny])
def GetRecipesByCity(request):
    city_name = request.query_params.get('city')
    search_query = request.query_params.get('search')
    if search_query:
        search_query = search_query.strip().lower()
        exact_title = Recipe.objects.filter(title__iexact=search_query)
        if exact_title.exists():
            recipes = exact_title
        else:
            keywords = [word.strip() for word in search_query.replace(',', ' ').split() if len(word) > 2]
            results = Recipe.objects.all()
            for word in keywords:
                results = results.filter(Q(title__icontains=word) | Q(ingredients__icontains=word))
            recipes = results.distinct()
    elif city_name:
        recipes = Recipe.objects.filter(city__name__iexact=city_name)
    else:
        recipes = Recipe.objects.all()
    serializer = RecipeListSerializer(recipes, many=True, context={'request': request})
    if city_name:
        city = City.objects.filter(name__iexact=city_name).first()
        return Response({"city": CitySerializer(city).data if city else None, "recipes": serializer.data, "pandamart_alert": not city.is_pandamart_available if city else False})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def recipe_detail(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    if not recipe.image: generate_and_save_ai_image(recipe)
    if not getattr(recipe, 'youtube_video_id', None):
        video_id = fetch_youtube_video_id(recipe.title)
        if video_id: recipe.youtube_video_id = video_id; recipe.save()
    return Response(RecipeDetailSerializer(recipe, context={'request': request}).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def get_ai_substitute(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    ingredient = request.data.get('ingredient', '').strip()
    if not groq_client: return Response({"error": "AI not configured"}, status=500)
    try:
        prompt = f"In the recipe '{recipe.title}', what is a good substitute for '{ingredient}'? Short Pakistani chef advice."
        completion = groq_client.chat.completions.create(model="llama-3.1-8b-instant", messages=[{"role": "user", "content": prompt}], temperature=0.6, max_tokens=150)
        return Response({"substitute": completion.choices[0].message.content.strip(), "grocery_url": GROCERY_STORE_URL, "status": "success"})
    except Exception as e: return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, recipe_id):
    recipe = get_object_or_404(Recipe, pk=recipe_id)
    saved_obj = SavedRecipe.objects.filter(user=request.user, recipe=recipe).first()
    if saved_obj: saved_obj.delete(); return Response({"saved": False})
    SavedRecipe.objects.create(user=request.user, recipe=recipe); return Response({"saved": True})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_recipes(request):
    saved = SavedRecipe.objects.filter(user=request.user)
    return Response(SavedRecipeSerializer(saved, many=True, context={'request': request}).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def city_list(request):
    return Response(CitySerializer(City.objects.all().order_by('name'), many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_dashboard_recipes(request):
    recipes = list(Recipe.objects.all())
    sampled_recipes = random.sample(recipes, min(len(recipes), 6))
    for r in sampled_recipes:
        if not r.image: generate_and_save_ai_image(r)
    return Response(RecipeListSerializer(sampled_recipes, many=True, context={'request': request}).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy", "groq": bool(GROQ_API_KEY)})