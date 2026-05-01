from django.urls import path
from .views import (
    register_user, 
    login_user, 
    user_profile,
    city_list,
    GetRecipesByCity,  # Naya function jo city ke mutabiq recipes filter karega
    recipe_detail,
    toggle_bookmark, 
    saved_recipes,
)

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────
    path('register/', register_user,  name='register'),
    path('login/',    login_user,     name='login'),
    path('profile/',  user_profile,   name='user_profile'),

    # ── Cities ────────────────────────────────────────────
    path('cities/',   city_list,      name='city_list'),

    # ── Recipes ───────────────────────────────────────────
    # Frontend (axios) ab is URL par ?city=Karachi bhej raha hai
    path('recipes/',           GetRecipesByCity, name='recipe_list'), 
    path('recipes/<int:pk>/',  recipe_detail,    name='recipe_detail'),

    # ── Bookmarks ─────────────────────────────────────────
    path('recipes/<int:recipe_id>/bookmark/', toggle_bookmark, name='toggle_bookmark'),
    path('saved/', saved_recipes, name='saved_recipes'),
]