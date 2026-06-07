import json
import os
from django.core.management.base import BaseCommand
from apps.recipes.models import Recipe
from apps.recipes.models import City 

class Command(BaseCommand):
    help = 'Import cities and recipes from JSON file'
    
    def handle(self, *args, **kwargs):
        json_file = 'cities_data.json'
        
        if not os.path.exists(json_file):
            self.stdout.write(self.style.ERROR(f'❌ File not found: {json_file}'))
            return
        
        with open(json_file, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Import Cities
        self.stdout.write('\n📊 Importing Cities...')
        self.stdout.write('=' * 50)
        
        for city_data in data['cities']:
            city, created = City.objects.get_or_create(
                name=city_data['name'],
                defaults={
                    'region': city_data['region'],
                    'tagline': city_data['tagline'],
                    'latitude': city_data['latitude'],
                    'longitude': city_data['longitude'],
                    'is_pandamart_available': city_data['is_pandamart_available'],
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created city: {city.name}'))
            else:
                self.stdout.write(f'• City exists: {city.name}')
        
        # Import Recipes
        self.stdout.write('\n🍽️ Importing Recipes...')
        self.stdout.write('=' * 50)
        
        recipes_created = 0
        recipes_failed = 0
        
        for recipe_data in data['recipes']:
            try:
                city = City.objects.get(name=recipe_data['city_name'])
                
                recipe, created = Recipe.objects.get_or_create(
                    title=recipe_data['title'],
                    defaults={
                        'description': recipe_data['description'],
                        'ingredients': recipe_data['ingredients'],
                        'instructions': recipe_data['instructions'],
                        'prep_time': recipe_data['prep_time'],
                        'calories': recipe_data['calories'],
                        'cuisine': recipe_data['cuisine'],
                        'dietary_type': recipe_data['dietary_type'],
                        'spice_level': recipe_data['spice_level'],
                        'estimated_protein': recipe_data['estimated_protein'],
                        'city': city,  # Now this will work
                        'is_vegetarian': recipe_data['is_vegetarian'],
                        'is_sugar_free': recipe_data['is_sugar_free'],
                        'is_low_fat': recipe_data['is_low_fat'],
                    }
                )
                
                if created:
                    recipes_created += 1
                    self.stdout.write(self.style.SUCCESS(f'✓ Created recipe: {recipe.title}'))
                else:
                    self.stdout.write(f'• Recipe exists: {recipe.title}')
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error: {recipe_data["title"]} - {str(e)}'))
                recipes_failed += 1
        
        # Summary
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('✅ IMPORT COMPLETE!'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'📊 Cities: {City.objects.count()}')
        self.stdout.write(f'🍽️ Recipes created: {recipes_created}')
        self.stdout.write(f'❌ Recipes failed: {recipes_failed}')
        self.stdout.write('=' * 50)