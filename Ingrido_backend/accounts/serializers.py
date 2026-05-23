from rest_framework import serializers
from django.contrib.auth.models import User
from .models import City, Recipe, SavedRecipe, UserProfile, SavedMealPlan
from urllib.parse import quote

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
        return obj.recipes.count()


# ─────────────────────────────────────────────
# 3. RECIPE LIST SERIALIZER (Used on dishes listing page)
# ─────────────────────────────────────────────
class RecipeListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    kcal = serializers.ReadOnlyField(source='calories') 

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'prep_time', 'kcal', 'dietary_type', 'is_saved']

    def get_image(self, obj):
        request = self.context.get('request')
        
        # 1. Priority: Manual Uploaded Image
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        
        # 2. Priority: AI Generated Image path from DB (if exists)
        if hasattr(obj, 'ai_generated_image') and obj.ai_generated_image:
            if request:
                return request.build_absolute_uri(obj.ai_generated_image.url)
            return obj.ai_generated_image.url
        
        # 3. Fallback: Direct Pollinations AI URL
        # Sirf title ko encode karein, poore link ko nahi
        encoded_title = quote(f"Pakistani {obj.title} dish, high resolution food photography")
        return f"https://image.pollinations.ai/prompt/{encoded_title}?width=800&height=500&nologo=true"

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False


# ─────────────────────────────────────────────
# 4. RECIPE DETAIL SERIALIZER
# ─────────────────────────────────────────────
class RecipeDetailSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    kcal = serializers.ReadOnlyField(source='calories')
    city_name = serializers.ReadOnlyField(source='city.name')

    class Meta:
        model = Recipe
        fields = '__all__'

    def get_image(self, recipe):
        request = self.context.get('request')
        if recipe.image:
            if request:
                return request.build_absolute_uri(recipe.image.url)
            return recipe.image.url
        
        # Detail page ke liye thora bara image size
        encoded_title = quote(f"Pakistani {recipe.title} food photography, authentic style")
        return f"https://image.pollinations.ai/prompt/{encoded_title}?width=1200&height=600&nologo=true"


# ─────────────────────────────────────────────
# 5. SAVED RECIPE SERIALIZER
# ─────────────────────────────────────────────
class SavedRecipeSerializer(serializers.ModelSerializer):
    # Important: source='recipe' ensures we use the related recipe object
    recipe_details = RecipeListSerializer(source='recipe', read_only=True)

    class Meta:
        model = SavedRecipe
        fields = ['id', 'user', 'recipe', 'recipe_details', 'saved_at']
        read_only_fields = ['id', 'user', 'saved_at']


# ─────────────────────────────────────────────
# 6. SAVED MEAL PLAN SERIALIZER
# ─────────────────────────────────────────────
class SavedMealPlanSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = SavedMealPlan
        fields = [
            'id',
            'user',
            'health_condition',
            'dietary_preference',
            'user_name',
            'weekly_plan',
            'is_active',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.username if obj.user else None