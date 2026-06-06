from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CityViewSet, RecipeViewSet

router = DefaultRouter()
router.register('cities', CityViewSet)
router.register('recipes', RecipeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]