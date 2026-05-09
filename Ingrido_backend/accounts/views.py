import os
import requests
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
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

# ─── ENVIRONMENT SETUP ─────────────────────────────────────────────
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# YouTube API Key from .env or fallback
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY") or "AIzaSyByBTRLlawcXiiIznJh8rprwrSymEmv8Gc"

print("===================================")
print("GROQ API Status:", "Connected" if GROQ_API_KEY else "Not Configured")
print("YouTube API Status:", "Active" if YOUTUBE_API_KEY else "Not Configured")
print("===================================")

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Grocery store URL
GROCERY_STORE_URL = "https://www.foodpanda.pk/brand/pandamart"


# ─── HELPER FUNCTION: YOUTUBE VIDEO FETCHING ───────────────────────
def fetch_youtube_video_id(recipe_title):
    """
    YouTube Data API se recipe title ke mutabiq video search karke ID deta hai.
    """
    if not YOUTUBE_API_KEY:
        return None
    
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        'part': 'snippet',
        'q': f"{recipe_title} authentic Pakistani recipe step by step",
        'key': YOUTUBE_API_KEY,
        'maxResults': 1,
        'type': 'video',
        'videoEmbeddable': 'true'
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        if "items" in data and len(data["items"]) > 0:
            return data["items"][0]["id"]["videoId"]
    except Exception as e:
        print(f"YouTube API Error: {e}")
    return None


# ─── HELPER FUNCTION: AI IMAGE GENERATION (FREE) ───────────────────
def generate_and_save_ai_image(recipe_obj):
    """
    Pollinations AI se free image generate karke
    recipe.image field mein permanently save karta hai.
    """
    try:
        prompt = (
            f"Professional food photography of {recipe_obj.title}, "
            f"authentic Pakistani cuisine, high resolution, 4k, cinematic lighting"
        )
        encoded_prompt = requests.utils.quote(prompt)
        image_url = (
            f"https://image.pollinations.ai/prompt/{encoded_prompt}"
            f"?width=1024&height=1024&nologo=true&enhance=true"
        )

        response = requests.get(image_url, timeout=30)

        if response.status_code == 200:
            file_name = f"ai_{recipe_obj.id}.jpg"
            recipe_obj.image.save(
                file_name,
                ContentFile(response.content),
                save=True
            )
            return True

    except Exception as e:
        print(f"AI Image Generation Error for {recipe_obj.title}: {e}")

    return False


# ─── USER AUTHENTICATION ───────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        UserProfile.objects.get_or_create(user=user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data,
            "message": "User registered successfully!"
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({"error": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": {"id": user.id, "email": user.email, "first_name": user.first_name}
        })
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


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
    
    first_name = request.data.get('first_name')
    if first_name:
        user.first_name = first_name
        user.save()
    return Response({"message": "Profile updated!"})


# ─── CITY & RECIPES ────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def city_list(request):
    cities = City.objects.all().order_by('name')
    serializer = CitySerializer(cities, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def GetRecipesByCity(request):
    city_name = request.query_params.get('city')

    if city_name:
        recipes = Recipe.objects.filter(city__name__iexact=city_name)
    else:
        recipes = Recipe.objects.all()

    for recipe in recipes:
        if not recipe.image:
            generate_and_save_ai_image(recipe)

    serializer = RecipeListSerializer(
        recipes,
        many=True,
        context={'request': request}
    )

    if city_name:
        city = City.objects.filter(name__iexact=city_name).first()
        if city:
            return Response({
                "city": CitySerializer(city).data,
                "recipes": serializer.data
            })

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def recipe_detail(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)

    # 1. AI Image Check
    if not recipe.image:
        generate_and_save_ai_image(recipe)
        recipe.refresh_from_db()

    # 2. YouTube Video Check
    if not getattr(recipe, 'youtube_video_id', None):
        video_id = fetch_youtube_video_id(recipe.title)
        if video_id:
            recipe.youtube_video_id = video_id
            recipe.save()

    serializer = RecipeDetailSerializer(recipe, context={'request': request})
    return Response(serializer.data)


# ─── AI SUBSTITUTE (With Grocery Link) ─────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def get_ai_substitute(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    ingredient = request.data.get('ingredient', '').strip()

    if not ingredient:
        return Response({"error": "Ingredient name missing"}, status=400)

    if not groq_client:
        return Response({"error": "GROQ_API_KEY not configured."}, status=500)

    try:
        # Prompt adjusted to include [GROCERY] tag for essential items
        prompt = f"""You are a professional Pakistani chef.
RECIPE NAME: {recipe.title}
FULL INGREDIENTS LIST:
{recipe.ingredients}

USER ASKS: "I don't have {ingredient}. What should I do?"

YOUR JOB:
1. Check if "{ingredient}" is in the list. If not, say it's not needed.
2. If it is ESSENTIAL (meat, salt, oil, onion, ginger, garlic, main spices), reply: "{ingredient} is essential for {recipe.title}. Please order it from [GROCERY]."
3. If it can be substituted, suggest ONE practical Pakistani substitute.

Keep response ONE sentence only.
Your response:"""

        print("===================================")
        print(f"🍽️ Recipe: {recipe.title} | Missing: {ingredient}")
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful Pakistani chef. Be short and honest."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=150
        )
        
        ai_response = completion.choices[0].message.content.strip()
        has_grocery_link = "[GROCERY]" in ai_response
        
        print(f"✅ AI Response: {ai_response}")
        print("===================================")
        
        return Response({
            "ingredient": ingredient,
            "recipe": recipe.title,
            "substitute": ai_response,
            "has_grocery_link": has_grocery_link,
            "grocery_url": GROCERY_STORE_URL if has_grocery_link else None,
            "status": "success",
            "provider": "Groq AI"
        })
        
    except Exception as e:
        return Response({"error": str(e), "status": "error"}, status=500)


# ─── BOOKMARKS / SAVED RECIPES ────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, recipe_id):
    recipe = get_object_or_404(Recipe, pk=recipe_id)
    saved_obj = SavedRecipe.objects.filter(user=request.user, recipe=recipe).first()

    if saved_obj:
        saved_obj.delete()
        return Response({"saved": False, "message": "Removed from bookmarks"})

    SavedRecipe.objects.create(user=request.user, recipe=recipe)
    return Response({ "saved": True, "message": "Saved to bookmarks" })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_recipes(request):
    saved = SavedRecipe.objects.filter(user=request.user).select_related('recipe')
    serializer = SavedRecipeSerializer(saved, many=True, context={'request': request})
    return Response({
        "count": saved.count(),
        "results": serializer.data
    })


# ─── HEALTH CHECK ─────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        "status": "healthy",
        "groq_configured": bool(GROQ_API_KEY),
        "youtube_api": "active",
        "message": "Backend with YouTube & Grocery support is running."
    })