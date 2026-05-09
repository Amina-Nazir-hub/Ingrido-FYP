from rest_framework import serializers
from django.contrib.auth.models import User
from .models import City, Recipe, SavedRecipe, UserProfile


# ─────────────────────────────────────────────
# 1. USER SERIALIZER
# ─────────────────────────────────────────────
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '')
        )
        return user


# ─────────────────────────────────────────────
# 2. CITY SERIALIZER
# ─────────────────────────────────────────────
class CitySerializer(serializers.ModelSerializer):
    dishes_count = serializers.SerializerMethodField()

    class Meta:
        model = City
        fields = '__all__'

    def get_dishes_count(self, obj):
        # related_name='recipes'
        return obj.recipes.count()


# ─────────────────────────────────────────────
# 3. RECIPE LIST SERIALIZER
# Used on dishes listing page
# ─────────────────────────────────────────────
class RecipeListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    difficulty = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = [
            'id',
            'title',
            'image',
            'prep_time',
            'kcal',
            'protein',
            'category',
            'difficulty',
            'is_saved',
        ]

    def get_image(self, obj):
        request = self.context.get('request')

        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url

        return None

    def get_is_saved(self, obj):
        request = self.context.get('request')

        if request and request.user.is_authenticated:
            return SavedRecipe.objects.filter(
                user=request.user,
                recipe=obj
            ).exists()

        return False

    def get_difficulty(self, obj):
        # Simple derived field
        if obj.category and 'Quick' in obj.category:
            return "Easy"
        return "Medium"


# ─────────────────────────────────────────────
# 4. RECIPE DETAIL SERIALIZER
# Used on recipe detail page
# ─────────────────────────────────────────────
class RecipeDetailSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    city_name = serializers.ReadOnlyField(source='city.name')

    class Meta:
        model = Recipe
        fields = '__all__'

    def get_image(self, obj):
        request = self.context.get('request')

        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url

        return None

    def get_is_saved(self, obj):
        request = self.context.get('request')

        if request and request.user.is_authenticated:
            return SavedRecipe.objects.filter(
                user=request.user,
                recipe=obj
            ).exists()

        return False


# ─────────────────────────────────────────────
# 5. SAVED RECIPE SERIALIZER
# Used on bookmarks page
# ─────────────────────────────────────────────
class SavedRecipeSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='recipe.id')
    title = serializers.ReadOnlyField(source='recipe.title')
    prep_time = serializers.ReadOnlyField(source='recipe.prep_time')
    kcal = serializers.ReadOnlyField(source='recipe.kcal')
    category = serializers.ReadOnlyField(source='recipe.category')
    image = serializers.SerializerMethodField()
    is_saved = serializers.ReadOnlyField(default=True)

    class Meta:
        model = SavedRecipe
        fields = [
            'id',
            'title',
            'image',
            'prep_time',
            'kcal',
            'category',
            'saved_at',
            'is_saved',
        ]

    def get_image(self, obj):
        request = self.context.get('request')

        if obj.recipe.image:
            if request:
                return request.build_absolute_uri(obj.recipe.image.url)
            return obj.recipe.image.url

        return None