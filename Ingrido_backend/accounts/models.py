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
    region = models.CharField(
        max_length=100
    )  # e.g. Punjab, Sindh, Gilgit-Baltistan
    tagline = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )  # e.g. "The City of Lights"
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    is_pandamart_available = models.BooleanField(default=False)
    image = models.ImageField(
        upload_to='city_images/',
        blank=True,
        null=True
    )

    class Meta:
        verbose_name_plural = "Cities"

    def __str__(self):
        return self.name


# ─────────────────────────────────────────────
# 3. RECIPE MODEL
# ─────────────────────────────────────────────
class Recipe(models.Model):
    city = models.ForeignKey(
        City,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recipes'
    )

    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)

    # AI-generated or manually uploaded image
    image = models.ImageField(
        upload_to='recipes/',
        blank=True,
        null=True
    )

    # YouTube Video ID (e.g. dQw4w9WgXcQ)
    # Isme sirf video ka unique code save hoga
    youtube_video_id = models.CharField(
        max_length=50, 
        blank=True, 
        null=True
    )

    kcal = models.IntegerField()
    prep_time = models.CharField(max_length=50)
    protein = models.CharField(max_length=50)

    ingredients = models.TextField()
    instructions = models.TextField()

    # Example:
    # {"cream": "Use 3/4 cup milk + 1/4 cup butter"}
    substitutions = models.JSONField(
        default=dict,
        blank=True
    )

    def __str__(self):
        return self.title


# ─────────────────────────────────────────────
# 4. SAVED RECIPE MODEL
# ─────────────────────────────────────────────
class SavedRecipe(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='saved_recipes'
    )
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='saved_by'
    )
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # User aik hi recipe ko bar bar save nahi kar sakta
        unique_together = ('user', 'recipe')

    def __str__(self):
        return f"{self.user.username} saved {self.recipe.title}"