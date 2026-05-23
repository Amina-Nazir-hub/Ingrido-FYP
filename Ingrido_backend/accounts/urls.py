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
    regenerate_meal_plan, get_ai_recipe_detail,
    search_ai_recipes_list, toggle_ai_bookmark,
    get_seasonal_recommendations,
    get_search_history, add_search_history, clear_search_history, remove_search_item,
    get_viewed_recipes, add_viewed_recipe, clear_viewed_recipes
)

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('profile/', user_profile, name='user_profile'),
    
    path('cities/', city_list, name='city_list'),
    path('recipes/', GetRecipesByCity, name='recipe_list'), 
    path('recipes/dashboard/', get_dashboard_recipes, name='dashboard_recipes'),
    path('recipes/seasonal/', get_seasonal_recommendations, name='seasonal_recipes'),
    path('recipes/<int:pk>/', recipe_detail, name='recipe_detail'),
    
    path('recipes/ai-search/', search_ai_recipes_list, name='ai_search_recipes'),
    path('recipes/ai/<str:recipe_title>/', get_ai_recipe_detail, name='ai_recipe_detail'),
    
    path('recipes/<int:pk>/ai-substitute/', get_ai_substitute, name='ai_substitute'),
    path('recipes/ai-substitute/', get_ai_substitute, name='ai_substitute_by_title'),
    
    path('recipes/<int:recipe_id>/bookmark/', toggle_bookmark, name='toggle_bookmark'),
    path('recipes/ai/<str:recipe_title>/bookmark/', toggle_ai_bookmark, name='toggle_ai_bookmark'),
    path('saved/', saved_recipes, name='saved_recipes'),
    
    path('health/', health_check, name='health_check'),
    
    path('user/health-preferences/', get_user_health_preferences, name='health_preferences'),
    path('meal-planner/generate/', generate_and_save_meal_plan, name='generate_meal_plan'),
    path('meal-planner/current/', get_current_meal_plan, name='current_meal_plan'),
    path('meal-planner/delete/<int:plan_id>/', delete_meal_plan, name='delete_meal_plan'),
    path('meal-planner/regenerate/', regenerate_meal_plan, name='regenerate_meal_plan'),
    
    # Search History APIs
    path('search-history/', get_search_history, name='search_history'),
    path('search-history/add/', add_search_history, name='add_search_history'),
    path('search-history/clear/', clear_search_history, name='clear_search_history'),
    path('search-history/remove/<str:query>/', remove_search_item, name='remove_search_item'),
    
    # Viewed Recipes APIs
    path('viewed-recipes/', get_viewed_recipes, name='viewed_recipes'),
    path('viewed-recipes/add/', add_viewed_recipe, name='add_viewed_recipe'),
    path('viewed-recipes/clear/', clear_viewed_recipes, name='clear_viewed_recipes'),
]