
import random
import re
import hashlib
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from apps.recipes.models import Recipe, AIGeneratedRecipe
from apps.recipes.serializers import RecipeListSerializer
from apps.recipes.services import get_groq_client, fetch_seasonal_dishes, clean_youtube_title
from apps.common.services import get_ai_generated_image
from apps.common.models import GeneratedImageCache

def get_current_season():
    """Get current season based on month"""
    month = datetime.now().month
    if month in [12, 1, 2]:
        return "winter"
    elif month in [3, 4, 5]:
        return "spring"
    elif month in [6, 7, 8]:
        return "summer"
    else:
        return "autumn"


def get_session_seed(request):
    """Consistent seed for normal navigation"""
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key

    today = datetime.now().strftime("%Y-%m-%d")
    raw = f"{session_key}-{today}"
    seed = int(hashlib.md5(raw.encode()).hexdigest(), 16) % (2**32)
    return seed


def get_safe_fallback_recipes(request):
    """
    Safe fallback helper function.
    Agar AI crash ho jaye to database se recipes uthao aur unhein
    mark karo as is_ai_generated=True taake frontend smoothly chale.
    """
    all_recipes = list(Recipe.objects.all())
    random.shuffle(all_recipes)
    selected = all_recipes[:6]
    
    serializer = RecipeListSerializer(selected, many=True, context={'request': request})
    data = serializer.data
    
    for item in data:
        item['is_ai_generated'] = True
    return data


DEFAULT_DISH_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg'


def _get_cached_images_bulk(clean_titles):
    """Batch check image cache for all dishes at once."""
    if not clean_titles:
        return {}

    ai_q = Q()
    img_q = Q()
    for t in clean_titles:
        ai_q |= Q(title__iexact=t)
        img_q |= Q(dish_name__iexact=t)

    ai_recipes = {
        r.title.lower(): r.image_url
        for r in AIGeneratedRecipe.objects.filter(ai_q) if r.image_url
    }
    img_cache = {
        c.dish_name.lower(): c.image_url
        for c in GeneratedImageCache.objects.filter(img_q) if c.image_url
    }

    return {t: ai_recipes.get(t.lower()) or img_cache.get(t.lower()) for t in clean_titles}


@api_view(['GET'])
@permission_classes([AllowAny])
def get_seasonal_recommendations(request):
    """
    Get seasonal recommendations using REAL YouTube video titles
    from specified channels only (Food Fusion, Sooper Chef, etc.)
    """
    force_refresh = request.query_params.get("refresh") == "true"

    try:
        dishes = fetch_seasonal_dishes(force_refresh=force_refresh)

        if not dishes:
            fallback_data = get_safe_fallback_recipes(request)
            return Response(fallback_data)

        clean_titles = [
            dish.get('clean_title') or clean_youtube_title(dish['title'])
            for dish in dishes
        ]

        cached_images = _get_cached_images_bulk(clean_titles)

        formatted = []
        for idx, dish in enumerate(dishes):
            clean_title = clean_titles[idx]
            video_id = dish['video_id']
            image_url = cached_images.get(clean_title)

            if image_url:
                formatted.append({
                    'id': f"ai-seasonal-{idx}-{random.randint(10000, 99999)}",
                    'title': clean_title,
                    'image': image_url,
                    'prep_time': 30,
                    'kcal': 350,
                    'category': 'Seasonal',
                    'is_ai_generated': True,
                    'is_saved': False,
                    'youtube_video_id': video_id
                })
            else:
                # Generate image synchronously so we return real pollination image
                generated_url = get_ai_generated_image(clean_title)
                formatted.append({
                    'id': f"ai-seasonal-{idx}-{random.randint(10000, 99999)}",
                    'title': clean_title,
                    'image': generated_url or DEFAULT_DISH_IMAGE,
                    'prep_time': 30,
                    'kcal': 350,
                    'category': 'Seasonal',
                    'is_ai_generated': True,
                    'is_saved': False,
                    'youtube_video_id': video_id
                })

        random.shuffle(formatted)
        return Response(formatted[:6])

    except Exception as e:
        print(f"Seasonal fetch error: {e}")
        fallback_data = get_safe_fallback_recipes(request)
        return Response(fallback_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_recipes(request):
    seed = request.session.get("dash_seed") or get_session_seed(request)
    rng = random.Random(seed)

    recipes = list(Recipe.objects.all())
    rng.shuffle(recipes) 
    recipes = recipes[:12]

    serializer = RecipeListSerializer(recipes, many=True, context={'request': request})
    data = serializer.data

    for item in data:
        item['is_ai_generated'] = False

    return Response(data)