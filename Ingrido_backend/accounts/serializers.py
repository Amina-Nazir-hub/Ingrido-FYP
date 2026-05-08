from rest_framework import serializers
from django.contrib.auth.models import User
from .models import City, Recipe, SavedRecipe, UserProfile

# 1. User Serializer
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

# 2. City Serializer
class CitySerializer(serializers.ModelSerializer):
    dishes_count = serializers.SerializerMethodField()

    class Meta:
        model = City
        fields = '__all__'

    def get_dishes_count(self, obj):
        # 'recipes' related_name se count calculate ho raha hai[cite: 3]
        return obj.recipes.count()

# 3. Recipe List Serializer (FIXED: Added is_saved)
class RecipeListSerializer(serializers.ModelSerializer):
    difficulty = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField() # Yeh field navigation fix karega

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'prep_time', 'kcal', 'category', 'difficulty', 'is_saved'] 

    def get_is_saved(self, obj):
        # Request context se user nikal kar bookmark check karna
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False

    def get_difficulty(self, obj):
        if obj.category and 'Quick' in obj.category:
            return "Easy"
        return "Medium"

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

# 4. Recipe Detail Serializer
class RecipeDetailSerializer(serializers.ModelSerializer):
    city_name = serializers.ReadOnlyField(source='city.name')
    image = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

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
            return SavedRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False

# 5. Saved Recipe Serializer
class SavedRecipeSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='recipe.id')
    title = serializers.ReadOnlyField(source='recipe.title')
    prep_time = serializers.ReadOnlyField(source='recipe.prep_time')
    kcal = serializers.ReadOnlyField(source='recipe.kcal')
    category = serializers.ReadOnlyField(source='recipe.category')
    image = serializers.SerializerMethodField()
    is_saved = serializers.ReadOnlyField(default=True) # Saved page par hamesha true hoga

    class Meta:
        model = SavedRecipe
        fields = ['id', 'title', 'image', 'prep_time', 'kcal', 'category', 'saved_at', 'is_saved']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.recipe.image:
            if request:
                return request.build_absolute_uri(obj.recipe.image.url)
            return obj.recipe.image.url
        return None