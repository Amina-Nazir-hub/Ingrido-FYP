from django.urls import path
from .views import (
    generate_and_save_meal_plan, get_current_meal_plan, delete_meal_plan,
    regenerate_meal_plan, get_user_health_preferences
)

urlpatterns = [
    path('generate/', generate_and_save_meal_plan, name='generate_meal_plan'),
    path('current/', get_current_meal_plan, name='current_meal_plan'),
    path('delete/<int:plan_id>/', delete_meal_plan, name='delete_meal_plan'),
    path('regenerate/', regenerate_meal_plan, name='regenerate_meal_plan'),
    path('health-preferences/', get_user_health_preferences, name='health_preferences'),
]