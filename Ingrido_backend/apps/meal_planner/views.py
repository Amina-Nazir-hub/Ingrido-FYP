# apps/meal_planner/views.py

import json
import re
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

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
            return Response({'error': 'Groq client not initialized'}, status=500)
        
        # Health condition restrictions
        health_restrictions = {
            'diabetes': """
                - NO sugar, NO desserts, NO sweet dishes
                - NO white rice, use brown rice or quinoa instead
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
        
        # Build the complete prompt
        prompt = f"""
        You are a Pakistani nutritionist creating a 7-day meal plan.

        USER PREFERENCES:
        - Health Condition: {selected_health}
        - Dietary Preference: {selected_diet}
        - Current Season: {current_season}

        HEALTH RESTRICTIONS FOR {selected_health.upper()}:
        {health_restrictions.get(selected_health, health_restrictions['balanced'])}

        DIETARY GUIDELINES FOR {selected_diet.upper()}:
        {diet_guidelines.get(selected_diet, diet_guidelines['both'])}

        ⚠️⚠️⚠️ STRICT RULES - VIOLATION WILL RESULT IN INVALID RESPONSE ⚠️⚠️⚠️:

        1. 🔴 ABSOLUTELY NO REPETITION: Every single meal (breakfast, lunch, dinner) for all 7 days must have a UNIQUE dish name. 
           - No dish name should appear more than once in the entire 7-day plan
           - Even across different meal types, dish names cannot repeat

        2. 🌅 BREAKFAST SCHEDULE:
           - Monday to Friday (Weekdays): Light breakfast (Oatmeal, Cornflakes, Porridge, Boiled Eggs, Toast, Yogurt with Fruits, Scrambled Eggs, French Toast, Pancakes)
           - Saturday and Sunday (Weekends): Heavy breakfast (Halwa Puri, Chana Chaat, Anda Paratha, Nihari, Paye, Siri Paye)

        3. ⚖️ LUNCH/DINNER BALANCE:
           - If lunch is heavy → dinner must be light
           - If lunch is light → dinner can be heavy
           - Heavy examples: Karahi, Handi, Biryani, Nihari, Haleem, Kofta, Pulao, Korma
           - Light examples: Daal Chawal, Khichdi, Soup with Salad, Grilled items, Bhindi, Sabzi

        4. 🥘 BOTH DIETARY PREFERENCE RULES:
           - Lunch non-veg → Dinner veg
           - Lunch veg → Dinner non-veg
           - Non-veg options: Chicken, Mutton, Beef, Fish, Eggs
           - Veg options: Daal, Sabzi, Paneer, Mushroom, Tofu

        5. 🍰 DESSERT & DRINK SCHEDULE (IMPORTANT - Add as "side" field):
           - Tuesday and Saturday: DESSERT (type: "dessert") f"For {current_season.upper()} DRINKS (use appropriate season):"
           - Monday, Wednesday, Thursday, Friday, Sunday: SEASONAL DRINK (type: "drink")
           
           DESSERT OPTIONS (use only if health condition allows):
           - Kheer, Gajar ka Halwa, Sooji Halwa, Zarda, Ras Malai, Gulab Jamun, Jalebi, Barfi, Sheer Khurma, Firni, Rabri, Qulfi, Falooda
           
           {f'For {current_season.upper()} DRINKS (use appropriate season):'}

           SUMMER DRINKS (April-September):
           - Mango Lassi, Sweet Lassi, Salted Lassi, Rooh Afza, Lemon Sherbet, Sattu Drink, Watermelon Juice, Sugarcane Juice, Mint Margarita, Thandai, Chaach (Buttermilk), Aam Panna, Coconut Water
           
           WINTER DRINKS (October-March):
           - Kashmiri Chai (Noon Chai), Doodh Patti, Ginger Tea, Hot Chocolate, Almond Milk, Cinnamon Tea, Suleimani Chai, Masala Chai, Coffee, Green Tea with Honey, Turmeric Milk (Haldi Doodh)

        6. 📋 MUST INCLUDE (without repetition):
           - At least 2 different daal (lentil) dishes
           - At least 1 fish dish (for non-veg only)
           - At least 3 different vegetable dishes
           - At least 1 breakfast with eggs
           - Friday special lunch/dinner (Biryani, Pulao, or any special dish)

        7. ✅ DISH NAMING RULES:
           - Use ONLY real, authentic Pakistani dish names
           - NEVER add "Pakistani" suffix
           - DO NOT invent or generate fake dish names

        OUTPUT FORMAT - Return ONLY valid JSON. NO other text before or after:

        {{
            "weekly_plan": [
                {{
                    "day": "Monday",
                    "breakfast": {{
                        "title": "unique dish name",
                        "description": "brief description",
                        "calories": 300-450,
                        "prep_time": 15-30,
                        "dietary_type": "veg/non_veg"
                    }},
                    "lunch": {{
                        "title": "unique dish name (different from breakfast)",
                        "description": "brief description",
                        "calories": 400-550,
                        "prep_time": 25-45,
                        "dietary_type": "veg/non_veg"
                    }},
                    "dinner": {{
                        "title": "unique dish name (different from breakfast and lunch)",
                        "description": "brief description",
                        "calories": 350-500,
                        "prep_time": 20-40,
                        "dietary_type": "veg/non_veg"
                    }},
                    "side": {{
                        "title": "dessert or drink name",
                        "type": "dessert/drink",
                        "description": "brief description"
                    }}
                }}
            ]
        }}

        IMPORTANT: All 21 meals (7 breakfasts + 7 lunches + 7 dinners) must have COMPLETELY UNIQUE dish names. NO REPETITION ALLOWED!
        """

        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional Pakistani nutritionist and chef. You MUST ensure NO dish name repeats across the entire 7-day plan. Every meal must have a unique name. Use real Pakistani dishes only. Respond ONLY in valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=4000
        )

        response_text = completion.choices[0].message.content.strip()
        
        # Extract JSON
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            print(f"Failed to parse JSON. Response: {response_text[:500]}")
            return Response({'error': 'AI failed to generate valid JSON'}, status=500)
            
        data = json.loads(json_match.group())
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

    except Exception as e:
        print(f"Meal plan generation error: {e}")
        return Response({'error': str(e)}, status=500)


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