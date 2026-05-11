import os
import requests
import random
import json
from datetime import datetime
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

# ========== AUTH VIEWS ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    print("📍 Register endpoint hit")
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        UserProfile.objects.get_or_create(user=user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    print(f"❌ Register errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    print("📍 Login endpoint hit")
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": {"id": user.id, "email": user.email, "first_name": user.first_name or user.username}})
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# ========== PROFILE VIEW ==========
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
            "dietary_preferences": profile.dietary_preferences
        })
    user.first_name = request.data.get('first_name', user.first_name)
    user.save()
    profile.health_conditions = request.data.get('health_conditions', profile.health_conditions)
    profile.dietary_preferences = request.data.get('dietary_preferences', profile.dietary_preferences)
    profile.save()
    return Response({"message": "Profile updated!"})

# ========== RECIPE VIEWS ==========
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
        return Response({
            "city": CitySerializer(city).data if city else None, 
            "recipes": serializer.data, 
            "pandamart_alert": not city.is_pandamart_available if city else False
        })
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def recipe_detail(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    if not recipe.image: 
        generate_and_save_ai_image(recipe)
    if not getattr(recipe, 'youtube_video_id', None):
        video_id = fetch_youtube_video_id(recipe.title)
        if video_id: 
            recipe.youtube_video_id = video_id
            recipe.save()
    return Response(RecipeDetailSerializer(recipe, context={'request': request}).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def get_ai_substitute(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    ingredient = request.data.get('ingredient', '').strip()
    if not groq_client: 
        return Response({"error": "AI not configured"}, status=500)
    try:
        prompt = f"In the recipe '{recipe.title}', what is a good substitute for '{ingredient}'? Short Pakistani chef advice."
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant", 
            messages=[{"role": "user", "content": prompt}], 
            temperature=0.6, 
            max_tokens=150
        )
        return Response({
            "substitute": completion.choices[0].message.content.strip(), 
            "grocery_url": GROCERY_STORE_URL, 
            "status": "success"
        })
    except Exception as e: 
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, recipe_id):
    recipe = get_object_or_404(Recipe, pk=recipe_id)
    saved_obj = SavedRecipe.objects.filter(user=request.user, recipe=recipe).first()
    if saved_obj: 
        saved_obj.delete()
        return Response({"saved": False})
    SavedRecipe.objects.create(user=request.user, recipe=recipe)
    return Response({"saved": True})

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
        if not r.image: 
            generate_and_save_ai_image(r)
    return Response(RecipeListSerializer(sampled_recipes, many=True, context={'request': request}).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy", "groq": bool(GROQ_API_KEY)})

# ========== MEAL PLANNER VIEWS ==========
def get_fallback_meal_plan(diet_type, profile):
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    is_vegetarian = 'vegetarian' in profile.dietary_preferences if profile.dietary_preferences else False
    
    if diet_type == 'lite':
        if is_vegetarian:
            breakfast = {"title": "Oatmeal with Berries", "description": "Healthy oatmeal with fresh berries", "calories": 280, "prep_time": 10}
            lunch = {"title": "Quinoa Bowl", "description": "Quinoa with roasted vegetables", "calories": 380, "prep_time": 25}
            dinner = {"title": "Vegetable Stir Fry", "description": "Mixed vegetables stir fry", "calories": 320, "prep_time": 20}
        else:
            breakfast = {"title": "Egg White Omelette", "description": "Fluffy egg whites with vegetables", "calories": 220, "prep_time": 15}
            lunch = {"title": "Grilled Chicken Salad", "description": "Fresh salad with grilled chicken", "calories": 380, "prep_time": 20}
            dinner = {"title": "Steamed Fish with Veggies", "description": "Light fish with vegetables", "calories": 350, "prep_time": 25}
    elif diet_type == 'spicy':
        if is_vegetarian:
            breakfast = {"title": "Masala Omelette", "description": "Spicy egg omelette", "calories": 350, "prep_time": 15}
            lunch = {"title": "Spicy Paneer Curry", "description": "Paneer in spicy gravy", "calories": 520, "prep_time": 35}
            dinner = {"title": "Chana Masala", "description": "Spicy chickpea curry", "calories": 450, "prep_time": 30}
        else:
            breakfast = {"title": "Egg Bhurji", "description": "Spicy scrambled eggs", "calories": 380, "prep_time": 15}
            lunch = {"title": "Chicken Karahi", "description": "Spicy chicken curry", "calories": 580, "prep_time": 40}
            dinner = {"title": "Spicy Biryani", "description": "Fragrant spicy rice", "calories": 650, "prep_time": 45}
    elif diet_type == 'balanced':
        if is_vegetarian:
            breakfast = {"title": "Toast with Eggs", "description": "Protein-rich breakfast", "calories": 400, "prep_time": 15}
            lunch = {"title": "Daal Chawal", "description": "Lentils with rice", "calories": 550, "prep_time": 35}
            dinner = {"title": "Palak Paneer", "description": "Spinach with cottage cheese", "calories": 520, "prep_time": 35}
        else:
            breakfast = {"title": "Eggs with Toast", "description": "Protein-rich breakfast", "calories": 420, "prep_time": 15}
            lunch = {"title": "Chicken Curry with Rice", "description": "Traditional chicken curry", "calories": 580, "prep_time": 40}
            dinner = {"title": "Grilled Chicken", "description": "Chicken with vegetables", "calories": 480, "prep_time": 30}
    else:
        breakfast = {"title": "Pancakes", "description": "Fluffy pancakes with syrup", "calories": 500, "prep_time": 20}
        lunch = {"title": "Biryani", "description": "Fragrant rice dish", "calories": 650, "prep_time": 45}
        dinner = {"title": "Pizza", "description": "Cheese pizza", "calories": 700, "prep_time": 30}
    
    weekly_plan = []
    for day in days:
        weekly_plan.append({
            'day': day,
            'breakfast': breakfast.copy(),
            'lunch': lunch.copy(),
            'dinner': dinner.copy()
        })
    return weekly_plan

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_and_save_meal_plan(request):
    try:
        selected_diet = request.data.get('diet_type')
        valid_diets = ['lite', 'spicy', 'balanced', 'without_preference']
        if selected_diet not in valid_diets:
            return Response({'error': 'Invalid diet type'}, status=400)
        
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        if groq_client:
            health_text = ", ".join(profile.health_conditions) if profile.health_conditions else "No specific health conditions"
            diet_text = ", ".join(profile.dietary_preferences) if profile.dietary_preferences else "No dietary restrictions"
            
            diet_description = {
                'lite': 'low calorie, low fat, nutritious, healthy, light meals (300-500 calories)',
                'spicy': 'bold flavors, aromatic spices, medium to hot spice level',
                'balanced': 'well-balanced meals with good mix of protein, carbs, and fats (500-700 calories)',
                'without_preference': 'variety of meals, no restrictions, mix of all cuisines'
            }
            
            prompt = f"""Generate a 7-day meal plan (Monday to Sunday) with breakfast, lunch, dinner.
Diet type: {selected_diet} - {diet_description.get(selected_diet)}
Health: {health_text}
Dietary: {diet_text}
If vegetarian, no meat.
Return JSON with "weekly_plan" array containing 7 days with "day", "breakfast", "lunch", "dinner" each having "title", "description", "calories", "prep_time"."""
            
            completion = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2500,
            )
            
            response_text = completion.choices[0].message.content.strip()
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '')
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '')
            
            ai_data = json.loads(response_text)
            weekly_plan = ai_data.get('weekly_plan', [])
            
            if len(weekly_plan) != 7:
                weekly_plan = get_fallback_meal_plan(selected_diet, profile)
        else:
            weekly_plan = get_fallback_meal_plan(selected_diet, profile)
        
        SavedMealPlan.objects.filter(user=request.user, is_active=True).update(is_active=False)
        saved_plan = SavedMealPlan.objects.create(
            user=request.user,
            diet_type=selected_diet,
            weekly_plan=weekly_plan,
            is_active=True
        )
        
        return Response({
            'weekly_plan': weekly_plan,
            'diet_type': selected_diet,
            'plan_id': saved_plan.id,
            'created_at': saved_plan.created_at,
            'used_preferences': {
                'health_conditions': profile.health_conditions,
                'dietary_preferences': profile.dietary_preferences
            },
            'message': '✅ Meal plan generated!'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error: {e}")
        weekly_plan = get_fallback_meal_plan(selected_diet if 'selected_diet' in locals() else 'balanced', profile)
        saved_plan = SavedMealPlan.objects.create(
            user=request.user,
            diet_type=selected_diet if 'selected_diet' in locals() else 'balanced',
            weekly_plan=weekly_plan,
            is_active=True
        )
        return Response({
            'weekly_plan': weekly_plan,
            'diet_type': selected_diet if 'selected_diet' in locals() else 'balanced',
            'plan_id': saved_plan.id,
            'created_at': saved_plan.created_at,
            'message': '⚠️ Using template plan'
        }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_meal_plan(request):
    try:
        current_plan = SavedMealPlan.objects.filter(user=request.user, is_active=True).first()
        if current_plan:
            is_expired = (datetime.now().date() - current_plan.created_at.date()).days >= 7
            return Response({
                'has_saved_plan': True,
                'weekly_plan': current_plan.weekly_plan,
                'diet_type': current_plan.diet_type,
                'plan_id': current_plan.id,
                'created_at': current_plan.created_at,
                'is_expired': is_expired,
                'days_remaining': max(0, 7 - (datetime.now().date() - current_plan.created_at.date()).days)
            })
        else:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            return Response({
                'has_saved_plan': False,
                'health_conditions': profile.health_conditions,
                'dietary_preferences': profile.dietary_preferences
            })
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
    try:
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response({
            'health_conditions': profile.health_conditions,
            'dietary_preferences': profile.dietary_preferences
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_meal_plan(request):
    try:
        current_plan = SavedMealPlan.objects.filter(user=request.user, is_active=True).first()
        if not current_plan:
            return Response({'error': 'No active plan found'}, status=404)
        return generate_and_save_meal_plan(request)
    except Exception as e:
        return Response({'error': str(e)}, status=500)