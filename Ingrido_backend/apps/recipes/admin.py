from django.contrib import admin
from .models import City, Recipe, AIGeneratedRecipe

# City Admin - Add/Edit Cities
@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'region', 'get_dishes_count', 'is_pandamart_available', 'latitude', 'longitude')
    list_filter = ('region', 'is_pandamart_available')
    search_fields = ('name', 'region')
    
    def get_dishes_count(self, obj):
        """Return number of recipes for this city"""
        return obj.recipes.count()
    get_dishes_count.short_description = 'Total Dishes'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'region', 'tagline')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude')
        }),
        ('Media', {
            'fields': ('image',)
        }),
        ('Settings', {
            'fields': ('is_pandamart_available',)
        }),
    )

# Recipe Admin - Add/Edit Recipes
@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'city', 'dietary_type', 'prep_time', 'calories', 'spice_level')
    list_filter = ('dietary_type', 'spice_level', 'city', 'is_vegetarian')
    search_fields = ('title', 'description', 'cuisine')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'cuisine', 'city')
        }),
        ('Ingredients & Instructions', {
            'fields': ('ingredients', 'instructions')
        }),
        ('Nutrition & Time', {
            'fields': ('calories', 'prep_time', 'estimated_protein')
        }),
        ('Classification', {
            'fields': ('dietary_type', 'spice_level')
        }),
        ('Media', {
            'fields': ('image', )
        }),
        ('Health Flags', {
            'fields': ('is_vegetarian', 'is_sugar_free', 'is_low_fat')
        }),
    )

# AI Generated Recipe Admin
@admin.register(AIGeneratedRecipe)
class AIGeneratedRecipeAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'prep_time', 'kcal', 'view_count', 'created_at')
    search_fields = ('title',)
    readonly_fields = ('created_at', 'updated_at', 'view_count')