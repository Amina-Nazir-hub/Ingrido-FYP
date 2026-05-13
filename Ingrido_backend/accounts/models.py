from django.db import models
from django.contrib.auth.models import User

# ─────────────────────────────────────────────
# 1. USER PROFILE MODEL
# ─────────────────────────────────────────────
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    health_conditions = models.JSONField(default=list)
    dietary_preferences = models.JSONField(default=list)

    def __str__(self):
        return self.user.username


# ─────────────────────────────────────────────
# 2. CITY MODEL
# ─────────────────────────────────────────────
class City(models.Model):
    name = models.CharField(max_length=100, unique=True)
    region = models.CharField(max_length=100)  # e.g. Punjab, Sindh
    tagline = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    is_pandamart_available = models.BooleanField(default=False)
    image = models.ImageField(upload_to='city_images/', blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Cities"


# ─────────────────────────────────────────────
# 3. RECIPE MODEL
# ─────────────────────────────────────────────
class Recipe(models.Model):
    title = models.CharField(max_length=200)
    # Added default to prevent migration errors
    description = models.TextField(default="No description provided")
    ingredients = models.TextField(default="No ingredients listed") 
    instructions = models.TextField(default="No instructions provided")
    prep_time = models.IntegerField(help_text="Time in minutes", default=0)
    calories = models.IntegerField(default=0)
    image = models.ImageField(upload_to='recipe_images/', null=True, blank=True)
    
    # city field updated: null=True, blank=True allows migration without a default value
    city = models.ForeignKey(
        City, 
        on_delete=models.CASCADE, 
        related_name='recipes', 
        null=True, 
        blank=True
    )
    
    # Categories
    is_vegetarian = models.BooleanField(default=False)
    is_sugar_free = models.BooleanField(default=False)
    is_low_fat = models.BooleanField(default=False)

    def __str__(self):
        return self.title


# ─────────────────────────────────────────────
# 4. SAVED RECIPE (BOOKMARKS)
# ─────────────────────────────────────────────
class SavedRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_recipes')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe')


# ─────────────────────────────────────────────
# 5. SAVED MEAL PLAN MODEL
# ─────────────────────────────────────────────
class SavedMealPlan(models.Model):
    HEALTH_CONDITIONS = [
        ('diabetes', 'Diabetes'),
        ('blood_pressure', 'Blood Pressure'),
        ('heart_condition', 'Heart Condition'),
        ('balanced', 'Balanced'),
    ]
    
    DIETARY_PREFS = [
        ('veg', 'Vegetarian'),
        ('non_veg', 'Non-Vegetarian'),
        ('both', 'Both'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='saved_meal_plans'
    )
    
    health_condition = models.CharField(
        max_length=50, 
        choices=HEALTH_CONDITIONS, 
        default='balanced'
    )
    dietary_preference = models.CharField(
        max_length=50, 
        choices=DIETARY_PREFS, 
        default='both'
    )
    
    weekly_plan = models.JSONField(default=list) 
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Plan for {self.user.username} - {self.created_at.date()}"

    class Meta:
        ordering = ['-created_at']