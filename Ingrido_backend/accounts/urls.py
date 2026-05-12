from django.urls import path
from .views import (
    register_user, login_user, user_profile,
    city_list, GetRecipesByCity, recipe_detail,
    get_ai_substitute, toggle_bookmark, saved_recipes,
    health_check, get_dashboard_recipes,
    generate_and_save_meal_plan, 
    get_current_meal_plan,
    delete_meal_plan, 
    get_user_health_preferences, 
    regenerate_meal_plan
)

urlpatterns = [
    # ========== EXISTING URLs ==========
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('profile/', user_profile, name='user_profile'),
    path('cities/', city_list, name='city_list'),
    path('recipes/', GetRecipesByCity, name='recipe_list'), 
    path('recipes/dashboard/', get_dashboard_recipes, name='dashboard_recipes'),
    path('recipes/<int:pk>/', recipe_detail, name='recipe_detail'),
    path('recipes/<int:pk>/ai-substitute/', get_ai_substitute, name='ai_substitute'),
    path('recipes/<int:recipe_id>/bookmark/', toggle_bookmark, name='toggle_bookmark'),
    path('saved/', saved_recipes, name='saved_recipes'),
    path('health/', health_check, name='health_check'),
    
    # ========== MEAL PLANNER URLs ==========
    path('user/health-preferences/', get_user_health_preferences, name='health_preferences'),
    path('meal-planner/generate/', generate_and_save_meal_plan, name='generate_meal_plan'),
    path('meal-planner/current/', get_current_meal_plan, name='current_meal_plan'),
    path('meal-planner/delete/<int:plan_id>/', delete_meal_plan, name='delete_meal_plan'),
    path('meal-planner/regenerate/', regenerate_meal_plan, name='regenerate_meal_plan'),
]