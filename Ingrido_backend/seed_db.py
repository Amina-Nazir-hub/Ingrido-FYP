import os
import django

# Django settings ko configure karna
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import City, Recipe

def seed_database():
    print("🚀 Seeding started...")

    # 1. Purana data saaf karna
    Recipe.objects.all().delete()
    City.objects.all().delete()
    print("🗑️  Old data cleared.")

    # 2. Cities ka Data (Sahi Image Paths ke saath)
    cities_data = [
        {"name": "Karachi", "region": "Sindh", "image": "city_images/Karachi.jpeg", "is_pandamart_available": True},
        {"name": "Lahore", "region": "Punjab", "image": "city_images/Lahore.jpeg", "is_pandamart_available": True},
        {"name": "Islamabad", "region": "Capital Territory", "image": "city_images/Islamabad.jpeg", "is_pandamart_available": True},
        {"name": "Peshawar", "region": "KPK", "image": "city_images/Peshawar.jpeg", "is_pandamart_available": False},
        {"name": "Quetta", "region": "Balochistan", "image": "city_images/Quetta.jpeg", "is_pandamart_available": False},
        {"name": "Skardu", "region": "Gilgit-Baltistan", "image": "city_images/Skardu.jpeg", "is_pandamart_available": False},
    ]

    city_objs = {}
    for city in cities_data:
        obj = City.objects.create(
            name=city['name'],
            region=city['region'],
            image=city['image'],
            is_pandamart_available=city['is_pandamart_available'],
            latitude=0.0, # Aap apni coordinates add kar sakti hain
            longitude=0.0
        )
        city_objs[city['name']] = obj
        print(f"✅ City created: {city['name']}")

    # 3. Recipes ka Data
    recipes_data = [
        {
            "city": "Karachi",
            "title": "Sindhi Biryani",
            "kcal": 520,
            "prep_time": "60",
            "ingredients": "Basmati rice 2 cups\nMutton 500g\nYogurt 1 cup\nSpices",
            "instructions": "1. Marinate meat.\n2. Boil rice.\n3. Layer and cook (dum).",
            "substitutions": {"mutton": "Chicken or Beef", "yogurt": "Sour cream"}
        },
        {
            "city": "Skardu",
            "title": "Mamtu (Dumplings)",
            "kcal": 290,
            "prep_time": "60",
            "ingredients": "Minced beef\nOnions\nFlour dough\nCumin",
            "instructions": "1. Prepare dough.\n2. Fill with meat mixture.\n3. Steam for 30 mins.",
            "substitutions": {"beef": "Minced Lamb", "onions": "Shallots"}
        }
    ]

    for r in recipes_data:
        city_obj = city_objs.get(r['city'])
        if city_obj:
            Recipe.objects.create(
                city=city_obj,
                title=r['title'],
                kcal=r['kcal'],
                prep_time=r['prep_time'],
                ingredients=r['ingredients'],
                instructions=r['instructions'],
                substitutions=r['substitutions']
            )
            print(f"🍽️  Recipe added: {r['title']}")

    print("\n✅ Database Seeding Successful!")

if __name__ == "__main__":
    seed_database()