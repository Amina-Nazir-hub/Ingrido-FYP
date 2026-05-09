from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from dotenv import load_dotenv
import os
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
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# ─── AI SUBSTITUTE ───
@api_view(['POST'])
@permission_classes([AllowAny])
def get_ai_substitute(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    ingredient = request.data.get('ingredient', '').strip()

    if not ingredient:
        return Response({"error": "Ingredient name missing"}, status=400)

    if not groq_client:
        return Response({"error": "GROQ_API_KEY not configured"}, status=500)

    try:
        prompt = f"""You are a professional Pakistani chef.
        RECIPE: {recipe.title}
        INGREDIENTS: {recipe.ingredients}
        USER MISSING: {ingredient}
        
        If {ingredient} is not in list, say it's not needed. 
        If essential (meat, oil, basic spices), tell them to buy it.
        If non-essential, suggest 1-2 Pakistani substitutes.
        Keep it 1-2 sentences."""

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful Pakistani chef."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=200
        )
        return Response({
            "ingredient": ingredient,
            "recipe": recipe.title,
            "substitute": completion.choices[0].message.content.strip(),
            "status": "success"
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ─── AUTHENTICATION ───
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        UserProfile.objects.get_or_create(user=user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "message": "User registered!"}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key, 
            "user": {"id": user.id, "email": user.email, "first_name": user.first_name}
        })
    return Response({"error": "Invalid credentials"}, status=401)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if request.method == 'GET':
        return Response({
            "id": user.id,
            "first_name": user.first_name,
            "email": user.email,
            "health_conditions": profile.health_conditions,
            "dietary_preferences": profile.dietary_preferences,
        })
    user.first_name = request.data.get('first_name', user.first_name)
    user.save()
    return Response({"message": "Profile updated!"})

# ─── RECIPES & CITIES ───
@api_view(['GET'])
@permission_classes([AllowAny])
def city_list(request):
    cities = City.objects.all().order_by('name')
    return Response(CitySerializer(cities, many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def GetRecipesByCity(request):
    city_name = request.query_params.get('city')
    search_query = request.query_params.get('search')

    if search_query:
        recipes = Recipe.objects.filter(title__icontains=search_query)
        return Response(RecipeListSerializer(recipes, many=True, context={'request': request}).data)

    if city_name:
        city = get_object_or_404(City, name__iexact=city_name)
        recipes = Recipe.objects.filter(city=city)
        return Response({
            "city": CitySerializer(city).data,
            "pandamart_alert": not city.is_pandamart_available,
            "recipes": RecipeListSerializer(recipes, many=True, context={'request': request}).data
        })
    return Response({"error": "Provide city or search parameter"}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def recipe_detail(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    return Response(RecipeDetailSerializer(recipe, context={'request': request}).data)

# ─── BOOKMARKS ───
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, recipe_id):
    recipe = get_object_or_404(Recipe, pk=recipe_id)
    saved_obj = SavedRecipe.objects.filter(user=request.user, recipe=recipe).first()
    if saved_obj:
        saved_obj.delete()
        return Response({"saved": False, "message": "Removed"})
    SavedRecipe.objects.create(user=request.user, recipe=recipe)
    return Response({"saved": True, "message": "Saved"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_recipes(request):
    saved = SavedRecipe.objects.filter(user=request.user).select_related('recipe')
    return Response({
        "count": saved.count(),
        "results": SavedRecipeSerializer(saved, many=True, context={'request': request}).data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy", "groq": bool(GROQ_API_KEY)})