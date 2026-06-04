from django.urls import path
from .views import (
    register_user, login_user, user_profile,
    toggle_bookmark, toggle_ai_bookmark, saved_recipes,
    get_search_history, add_search_history, clear_search_history, remove_search_item,
    get_viewed_recipes, add_viewed_recipe, clear_viewed_recipes,
)

urlpatterns = [
    # Auth
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('profile/', user_profile, name='user_profile'),
    
    # Bookmarks
    path('recipes/ai/<str:recipe_title>/bookmark/', toggle_ai_bookmark, name='toggle_ai_bookmark'),
    path('recipes/<int:recipe_id>/bookmark/', toggle_bookmark, name='toggle_bookmark'),
    path('saved/', saved_recipes, name='saved_recipes'),
    
    # Search History
    path('search-history/', get_search_history, name='search_history'),
    path('search-history/add/', add_search_history, name='add_search_history'),
    path('search-history/clear/', clear_search_history, name='clear_search_history'),
    path('search-history/remove/<str:query>/', remove_search_item, name='remove_search_item'),
    
    # Viewed History
    path('viewed-recipes/', get_viewed_recipes, name='viewed_recipes'),
    path('viewed-recipes/add/', add_viewed_recipe, name='add_viewed_recipe'),
    path('viewed-recipes/clear/', clear_viewed_recipes, name='clear_viewed_recipes'),
]