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

print("===================================")
print("GROQ API Status:", "Connected" if GROQ_API_KEY else "Not Configured")
if GROQ_API_KEY:
    print("API Key (first 10 chars):", GROQ_API_KEY[:10])
print("===================================")

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# ─────────────────────────────────────────────
# PURE AI SUBSTITUTE - No hardcoded data
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def get_ai_substitute(request, pk):
    
    recipe = get_object_or_404(Recipe, pk=pk)
    ingredient = request.data.get('ingredient', '').strip()

    if not ingredient:
        return Response({"error": "Ingredient name missing"}, status=400)

    if not groq_client:
        return Response({
            "error": "GROQ_API_KEY not configured. Please add to .env file",
            "setup_url": "https://console.groq.com",
            "status": "error"
        }, status=500)

    try:
        # Pure AI prompt - AI will read recipe and decide
        prompt = f"""You are a professional Pakistani chef giving practical advice.

RECIPE NAME: {recipe.title}

FULL INGREDIENTS LIST:
{recipe.ingredients}

USER ASKS: "I don't have {ingredient}. What should I do?"

YOUR JOB:
1. First, check if "{ingredient}" is in the ingredients list above.

2. If {ingredient} is NOT in the list:
   Reply: "This ingredient is not used in {recipe.title}. You don't need it. Just follow the recipe as written."

3. If {ingredient} IS in the list:
   - If it's ESSENTIAL (onion, garlic, ginger, tomato, chicken, beef, mutton, salt, oil, ghee, rice, flour, green chili, red chili, turmeric, cumin):
     Reply: "{ingredient} is essential for {recipe.title}. Please buy it from any grocery store."

   - If it's NOT ESSENTIAL (like optional spice, garnish, or can be substituted):
     Suggest 1-2 practical substitutes that work in Pakistani cooking.

EXAMPLES:
- For "green chili" when it's essential: "Green chili is essential for the heat in this dish. Please buy fresh green chilies from any store."
- For "green chili" when optional: "Green chili adds heat. You can use red chili powder (1/4 tsp per chili) or skip it."
- For "cream" when optional: "Use fresh malai or full-fat coconut milk instead of cream."
- For "onion": "Onion is essential. Please buy fresh onions."
- For "turmeric": "Turmeric is essential for color and flavor. Please buy from store - it's very cheap."

Keep response SHORT (1-2 sentences). Be honest and practical.

Your response:"""

        print("===================================")
        print(f"🍽️ Recipe: {recipe.title}")
        print(f"🥕 User missing: {ingredient}")
        print("🤖 Asking AI...")
        print("===================================")

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an honest Pakistani chef. Read the recipe ingredients carefully. Tell users to buy only truly essential ingredients. For non-essential items, suggest practical substitutes. Never say 'buy it' for everything. Be specific and helpful."},
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
            "recipe": recipe.title,
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


# ─────────────────────────────────────────────
# USER AUTHENTICATION
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        UserProfile.objects.get_or_create(user=user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "message": "User registered successfully!"}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)
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
    if request.method == 'GET':
        profile, _ = UserProfile.objects.get_or_create(user=user)
        return Response({
            "id": user.id,
            "first_name": user.first_name,
            "email": user.email,
            "health_conditions": profile.health_conditions,
            "dietary_preferences": profile.dietary_preferences,
        })
    first_name = request.data.get('first_name')
    if first_name:
        user.first_name = first_name
        user.save()
    return Response({"message": "Profile updated!"})

# ─────────────────────────────────────────────
# CITY & RECIPES
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def city_list(request):
    cities = City.objects.all().order_by('name')
    return Response(CitySerializer(cities, many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def GetRecipesByCity(request):
    city_name = request.query_params.get('city')
    if not city_name:
        return Response({"error": "City parameter required"}, status=400)
    city = get_object_or_404(City, name__iexact=city_name)
    recipes = Recipe.objects.filter(city=city)
    return Response({
        "city": CitySerializer(city).data,
        "recipes": RecipeListSerializer(recipes, many=True, context={'request': request}).data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def recipe_detail(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    return Response(RecipeDetailSerializer(recipe, context={'request': request}).data)

# ─────────────────────────────────────────────
# BOOKMARKS / SAVED RECIPES
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, recipe_id):
    recipe = get_object_or_404(Recipe, pk=recipe_id)
    saved_obj = SavedRecipe.objects.filter(user=request.user, recipe=recipe).first()
    if saved_obj:
        saved_obj.delete()
        return Response({"saved": False, "message": "Removed from bookmarks"})
    else:
        SavedRecipe.objects.create(user=request.user, recipe=recipe)
        return Response({"saved": True, "message": "Saved to bookmarks"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_recipes(request):
    saved = SavedRecipe.objects.filter(user=request.user).select_related('recipe')
    return Response({
        "count": saved.count(),
        "results": SavedRecipeSerializer(saved, many=True, context={'request': request}).data
    })

# ─────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        "status": "healthy",
        "groq_configured": bool(GROQ_API_KEY),
        "message": "Pure AI - AI reads recipe and decides what to suggest"
    })