from rest_framework import serializers
from django.contrib.auth.models import User
from .models import City, Recipe, SavedRecipe, UserProfile, SavedMealPlan


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

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'prep_time', 'kcal', 'category']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


# ─────────────────────────────────────────────
# 4. RECIPE DETAIL SERIALIZER
# Used on single recipe detail page
# ─────────────────────────────────────────────
class RecipeDetailSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    city_name = serializers.ReadOnlyField(source='city.name')

    class Meta:
        model = Recipe
        # Hum ne 'youtube_video_id' ko yahan list mein shamil kiya hai
        fields = [
            'id', 
            'title', 
            'category', 
            'image', 
            'youtube_video_id', 
            'kcal', 
            'prep_time', 
            'protein', 
            'ingredients', 
            'instructions', 
            'substitutions', 
            'city_name', 
            'is_saved'
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


# ─────────────────────────────────────────────
# 6. SAVED MEAL PLAN SERIALIZER (NEW - For Weekly Meal Planner)
# ─────────────────────────────────────────────
class SavedMealPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for saved meal plans
    Used to convert SavedMealPlan model to JSON and back
    """
    
    user_name = serializers.SerializerMethodField()
    plan_age_days = serializers.SerializerMethodField()
    
    class Meta:
        model = SavedMealPlan
        fields = [
            'id',
            'user',
            'user_name',
            'diet_type',
            'weekly_plan',
            'is_active',
            'created_at',
            'updated_at',
            'plan_age_days'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'user_name', 'plan_age_days']
    
    def get_user_name(self, obj):
        """Get username for display"""
        return obj.user.username if obj.user else None
    
    def get_plan_age_days(self, obj):
        """Calculate how many days old the plan is"""
        from datetime import datetime
        if obj.created_at:
            return (datetime.now().date() - obj.created_at.date()).days
        return 0


# ─────────────────────────────────────────────
# 7. SIMPLE MEAL PLAN SERIALIZER (For API responses)
# ─────────────────────────────────────────────
class MealPlanResponseSerializer(serializers.Serializer):
    """
    Serializer for meal plan API responses
    This doesn't need a model, just for response formatting
    """
    weekly_plan = serializers.ListField()
    diet_type = serializers.CharField()
    plan_id = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    message = serializers.CharField(required=False)
    used_preferences = serializers.DictField(required=False)
    has_saved_plan = serializers.BooleanField(required=False)
    is_expired = serializers.BooleanField(required=False)
    days_remaining = serializers.IntegerField(required=False)