from django.contrib import admin
from .models import SavedMealPlan

# Saved Meal Plan Admin
@admin.register(SavedMealPlan)
class SavedMealPlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'health_condition', 'dietary_preference', 'is_active', 'created_at')
    list_filter = ('health_condition', 'dietary_preference', 'is_active', 'created_at')
    search_fields = ('user__email', 'user__first_name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    
    def plan_days_count(self, obj):
        if obj.weekly_plan:
            return len(obj.weekly_plan)
        return 0
    plan_days_count.short_description = "Total Days"
    
    def get_weekly_plan_preview(self, obj):
        if obj.weekly_plan and len(obj.weekly_plan) > 0:
            days = [day.get('day', f'Day {i+1}') for i, day in enumerate(obj.weekly_plan[:3])]
            return ", ".join(days) + ("..." if len(obj.weekly_plan) > 3 else "")
        return "No plan"
    get_weekly_plan_preview.short_description = "Plan Preview"