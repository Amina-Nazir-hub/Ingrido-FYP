import json
import re
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from groq import AuthenticationError, RateLimitError, APIStatusError

from apps.account.models import UserProfile
from apps.recipes.services import get_groq_client
from .models import SavedMealPlan


def get_current_season():
    """Get current season for drinks"""
    month = datetime.now().month
    if month in [4, 5, 6, 7, 8, 9]:  # April to September
        return "summer"
    else:  # October to March
        return "winter"


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_and_save_meal_plan(request):
    """Generate a 7-day meal plan using AI with health condition restrictions"""
    
    try:
        selected_health = request.data.get('health_condition', 'balanced')
        selected_diet = request.data.get('dietary_preference', 'both')
        current_season = get_current_season()
        
        groq_client = get_groq_client()
        
        if not groq_client:
            return Response({'error': 'AI service unavailable. Please check your GROQ_API_KEY.'}, status=500)
        
        # Health condition restrictions
        health_restrictions = {
            'diabetes': """
                - NO sugar, NO desserts, NO sweet dishes
                - NO primary-foreground rice, use brown rice or quinoa instead
                - NO refined flour (maida), use whole wheat (atta) instead
                - NO sugary drinks, lassi, or sweetened beverages
                - NO sweet fruits like mangoes, bananas, grapes
                - Limit potatoes and high glycemic index vegetables
                - Focus on high protein, high fiber foods
                - Include bitter gourd (karela), fenugreek (methi), and leafy greens
            """,
            'blood_pressure': """
                - NO salt or very low sodium
                - NO processed foods, pickles, or packaged snacks
                - NO high-sodium sauces (soy sauce, ketchup)
                - NO red meat (beef, mutton) - limit to once a week
                - Avoid deep fried foods (pakoras, samosas)
                - Use herbs and spices instead of salt for flavor
                - Include potassium-rich foods (bananas, spinach, potatoes with skin)
                - Include garlic, ginger, and turmeric
            """,
            'heart_condition': """
                - NO fried foods or trans fats
                - NO red meat (beef, mutton) - strictly avoid
                - NO butter, ghee, or heavy cream
                - NO full-fat dairy (use low-fat or skim)
                - NO coconut milk or cream
                - NO processed meats (sausages, salami)
                - Use olive oil or canola oil only
                - Include omega-3 rich foods (fish like salmon, trout)
                - Include nuts (walnuts, almonds) in moderation
                - Focus on lean proteins (chicken without skin, fish)
            """,
            'balanced': """
                - No strict restrictions
                - Normal healthy eating guidelines apply
                - Can include occasional treats in moderation
                - Balance between all food groups
            """
        }
        
        # Dietary preference guidelines
        diet_guidelines = {
            'veg': """
                - NO meat, NO chicken, NO fish, NO eggs
                - Use plant-based proteins: lentils (daal), chickpeas (chana), beans, tofu, paneer
                - Include dairy if acceptable (yogurt, milk, paneer)
                - Ensure adequate protein in every meal
                - Focus on seasonal vegetables and whole grains
            """,
            'non_veg': """
                - Include meat, chicken, or fish in lunch or dinner
                - Can have eggs for breakfast
                - Balance meat with vegetables and whole grains
                - Include lean meats (chicken breast, fish) 3-4 times a week
                - Red meat (beef, mutton) limited to once a week
            """,
            'both': """
                - Mix of vegetarian and non-vegetarian throughout the week
                - If lunch is non-veg, dinner should be vegetarian
                - If lunch is vegetarian, dinner can be non-veg
                - Ensure protein variety throughout the week
                - Include at least 2 vegetarian days
            """
        }
        
        # Dessert restriction for diabetes
        dessert_allowed = selected_health != 'diabetes'
        dessert_allowed_text = "NO desserts at all. Only seasonal drinks allowed." if not dessert_allowed else "Desserts allowed on Tuesday and Saturday as per schedule below."
        current_season_text = "SUMMER" if current_season == "summer" else "WINTER"
        summer_dishes_text = """
           Summer-friendly Pakistani dishes (light, refreshing, seasonal):
           - Light curries: Tori (Ridge Gourd), Lauki (Bottle Gourd), Karela (Bitter Gourd), Bhindi, Mix Sabzi
           - Yogurt-based dishes: Dahi Bhalla, Raita, Lassi
           - Grilled/BBQ: Seekh Kabab, Chicken Tikka, Fish Tikka, Boti Kabab
           - Daal dishes: Daal Chawal, Maash Daal, Chana Daal (light)
           - Seasonal fruits in meals: Mango, Watermelon, Cucumber Salad
           - Mango-based desserts: Mango Delight, Aamras, Mango Kheer
           ❌ Avoid heavy, extremely oily, or very heavy meat dishes on hot days
        """ if current_season == "summer" else """
           Winter-friendly Pakistani dishes (hearty, warming):
           - Heavy meat dishes: Nihari, Haleem, Mutton Korma, Brain Masala, Paye, Siri Paye
           - Warm soups: Chicken Soup, Mutton Soup, Daal Soup
           - Root vegetables: Aloo, Gajar, Shaljam (Turnip), Mooli (Radish), Palak
           - Winter special desserts: Gajar Ka Halwa, Sooji Halwa, Zarda, Sheer Khurma
           - Warm drinks: Kashmiri Chai, Ginger Tea, Turmeric Milk (Haldi Doodh), Masala Chai
        """
        prompt = f"""
        You are a Pakistani nutritionist creating a 7-day meal plan for {current_season_text} season.

        USER: Health={selected_health}, Diet={selected_diet}, Season={current_season}

        HEALTH RULES: {health_restrictions.get(selected_health, health_restrictions['balanced'])}

        DIET RULES: {diet_guidelines.get(selected_diet, diet_guidelines['both'])}

        {current_season_text} SEASON GUIDELINES:{summer_dishes_text}

        STRICT RULES:

        1. NO REPETITION: All 21 meals must have UNIQUE names. No dish appears twice in the week.

        2. BREAKFAST — ONLY real Pakistani breakfast dishes:
           Weekdays (light): Anda Paratha, Aloo Paratha, Omelette, Eggs, Chanay, Daliya, Toast, Yogurt, Lassi
           Weekends (heavy): Nihari, Paye, Halwa Puri, Chana Chaat, Brain Masala, Fried Fish
           ❌ NO snacks (pakoras, samosas, rolls, patties), NO lunch/dinner items (biryani, karahi, daal chawal)

        3. LUNCH — Pakistani lunch dishes (snacks allowed max 2 times in week):
           Main dishes: Biryani, Pulao, Chicken/Mutton Karahi, Nihari, Haleem, Korma, Handi, Daal Gosht, Kofta, Fish Curry, Daal Chawal, Khichdi, Mix Sabzi, Bhindi, Aloo Bhujia, Chana/Mash Daal, Palak Paneer
           Snacks allowed (max 2 times in week in lunch or dinner): Pakoras, Samosas, Rolls, Patties, Chaat items, Fruit Chaat
           ❌ NO breakfast items in lunch

        4. DINNER — Pakistani dinner dishes (snacks allowed max 2 times in week):
           Main dishes: Chicken Karahi/Handi, Mutton Korma, Biryani, Pulao, Haleem, BBQ (Seekh Kabab, Chicken Tikka), Daal Chawal, Khichdi, Bhindi, Mix Sabzi, Soup, Salad, Grilled Chicken/Fish, Palak Paneer
           Snacks allowed (max 2 times in week, shared with lunch): Pakoras, Samosas, Rolls, Patties, Chaat items, Fruit Chaat
           ❌ NO breakfast items in dinner

        5. LUNCH/DINNER BALANCE: Heavy lunch → light dinner. Light lunch → heavy dinner.

        6. DIET ('both' preference): Lunch non-veg → dinner veg. Lunch veg → dinner non-veg.

        7. SIDE (dessert/drink) — {current_season_text} variety, no 2 same drinks/desserts in week:
           - {dessert_allowed_text}
           - Tue/Sat: dessert (if health allows). Other days: drink.
           - Diabetes: ONLY sugar-free drinks, no sweet lassi
           - {current_season_text} desserts: Mango Delight, Cold Kheer, Falooda, Qulfi, Rabri, Gajar Ka Halwa{'' if current_season == 'summer' else ', Sheer Khurma, Sooji Halwa, Zarda'}
           - {current_season_text} drinks: {'Mango Lassi, Sweet/Salted Lassi, Rooh Afza, Lemon Sherbet, Sattu, Watermelon Juice, Sugarcane Juice, Mint Margarita, Thandai, Chaach, Aam Panna, Coconut Water' if current_season == 'summer' else 'Kashmiri Chai, Doodh Patti, Ginger Tea, Hot Chocolate, Masala Chai, Coffee, Turmeric Milk'}
           - Ensure variety — don't repeat the same drink or dessert twice

        8. MUST INCLUDE (no repeats): 2+ daal dishes, 1 fish (non-veg/both), 3+ veg dishes, 2+ egg breakfasts, Friday special dish

        9. ALL DISHES from YouTube channels only:
           SooperChef, Food Fusion, Baba Food Secrets, Kun Foods, Kitchen With Amna, Muhammad Danial, Ijaz Ansari Food Secrets
           ❌ DO NOT invent names. Every title must be YouTube-searchable from these channels.
           ❌ NO channel name, "(channel)", or "Recipe" in title. NO "Pakistani" suffix.

        10. ROMAN URDU: All titles in Roman Urdu. Examples: "Anda Paratha", "Murgh Cholay", "Degi Biryani", "Chicken White Handi", "Mango Delight"

        11. Ingredients/directions must match actual recipe from that YouTube channel.

        OUTPUT valid JSON only:
        {{
            "weekly_plan": [
                {{
                    "day": "Monday",
                    "breakfast": {{"title":"Roman Urdu dish","description":"...","calories":300-450,"prep_time":15-30,"dietary_type":"veg/non_veg"}},
                    "lunch": {{"title":"Roman Urdu dish","description":"...","calories":400-550,"prep_time":25-45,"dietary_type":"veg/non_veg"}},
                    "dinner": {{"title":"Roman Urdu dish","description":"...","calories":350-500,"prep_time":20-40,"dietary_type":"veg/non_veg"}},
                    "side": {{"title":"dessert/drink","type":"dessert/drink","description":"..."}}
                }}
            ]
        }}
        """

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional Pakistani nutritionist and chef. You MUST ensure NO dish name repeats across the entire 7-day plan. Every meal must have a unique name. ONLY use real dish names from SooperChef, Food Fusion, Baba Food Secrets, Kun Foods, Kitchen With Amna, Muhammad Danial, and Ijaz Ansari Food Secrets YouTube channels. ALL dish names MUST be in Roman Urdu. NEVER invent or generate fake dish names. NEVER include channel name or 'Recipe' in the title. Respond ONLY in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.85,
            max_tokens=4096
        )

        response_text = completion.choices[0].message.content.strip()
        
        # Extract JSON - handle both raw JSON and markdown code blocks
        json_match = re.search(r'```(?:json)?\s*\n?(\{.*?\})\n?\s*```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
            else:
                print(f"Failed to parse JSON. Response: {response_text[:500]}")
                return Response({'error': 'AI failed to generate valid JSON'}, status=500)
            
        data = json.loads(json_str)
        weekly_plan = data.get('weekly_plan', [])

        # Deactivate old plans
        SavedMealPlan.objects.filter(user=request.user, is_active=True).update(is_active=False)

        # Save new plan
        saved_plan = SavedMealPlan.objects.create(
            user=request.user,
            weekly_plan=weekly_plan,
            health_condition=selected_health,
            dietary_preference=selected_diet,
            is_active=True
        )

        return Response({
            'weekly_plan': weekly_plan,
            'plan_id': saved_plan.id,
            'created_at': saved_plan.created_at,
            'health_condition': saved_plan.health_condition,
            'dietary_preference': saved_plan.dietary_preference
        }, status=status.HTTP_201_CREATED)

    except AuthenticationError as e:
        print(f"Groq auth error: {e}")
        return Response({'error': 'Invalid or expired GROQ_API_KEY. Please update your API key.'}, status=500)
    except RateLimitError as e:
        print(f"Groq rate limit: {e}")
        return Response({'error': 'AI service is rate limited. Please try again later.'}, status=429)
    except APIStatusError as e:
        print(f"Groq API error: {e}")
        return Response({'error': f'AI service error: {e.message}'}, status=500)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return Response({'error': 'AI generated invalid response. Please try again.'}, status=500)
    except Exception as e:
        print(f"Meal plan generation error: {e}")
        return Response({'error': f'Unexpected error: {str(e)}'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_meal_plan(request):
    """Get user's current active meal plan"""
    try:
        plan = SavedMealPlan.objects.filter(user=request.user, is_active=True).order_by('-created_at').first()
        
        if plan:
            # Check if plan has expired (7 days)
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
    """Delete a specific meal plan"""
    try:
        plan = SavedMealPlan.objects.get(id=plan_id, user=request.user)
        plan.delete()
        return Response({'message': 'Meal plan deleted successfully'}, status=200)
    except SavedMealPlan.DoesNotExist:
        return Response({'error': 'Plan not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_health_preferences(request):
    """Get user's health and dietary preferences"""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return Response({
        'health_conditions': profile.health_conditions,
        'dietary_preferences': profile.dietary_preferences
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_meal_plan(request):
    """Regenerate meal plan with existing preferences"""
    return generate_and_save_meal_plan(request)