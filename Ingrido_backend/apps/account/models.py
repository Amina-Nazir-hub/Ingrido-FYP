# User, Profile, SavedRecipe, SearchHistory, ViewedHistory
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from apps.recipes.models import Recipe

class User(AbstractUser):
    email = models.EmailField(unique=True)
    
    def __str__(self):
        return self.email

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    health_conditions = models.JSONField(default=list)
    dietary_preferences = models.JSONField(default=list)
    ai_bookmarks = models.JSONField(default=list)  # For AI recipes

    def __str__(self):
        return self.user.username

class SavedRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)
    
    # ✅ YEH FIELD ADD KARO
    image_url = models.CharField(max_length=500, blank=True, null=True)
    
    class Meta:
        unique_together = ['user', 'recipe']

class UserSearchHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='search_history')
    query = models.CharField(max_length=200)
    searched_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-searched_at']
        unique_together = ('user', 'query')

class UserViewedRecipe(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='viewed_recipes')
    recipe_id = models.CharField(max_length=100)
    recipe_title = models.CharField(max_length=255)
    recipe_data = models.JSONField(default=dict)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-viewed_at']
        unique_together = ('user', 'recipe_id')