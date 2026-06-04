from django.db import models
from django.conf import settings

class SavedMealPlan(models.Model):
    HEALTH_CONDITIONS = [
        ('diabetes', 'Diabetes'),
        ('blood_pressure', 'Blood Pressure'),
        ('heart_condition', 'Heart Condition'),
        ('balanced', 'Balanced'),
    ]
    DIETARY_PREFS = [('veg', 'Vegetarian'), ('non_veg', 'Non-Vegetarian'), ('both', 'Both')]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_meal_plans')
    health_condition = models.CharField(max_length=50, choices=HEALTH_CONDITIONS, default='balanced')
    dietary_preference = models.CharField(max_length=50, choices=DIETARY_PREFS, default='both')
    weekly_plan = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Plan for {self.user.username} - {self.created_at.date()}"