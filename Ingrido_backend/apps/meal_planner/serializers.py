from datetime import datetime
from rest_framework import serializers
from .models import SavedMealPlan

class SavedMealPlanSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    plan_age_days = serializers.SerializerMethodField()

    class Meta:
        model = SavedMealPlan
        fields = ['id', 'user', 'user_name', 'health_condition', 'dietary_preference',
                  'weekly_plan', 'is_active', 'created_at', 'updated_at', 'plan_age_days']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return obj.user.username if obj.user else None

    def get_plan_age_days(self, obj):
        if obj.created_at:
            return (datetime.now().date() - obj.created_at.date()).days
        return 0