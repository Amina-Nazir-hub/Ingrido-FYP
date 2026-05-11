from django.urls import path
from .views import (
    register_user, login_user, user_profile,
    city_list, GetRecipesByCity, recipe_detail,
    get_ai_substitute, toggle_bookmark, saved_recipes,
    health_check, get_dashboard_recipes # Naya view import karein
)

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('profile/', user_profile, name='user_profile'),
    path('cities/', city_list, name='city_list'),
    path('recipes/', GetRecipesByCity, name='recipe_list'), 
    path('recipes/dashboard/', get_dashboard_recipes, name='dashboard_recipes'), # Ye line dashboard ke 6 cards ke liye hai
    path('recipes/<int:pk>/', recipe_detail, name='recipe_detail'),
    path('recipes/<int:pk>/ai-substitute/', get_ai_substitute, name='ai_substitute'),
    path('recipes/<int:recipe_id>/bookmark/', toggle_bookmark, name='toggle_bookmark'),
    path('saved/', saved_recipes, name='saved_recipes'),
    path('health/', health_check, name='health_check'),
]