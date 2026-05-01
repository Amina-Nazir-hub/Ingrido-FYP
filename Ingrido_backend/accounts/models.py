from django.db import models
from django.contrib.auth.models import User

# ─── 1. UserProfile Model ──────────────────────────────────────────────────────
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    health_conditions = models.JSONField(default=list)
    dietary_preferences = models.JSONField(default=list)

    def __str__(self):
        return self.user.username


# ─── 2. City Model (UPDATED with Tagline) ──────────────────────────────────────
class City(models.Model):
    name = models.CharField(max_length=100, unique=True)
    region = models.CharField(max_length=100) # e.g., "Punjab", "Sindh", "Gilgit-Baltistan"
    tagline = models.CharField(max_length=255, blank=True, null=True) # e.g., "The City of Lights"
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    is_pandamart_available = models.BooleanField(default=False)
    image = models.ImageField(upload_to='city_images/', null=True, blank=True)

    class Meta:
        verbose_name_plural = "Cities" # Admin mein 'Citys' ki jagah 'Cities' dikhayega

    def __str__(self):
        return self.name


# ─── 3. Recipe Model (ForeignKey Linked) ───────────────────────────────────────
class Recipe(models.Model):
    # Foreign Key City ke sath: 
    # SET_NULL isliye rakha hai ke agar city delete ho toh recipe delete na ho.
    city = models.ForeignKey(
        City, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='recipes'
    )
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    kcal = models.IntegerField()
    prep_time = models.CharField(max_length=50)
    protein = models.CharField(max_length=50)
    ingredients = models.TextField()
    instructions = models.TextField()
    substitutions = models.JSONField(default=dict, blank=True)
    # e.g. {"cream": "Use 3/4 cup milk + 1/4 cup butter"}

    def __str__(self):
        return self.title


# ─── 4. SavedRecipe Model ──────────────────────────────────────────────────────
class SavedRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_recipes')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.username} saved {self.recipe.title}"