import os
import traceback
import google.generativeai as genai
from django.conf import settings
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import City, Recipe, SavedRecipe, UserProfile
from .serializers import (
    CitySerializer,
    RecipeDetailSerializer,
    RecipeListSerializer,
    SavedRecipeSerializer,
    UserSerializer,
)

# ─── AI Configuration ────────────────────────────────────────────────────────
# Note: Apni API Key settings.py mein GEMINI_API_KEY ke naam se save karein
# Ya phir yahan direct string mein paste kar dein (not recommended for production)
GEMINI_KEY = getattr(settings, "GEMINI_API_KEY", "AIzaSyDGy_BXHFOS2aNKQ4trOR6SLmXCeveOCEg")
genai.configure(api_key=GEMINI_KEY)

@api_view(['POST'])
@permission_classes([AllowAny])
def get_ai_substitute(request, pk):
    """
    Recipe ID aur ingredient lekar AI se substitute mangwata hai.
    """
    recipe = get_object_or_404(Recipe, pk=pk)
    ingredient_to_replace = request.data.get('ingredient', '').strip()
    
    if not ingredient_to_replace:
        return Response({"error": "Please provide an ingredient name."}, status=status.HTTP_400_BAD_REQUEST)

    # AI Prompt: Isse AI ko recipe ka context milta hai
    prompt = f"""
    You are a professional Pakistani Chef. 
    Recipe: {recipe.title}
    Ingredients: {recipe.ingredients}
    
    User is missing this ingredient: '{ingredient_to_replace}'.
    
    Task: Suggest the best culinary substitute for '{ingredient_to_replace}' in this specific dish. 
    Keep the answer short, practical, and mention if it will slightly change the taste.
    Answer in 1-2 clear sentences.
    """

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        ai_suggestion = response.text
        
        return Response({
            "ingredient": ingredient_to_replace,
            "substitute": ai_suggestion
        })
    except Exception as e:
        # Fallback: Agar AI fail ho jaye toh Model mein mojood substitutions check karein
        fallback_sub = recipe.substitutions.get(ingredient_to_replace.lower(), "No substitute found. Try PandaMart!")
        return Response({
            "ingredient": ingredient_to_replace,
            "substitute": fallback_sub,
            "note": "AI is busy, showing database fallback."
        })

# ─── Auth Views ────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            UserProfile.objects.create(
                user=user,
                health_conditions=request.data.get('health_conditions', []),
                dietary_preferences=request.data.get('dietary_preferences', [])
            )
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {"token": token.key, "message": "User registered successfully!"},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print("ERROR:", traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
            "user": {"first_name": user.first_name, "email": user.email}
        }, status=status.HTTP_200_OK)

    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    try:
        profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            "first_name": user.first_name,
            "email": user.email,
            "health_conditions": profile.health_conditions,
            "dietary_preferences": profile.dietary_preferences
        })

    if request.method == 'PUT':
        user.first_name = request.data.get('first_name', user.first_name)
        user.save()

        health = request.data.get('health_conditions')
        diet = request.data.get('dietary_preferences')
        if health is not None:
            profile.health_conditions = health
        if diet is not None:
            profile.dietary_preferences = diet
        profile.save()

        return Response({"message": "Profile updated successfully!", "status": "success"})


# ─── City Views ────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def city_list(request):
    cities = City.objects.all().order_by('name')
    serializer = CitySerializer(cities, many=True)
    return Response(serializer.data)


# ─── Recipe Views ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def GetRecipesByCity(request):
    city_name = request.query_params.get('city')
    
    if not city_name:
        return Response(
            {"error": "Please provide ?city=CityName query param."},
            status=status.HTTP_400_BAD_REQUEST
        )

    city = get_object_or_404(City, name__iexact=city_name)
    recipes = Recipe.objects.filter(city=city)
    recipe_serializer = RecipeListSerializer(
        recipes, many=True, context={'request': request}
    )

    return Response({
        "city": CitySerializer(city).data,
        "pandamart_alert": not city.is_pandamart_available,
        "recipes": recipe_serializer.data 
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def recipe_detail(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    serializer = RecipeDetailSerializer(recipe, context={'request': request})
    return Response(serializer.data)


# ─── Bookmark / SavedRecipe Views ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, recipe_id):
    recipe = get_object_or_404(Recipe, pk=recipe_id)
    saved_obj = SavedRecipe.objects.filter(user=request.user, recipe=recipe).first()

    if saved_obj:
        saved_obj.delete()
        return Response({"saved": False, "message": f"'{recipe.title}' removed from saved."})
    else:
        SavedRecipe.objects.create(user=request.user, recipe=recipe)
        return Response({"saved": True, "message": f"'{recipe.title}' saved successfully!"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_recipes(request):
    saved = SavedRecipe.objects.filter(user=request.user).select_related('recipe')
    serializer = SavedRecipeSerializer(saved, many=True)
    return Response({
        "count": saved.count(),
        "results": serializer.data
    })