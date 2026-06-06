from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, SavedRecipe

User = get_user_model()

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

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['health_conditions', 'dietary_preferences', 'ai_bookmarks']

class SavedRecipeSerializer(serializers.ModelSerializer):
    recipe_title = serializers.CharField(source='recipe.title', read_only=True)
    recipe_image = serializers.SerializerMethodField()
    
    class Meta:
        model = SavedRecipe
        fields = ['id', 'user', 'recipe', 'recipe_title', 'recipe_image', 'saved_at']
    
    def get_recipe_image(self, obj):
        if obj.image_url:
            return obj.image_url
        if obj.recipe.image:
            return obj.recipe.image.url
        return None