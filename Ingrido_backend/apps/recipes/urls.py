from django.urls import path
from .views import (
    city_list, GetRecipesByCity, recipe_detail,
    get_ai_recipe_detail, get_ai_substitute, search_ai_recipes_list
)

urlpatterns = [
    path('cities/', city_list, name='city_list'),
    path('by-city/', GetRecipesByCity, name='recipe_by_city'),
    path('<int:pk>/', recipe_detail, name='recipe_detail'),
    path('ai/<str:recipe_title>/', get_ai_recipe_detail, name='ai_recipe_detail'),
    path('ai-search/', search_ai_recipes_list, name='ai_search_recipes'),
    path('ai-substitute/', get_ai_substitute, name='ai_substitute'),
    path('<int:pk>/ai-substitute/', get_ai_substitute, name='ai_substitute_with_pk'),
]