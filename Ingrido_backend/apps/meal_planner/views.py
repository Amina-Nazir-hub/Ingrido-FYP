import json
import re
from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.account.models import UserProfile
from apps.recipes.services import get_groq_client

from .models import SavedMealPlan
from .serializers import SavedMealPlanSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_and_save_meal_plan(request):
    groq_client = get_groq_client()
    if not groq_client:
        return Response({'error': 'AI Service not configured'}, status=503)

    try:
        profile = UserProfile.objects.get(user=request.user)
        health_conditions = profile.health_conditions or "None"
        dietary_preferences = profile.dietary_preferences or "None"
        
        prompt = f"""
        Generate a 7-day meal plan for a person from Pakistan.
        Health Conditions: {health_conditions}
        Dietary Preferences: {dietary_preferences}
        Return JSON array of 7 objects: [{{"day":"Day 1","breakfast":"dish","lunch":"dish","dinner":"dish","nutrition_tip":"tip"}}]
        """
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a nutritionist. Output ONLY valid JSON arrays."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        response_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if not json_match:
            return Response({'error': 'AI failed to respond in JSON structure'}, status=500)
        
        weekly_plan_data = json.loads(json_match.group())
        SavedMealPlan.objects.filter(user=request.user, is_active=True).update(is_active=False)
        
        meal_plan = SavedMealPlan.objects.create(
            user=request.user,
            weekly_plan=weekly_plan_data,
            health_condition=health_conditions,
            dietary_preference=dietary_preferences,
            is_active=True
        )
        
        return Response({
            'weekly_plan': meal_plan.weekly_plan,
            'plan_id': meal_plan.id,
            'created_at': meal_plan.created_at,
            'health_condition': meal_plan.health_condition,
            'dietary_preference': meal_plan.dietary_preference
        }, status=201)
    except Exception as e:
        return Response({'error': f'Meal plan generation failed: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_meal_plan(request):
    return generate_and_save_meal_plan(request)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_meal_plan(request):
    try:
        plan = SavedMealPlan.objects.filter(user=request.user, is_active=True).order_by('-created_at').first()
        if plan:
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
    plan = get_object_or_404(SavedMealPlan, id=plan_id, user=request.user)
    plan.delete()
    return Response({'message': 'Deleted'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_health_preferences(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return Response({
        'health_conditions': profile.health_conditions,
        'dietary_preferences': profile.dietary_preferences
    })