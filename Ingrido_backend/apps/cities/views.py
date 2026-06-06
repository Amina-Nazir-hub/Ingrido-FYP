from rest_framework import viewsets
from apps.recipes.models import City, Recipe
from .serializers import CitySerializer, RecipeSerializer

class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer