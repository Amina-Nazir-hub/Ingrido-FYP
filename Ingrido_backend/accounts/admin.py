from django.contrib import admin
from .models import City, Recipe, SavedRecipe, UserProfile

# Models ko yahan register karein taake woh admin panel mein dikhein
admin.site.register(City)
admin.site.register(Recipe)
admin.site.register(SavedRecipe)
admin.site.register(UserProfile)