from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
import traceback

from .serializers import (
    UserSerializer, CitySerializer,
    RecipeListSerializer, RecipeDetailSerializer,
    SavedRecipeSerializer
)
from .models import UserProfile, City, Recipe, SavedRecipe

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
    """
    GET /api/accounts/recipes/?city=Karachi
    Ye function City ke mutabiq recipes filter kar ke bhejta hai.
    """
    city_name = request.query_params.get('city')
    
    if not city_name:
        return Response(
            {"error": "Please provide ?city=CityName query param."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # City dhoondna (e.g. Karachi, Multan)
    city = get_object_or_404(City, name__iexact=city_name)
    
    # Us city se linked saari recipes filter karna
    recipes = Recipe.objects.filter(city=city)
    
    # Recipe list ko serialize karna
    recipe_serializer = RecipeListSerializer(
        recipes, many=True, context={'request': request}
    )

    # Frontend DishesListPage ke format ke mutabiq response
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