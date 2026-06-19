from urllib.parse import quote
from rest_framework import serializers
from django.core.files.storage import default_storage
from .models import City, Recipe, AIGeneratedRecipe
from apps.common.services import get_ai_generated_image

class CitySerializer(serializers.ModelSerializer):
    dishes_count = serializers.SerializerMethodField()

    class Meta:
        model = City
        fields = '__all__'

    def get_dishes_count(self, obj):
        return obj.recipes.count()

class RecipeListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    kcal = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'prep_time', 'kcal', 'category', 'is_saved']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and default_storage.exists(obj.image.name):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        
        return get_ai_generated_image(obj.title)

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.account.models import SavedRecipe
            return SavedRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False

    def get_kcal(self, obj):
        return getattr(obj, 'calories', getattr(obj, 'kcal', 350))

    def get_category(self, obj):
        return getattr(obj, 'category', 'Pakistani')

class RecipeDetailSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    city_name = serializers.ReadOnlyField(source='city.name')
    kcal = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'youtube_video_id', 'kcal', 'prep_time', 
                  'ingredients', 'instructions', 'city_name', 'is_saved', 'dietary_type']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and default_storage.exists(obj.image.name):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return get_ai_generated_image(obj.title)

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.account.models import SavedRecipe
            return SavedRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False

    def get_kcal(self, obj):
        return getattr(obj, 'calories', getattr(obj, 'kcal', 350))