import os
import django
import json

# Django settings connect karein
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') # 'core' ki jagah apne project ka naam likhein
django.setup()

from accounts.models import Recipe # Apne model ka sahi path dein

def run_seed():
    with open('recipes_data.json') as f:
        data = json.load(f)
        for item in data:
            Recipe.objects.get_or_create(
                title=item['title'],
                category=item['category'],
                kcal=item['kcal'],
                prep_time=item['prep_time'],
                protein=item['protein'],
                ingredients=item['ingredients'],
                instructions=item['instructions'],
                image=item['image']
            )
    print("20 Recipes successfully saved to PostgreSQL!")

if __name__ == '__main__':
    run_seed()