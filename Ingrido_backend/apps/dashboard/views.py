import random
import hashlib
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from apps.recipes.models import Recipe, AIGeneratedRecipe
from apps.recipes.serializers import RecipeListSerializer
from apps.recipes.services import get_groq_client
from apps.common.services import get_ai_generated_image


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
    """
    Har user/session ke liye ek consistent seed banao.
    Same session = same seed = same card order.
    Sirf F5 (reload) par seed badlega kyunke frontend
    session storage clear karta hai aur naya request bhejta hai
    with a refresh flag.
    
    Seed formula: session_key + current_date (din ke andar same rehta hai)
    """
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key

    today = datetime.now().strftime("%Y-%m-%d")
    raw = f"{session_key}-{today}"
    seed = int(hashlib.md5(raw.encode()).hexdigest(), 16) % (2**32)
    return seed

@api_view(['GET'])
@permission_classes([AllowAny])
def get_seasonal_recommendations(request):
    """
    Get seasonal recommendations.
    
    - Normal navigation: same session = same seed = same cards
    - F5 / force refresh: frontend 'refresh=true' bhejta hai
      to naya seed generate hota hai (date + random suffix)
    """
    current_season = get_current_season()
    groq_client = get_groq_client()
    force_refresh = request.query_params.get("refresh") == "true"

    if force_refresh:
        seed = random.randint(0, 2**32)
        request.session["dash_seed"] = seed
        request.session.modified = True
    else:
        seed = request.session.get("dash_seed")
        if seed is None:
            seed = get_session_seed(request)
            request.session["dash_seed"] = seed
            request.session.modified = True

    rng = random.Random(seed)  

    seasonal_keywords = {
        'winter': ['nihari', 'haleem', 'soup', 'karahi', 'korma', 'saag', 'paye', 'chai'],
        'summer': ['chaat', 'lassi', 'kheer', 'mango', 'sherbet', 'raita', 'cooling', 'light'],
        'spring': ['fresh', 'peas', 'spinach', 'light curry', 'barbecue', 'kebab'],
        'autumn': ['pumpkin', 'spiced', 'roasted', 'dry curry', 'keema']
    }

    keywords = seasonal_keywords.get(current_season, ['pakistani', 'recipe'])

    seasonal_db_recipes = list(Recipe.objects.filter(
        Q(title__icontains=keywords[0]) |
        Q(title__icontains=keywords[1]) |
        Q(title__icontains=keywords[2]) |
        Q(description__icontains=keywords[0])
    ).distinct())

    rng.shuffle(seasonal_db_recipes)
    seasonal_db_recipes = seasonal_db_recipes[:6]

    if len(seasonal_db_recipes) >= 6:
        serializer = RecipeListSerializer(seasonal_db_recipes, many=True, context={'request': request})
        data = serializer.data
        for item in data:
            item['is_ai_generated'] = False
        return Response(data)

    db_recipes_list = seasonal_db_recipes
    db_count = len(db_recipes_list)
    needed_count = 6 - db_count

    if not groq_client:
        all_recipes = list(Recipe.objects.all())
        rng.shuffle(all_recipes)  
        selected = all_recipes[:6]
        serializer = RecipeListSerializer(selected, many=True, context={'request': request})
        data = serializer.data
        for item in data:
            item['is_ai_generated'] = False
        return Response(data)

    prompt = f"""Current season: {current_season}. Generate EXACTLY {needed_count} distinct Pakistani dishes tailored for this season.
        The final menu MUST follow this strict categorization inspired by top culinary channels like Food Fusion and SuperChef (creative, appealing, and realistic):
        
        1. **1 Snack Item**: Something catchy and creative (e.g., Bread Roll variety, Fusion Chaat, or unique Pakora/Samosa twist).
        2. **1 Dessert Item**: A mouthwatering Pakistani sweet dish suited for {current_season} (e.g., Shahi Tukray twist, Mango Kheer, or flavored Halwa).
        3. **1 Daal/Chana Component**: An authentic, rich legume dish (e.g., Dhaba Style Daal Chana, Chana Chaat variation, or Murgh Cholay).
        4. **1 Traditional Drink**: A refreshing or comforting beverage (e.g., Mint Margarita variation, Almond Lassi, or Special Doodh Patti/Kashmiri Chai depending on season).
        5. **1 Meat Main Course**: A premium chicken, beef, or mutton dish with high presentation value (e.g., White Karahi, Koyla Karahi, or Mughlai Korma).
        6. **1 Vegetable Main Course**: A flavorful, realistic veggie delight (e.g., Achari Aloo Baingan, Sabzi Jalfrezi, or Paneer Kundan Kaliyan).

        STRICT REPETITION RULES:
        - Never use generic names like "Boiled Rice" or "Plain Daal". Use commercial, appetizing titles.
        - Ensure every single recipe belongs to its designated category without overlapping flavor profiles.
        
        Return ONLY a valid JSON array with EXACTLY {needed_count} items in this exact schema: 
        [{{"title":"Appetizing Dish Name","kcal":380,"prep_time":25}}]
        Do not include any chat, markdown headers, or wrapper text outside the JSON block."""

    try:
        import json
        import re
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": f"You are a Pakistani chef. Output ONLY valid JSON arrays with EXACTLY {needed_count} items."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        response_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)

        if not json_match:
            all_recipes = list(Recipe.objects.all())
            rng.shuffle(all_recipes)  
            final_recipes = all_recipes[:6]
            serializer = RecipeListSerializer(final_recipes, many=True, context={'request': request})
            data = serializer.data
            for item in data:
                item['is_ai_generated'] = False
            return Response(data)

        ai_recipes = json.loads(json_match.group())

        formatted_ai_recipes = []
        for idx, item in enumerate(ai_recipes):
            db_match = Recipe.objects.filter(title__iexact=item['title']).first()

            if db_match:
                serializer = RecipeListSerializer(db_match, context={'request': request})
                recipe_data = serializer.data
                recipe_data['is_ai_generated'] = False
                formatted_ai_recipes.append(recipe_data)
            else:
                cached_ai = AIGeneratedRecipe.objects.filter(title__iexact=item['title']).first()
                image_url = cached_ai.image_url if cached_ai else get_ai_generated_image(item['title'])

                formatted_ai_recipes.append({
                    'id': f"ai-seasonal-{idx}-{rng.randint(1000, 9999)}",
                    'title': item['title'],
                    'image': image_url,
                    'prep_time': int(item.get('prep_time', 30)),
                    'kcal': int(item.get('kcal', 350)),
                    'category': 'Seasonal',
                    'is_ai_generated': True,
                    'is_saved': False
                })

        db_serialized = []
        for recipe in db_recipes_list:
            serializer = RecipeListSerializer(recipe, context={'request': request})
            data = serializer.data
            data['is_ai_generated'] = False
            db_serialized.append(data)

        combined = db_serialized + formatted_ai_recipes
        combined = combined[:6]
        rng.shuffle(combined) 

        return Response(combined)

    except Exception as e:
        print(f"Seasonal AI error: {e}")
        all_recipes = list(Recipe.objects.all())
        rng.shuffle(all_recipes)  
        selected = all_recipes[:6]
        serializer = RecipeListSerializer(selected, many=True, context={'request': request})
        data = serializer.data
        for item in data:
            item['is_ai_generated'] = False
        return Response(data)


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