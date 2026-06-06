from django.db import models

class City(models.Model):
    name = models.CharField(max_length=100, unique=True)
    region = models.CharField(max_length=100)
    tagline = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_pandamart_available = models.BooleanField(default=False)
    image = models.ImageField(upload_to='city_images/', blank=True, null=True)
    famous_dishes = models.JSONField(default=list, blank=True, null=True)

    def __str__(self):
        return self.name

class Recipe(models.Model):
    DIETARY_CHOICES = [('veg', 'Vegetarian'), ('non_veg', 'Non-Vegetarian'), ('mixed', 'Mixed')]
    SPICE_CHOICES = [('Mild', 'Mild'), ('Medium', 'Medium'), ('Hot', 'Hot')]
    
    title = models.CharField(max_length=200)
    description = models.TextField(default="No description provided")
    ingredients = models.TextField(default="No ingredients listed")
    instructions = models.TextField(default="No instructions provided")
    prep_time = models.IntegerField(help_text="Time in minutes", default=0)
    calories = models.IntegerField(default=0)
    image = models.ImageField(upload_to='recipe_images/', null=True, blank=True)
    cuisine = models.CharField(max_length=100, default='Pakistani')
    dietary_type = models.CharField(max_length=20, choices=DIETARY_CHOICES, default='mixed')
    spice_level = models.CharField(max_length=20, choices=SPICE_CHOICES, default='Medium')
    estimated_protein = models.IntegerField(default=0, help_text="Protein in grams")
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='recipes', null=True, blank=True)
    is_vegetarian = models.BooleanField(default=False)
    is_sugar_free = models.BooleanField(default=False)
    is_low_fat = models.BooleanField(default=False)

    @property
    def kcal(self):
        return self.calories

    def __str__(self):
        return self.title

class AIGeneratedRecipe(models.Model):
    title = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    ingredients = models.TextField()
    instructions = models.TextField()
    prep_time = models.IntegerField(default=30)
    kcal = models.IntegerField(default=350)
    cuisine = models.CharField(max_length=100, default="Pakistani")
    dietary_type = models.CharField(max_length=50, blank=True, default="mixed")
    spice_level = models.CharField(max_length=20, blank=True, default="Medium")
    youtube_video_id = models.CharField(max_length=50, blank=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    view_count = models.IntegerField(default=0)

    class Meta:
        indexes = [models.Index(fields=['title']), models.Index(fields=['-view_count'])]

    def __str__(self):
        return self.title