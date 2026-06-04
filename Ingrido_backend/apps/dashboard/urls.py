from django.urls import path
from .views import get_seasonal_recommendations, get_dashboard_recipes

urlpatterns = [
    path('seasonal/', get_seasonal_recommendations, name='seasonal_recipes'),
    path('dashboard-recipes/', get_dashboard_recipes, name='dashboard_recipes'),
]