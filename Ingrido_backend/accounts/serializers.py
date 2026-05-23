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

        return obj.recipes.count()





# ─────────────────────────────────────────────

# 3. RECIPE LIST SERIALIZER (Dashboard & City Listing)

# ─────────────────────────────────────────────

class RecipeListSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()

    kcal = serializers.SerializerMethodField()       # ✅ Fixed: Fallback dynamic field

    category = serializers.SerializerMethodField()   # ✅ Fixed: Made dynamic to prevent 'ImproperlyConfigured' crash



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



    def get_kcal(self, obj):

        # Agar 'calories' column hai toh wo uthaye, nahi toh default 350 dede

        return getattr(obj, 'calories', getattr(obj, 'kcal', 350))



    def get_category(self, obj):

        # Agar model mein category field nahi hai toh default 'Pakistani' set ho jaye

        return getattr(obj, 'category', 'Pakistani')





# ─────────────────────────────────────────────

# 4. RECIPE DETAIL SERIALIZER (Single Recipe Page)

# ─────────────────────────────────────────────

class RecipeDetailSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()

    is_saved = serializers.SerializerMethodField()

    city_name = serializers.ReadOnlyField(source='city.name')

    kcal = serializers.SerializerMethodField()       # ✅ Fixed: Fallback dynamic field

    category = serializers.SerializerMethodField()   # ✅ Fixed: Fallback dynamic field



    class Meta:

        model = Recipe

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



    def get_kcal(self, obj):

        return getattr(obj, 'calories', getattr(obj, 'kcal', 350))



    def get_category(self, obj):

        return getattr(obj, 'category', 'Pakistani')





# ─────────────────────────────────────────────

# 5. SAVED RECIPE SERIALIZER (Bookmarks)

# ─────────────────────────────────────────────

class SavedRecipeSerializer(serializers.ModelSerializer):

    id = serializers.ReadOnlyField(source='recipe.id')

    title = serializers.ReadOnlyField(source='recipe.title')

    prep_time = serializers.ReadOnlyField(source='recipe.prep_time')

    kcal = serializers.SerializerMethodField()       # ✅ Fixed: Fallback dynamic field

    category = serializers.SerializerMethodField()   # ✅ Fixed: Fallback dynamic field

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



    def get_kcal(self, obj):

        return getattr(obj.recipe, 'calories', getattr(obj.recipe, 'kcal', 350))



    def get_category(self, obj):

        return getattr(obj.recipe, 'category', 'Pakistani')





# ─────────────────────────────────────────────

# 6. SAVED MEAL PLAN SERIALIZER

# ─────────────────────────────────────────────

class SavedMealPlanSerializer(serializers.ModelSerializer):

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

        return obj.user.username if obj.user else None

    

    def get_plan_age_days(self, obj):

        from datetime import datetime

        if obj.created_at:

            return (datetime.now().date() - obj.created_at.date()).days

        return 0





# ─────────────────────────────────────────────

# 7. SIMPLE MEAL PLAN SERIALIZER

# ─────────────────────────────────────────────

class MealPlanResponseSerializer(serializers.Serializer):

    weekly_plan = serializers.ListField()

    diet_type = serializers.CharField()

    plan_id = serializers.IntegerField()

    created_at = serializers.DateTimeField()

    message = serializers.CharField(required=False)

    used_preferences = serializers.DictField(required=False)

    has_saved_plan = serializers.BooleanField(required=False)

    is_expired = serializers.BooleanField(required=False)

    days_remaining = serializers.IntegerField(required=False)