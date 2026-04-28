from django.db import models
from django.contrib.auth.models import User

# 1. Purana UserProfile (Jo aapke paas pehle se hai)
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    health_conditions = models.JSONField(default=list)
    dietary_preferences = models.JSONField(default=list)

    def __str__(self):
        return self.user.username

# 2. Naya Recipe Model (Seed script aur frontend ke liye zaroori)
class Recipe(models.Model):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100) # e.g. "Quick & Easy"
    image = models.ImageField(upload_to='recipes/')
    kcal = models.IntegerField()
    prep_time = models.CharField(max_length=50) # e.g. "15 mins"
    protein = models.CharField(max_length=50)   # e.g. "20g"
    ingredients = models.TextField()             # Modal ke liye
    instructions = models.TextField()            # Modal ke liye

    def __str__(self):
        return self.title

# 3. SavedRecipe Model (Bookmark toggle ke liye)
class SavedRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe') # Taake ek user ek recipe do baar save na kare

    def __str__(self):
        return f"{self.user.username} saved {self.recipe.title}"