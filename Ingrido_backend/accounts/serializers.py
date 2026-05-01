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
    class Meta:
        model = City
        fields = '__all__'

# 3. Recipe List Serializer (UPDATED for Ingrido Frontend)
class RecipeListSerializer(serializers.ModelSerializer):
    # Difficulty field model mein nahi hai, isliye hum logic se handle kar rahe hain
    difficulty = serializers.SerializerMethodField()
    # Pura Image URL generate karne ke liye
    image = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'prep_time', 'kcal', 'category', 'difficulty'] 

    def get_difficulty(self, obj):
        # Agar category 'Quick & Easy' hai toh 'Easy' dikhaye, warna 'Medium'
        if obj.category and 'Quick' in obj.category:
            return "Easy"
        return "Medium"

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

# 4. Recipe Detail Serializer (Poori details ke liye)
class RecipeDetailSerializer(serializers.ModelSerializer):
    city_name = serializers.ReadOnlyField(source='city.name')
    image = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = '__all__'

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

# 5. Saved Recipe Serializer
class SavedRecipeSerializer(serializers.ModelSerializer):
    # context passing yahan zaroori hai taake nested serializer bhi image URLs sahi banaye
    recipe_details = serializers.SerializerMethodField()

    class Meta:
        model = SavedRecipe
        fields = ['id', 'recipe', 'recipe_details', 'saved_at']

    def get_recipe_details(self, obj):
        return RecipeListSerializer(obj.recipe, context=self.context).data