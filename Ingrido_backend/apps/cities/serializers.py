from rest_framework import serializers
from apps.recipes.models import City, Recipe

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'region', 'tagline', 'latitude', 'longitude', 
                  'is_pandamart_available', 'image', 'famous_dishes', 'recipes']