"""
seed.py — Run this once to populate the database with cities and sample recipes.

Usage:
    python manage.py shell < seed.py
  OR
    python seed.py  (if you set up Django settings manually at the top)
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import City, Recipe

# ─── 1. CLEAR OLD DATA ─────────────────────────────────────────────────────────
Recipe.objects.all().delete()
City.objects.all().delete()
print("Old data cleared.")

# ─── 2. SEED CITIES ───────────────────────────────────────────────────────────
cities_data = [
    {
        "name": "Karachi",
        "region": "Sindh",
        "latitude": 24.8607,
        "longitude": 67.0011,
        "is_pandamart_available": True,
        "image": "/assets/Karachi.jpeg",
    },
    {
        "name": "Lahore",
        "region": "Punjab",
        "latitude": 31.5204,
        "longitude": 74.3587,
        "is_pandamart_available": True,
        "image": "/assets/Lahore.jpeg",
    },
    {
        "name": "Islamabad",
        "region": "Capital Territory",
        "latitude": 33.6844,
        "longitude": 73.0479,
        "is_pandamart_available": True,
        "image": "/assets/Islamabad.jpeg",
    },
    {
        "name": "Peshawar",
        "region": "Khyber Pakhtunkhwa",
        "latitude": 34.0151,
        "longitude": 71.5249,
        "is_pandamart_available": False,
        "image": "/assets/Peshawar.jpeg",
    },
    {
        "name": "Quetta",
        "region": "Balochistan",
        "latitude": 30.1798,
        "longitude": 66.9750,
        "is_pandamart_available": False,
        "image": "/assets/Quetta.jpeg",
    },
    {
        "name": "Multan",
        "region": "Punjab",
        "latitude": 30.1575,
        "longitude": 71.5249,
        "is_pandamart_available": False,
        "image": "/assets/Multan.jpeg",
    },
    {
        "name": "Faisalabad",
        "region": "Punjab",
        "latitude": 31.4504,
        "longitude": 73.1350,
        "is_pandamart_available": False,
        "image": "/assets/Faisalabad.jpeg",
    },
    {
        "name": "Sialkot",
        "region": "Punjab",
        "latitude": 32.4945,
        "longitude": 74.5229,
        "is_pandamart_available": False,
        "image": "/assets/Sialkot.jpeg",
    },
    {
        "name": "Hyderabad",
        "region": "Sindh",
        "latitude": 25.3960,
        "longitude": 68.3578,
        "is_pandamart_available": False,
        "image": "/assets/Hyderabad.jpeg",
    },
    {
        "name": "Skardu",
        "region": "Gilgit-Baltistan",
        "latitude": 35.2971,
        "longitude": 75.6330,
        "is_pandamart_available": False,
        "image": "/assets/Skardu.jpeg",
    },
]

city_objects = {}
for c in cities_data:
    obj = City.objects.create(**c)
    city_objects[c["name"]] = obj
    print(f"  ✓ City created: {c['name']}")

# ─── 3. SEED RECIPES ──────────────────────────────────────────────────────────
recipes_data = [
    # ── KARACHI ──
    {
        "city": "Karachi",
        "title": "Sindhi Biryani",
        "category": "Rice & Biryani",
        "kcal": 520,
        "prep_time": "60 mins",
        "protein": "28g",
        "ingredients": "Basmati rice 2 cups, Mutton 500g, Yogurt 1 cup, Tomatoes 3, Onion 2, Green chilies 6, Tamarind paste 2 tbsp, Biryani masala 3 tbsp, Oil 1/2 cup, Salt to taste, Fresh coriander & mint",
        "instructions": "1. Marinate mutton with yogurt and spices for 30 mins.\n2. Fry onions golden, add tomatoes and marinated mutton.\n3. Cook until mutton is tender.\n4. Layer par-boiled rice over the gravy.\n5. Add tamarind water, seal pot and dum cook for 20 mins.",
        "substitutions": {
            "mutton": "Use beef or chicken (reduce cook time for chicken to 20 mins)",
            "tamarind paste": "Use 2 tbsp lemon juice as a souring agent",
            "yogurt": "Use 1/2 cup sour cream mixed with 1/4 cup water",
            "basmati rice": "Long-grain rice works but texture will differ"
        }
    },
    {
        "city": "Karachi",
        "title": "Bun Kebab",
        "category": "Street Food",
        "kcal": 323,
        "prep_time": "31 mins",
        "protein": "19g",
        "ingredients": "Minced beef 300g, Chana dal (soaked) 1/2 cup, Egg 1, Bread buns 4, Chutney, Onion rings, Tomato slices, Green chili, Spices: cumin, coriander, garam masala, red chili",
        "instructions": "1. Boil chana dal until soft, drain.\n2. Mix minced beef with spices and dal, blend coarsely.\n3. Shape into patties and shallow fry until golden.\n4. Toast buns, layer with chutney, onions, tomato and patty.",
        "substitutions": {
            "minced beef": "Use minced chicken or a plant-based mince",
            "chana dal": "Use red lentils (masoor dal) — texture will be softer",
            "egg": "Use 2 tbsp gram flour paste to bind patties"
        }
    },
    {
        "city": "Karachi",
        "title": "Nihari",
        "category": "Slow Cook",
        "kcal": 610,
        "prep_time": "180 mins",
        "protein": "38g",
        "ingredients": "Beef shank 1 kg, Wheat flour 3 tbsp, Nihari masala 4 tbsp, Ghee 4 tbsp, Onion 1 large, Ginger-garlic paste 2 tbsp, Salt to taste, Garnish: ginger julienne, green chili, lemon, fresh coriander",
        "instructions": "1. Heat ghee, fry onions until golden.\n2. Add ginger-garlic paste and nihari masala.\n3. Add beef shank and sear on high heat.\n4. Add 6 cups water, cook on low heat for 2.5 hours.\n5. Mix flour in water and add as thickener.\n6. Simmer 30 more mins until gravy is thick.",
        "substitutions": {
            "beef shank": "Use goat leg pieces for a lighter flavor",
            "ghee": "Use butter or cooking oil",
            "nihari masala": "Mix: 1 tsp each of fennel, cumin, coriander, cloves, black pepper, cardamom"
        }
    },
    {
        "city": "Karachi",
        "title": "Haleem",
        "category": "Slow Cook",
        "kcal": 469,
        "prep_time": "120 mins",
        "protein": "33g",
        "ingredients": "Beef 500g, Mixed lentils 1 cup (chana, masoor, moong), Broken wheat 1/2 cup, Oats 1/4 cup, Haleem masala 2 tbsp, Fried onion for garnish, Ginger-garlic paste, Oil, Salt",
        "instructions": "1. Pressure cook beef until very tender, shred it.\n2. Separately cook lentils and wheat until mushy.\n3. Combine beef, lentils and wheat in pot.\n4. Add haleem masala and cook blending everything together.\n5. Use hand blender for desired consistency.\n6. Garnish with fried onions, lemon, ginger.",
        "substitutions": {
            "beef": "Use boneless chicken thighs (reduce cook time)",
            "broken wheat": "Use fine semolina (sooji) or rolled oats",
            "mixed lentils": "Use only masoor dal if others unavailable"
        }
    },

    # ── LAHORE ──
    {
        "city": "Lahore",
        "title": "Siri Paye",
        "category": "Slow Cook",
        "kcal": 580,
        "prep_time": "240 mins",
        "protein": "42g",
        "ingredients": "Cow feet (paye) 4 pieces, Cow head pieces 500g, Onion 2, Ginger-garlic paste 3 tbsp, Siri paye masala 3 tbsp, Oil 1/2 cup, Salt, Garnish: ginger, green chili, lemon, coriander",
        "instructions": "1. Clean paye thoroughly with hot water.\n2. Pressure cook paye with salt for 45 mins.\n3. Fry onions, add masala and ginger-garlic paste.\n4. Add paye stock and pieces, simmer for 2 hours.\n5. Serve with naan and garnish.",
        "substitutions": {
            "cow feet": "Use mutton trotters (paye) — cook time reduces",
            "siri paye masala": "Use nihari masala as a close alternative"
        }
    },
    {
        "city": "Lahore",
        "title": "Lahori Chargha",
        "category": "BBQ & Grill",
        "kcal": 490,
        "prep_time": "90 mins",
        "protein": "45g",
        "ingredients": "Whole chicken 1 (skin-on), Yogurt 1 cup, Chargha masala 3 tbsp, Lemon juice 2 tbsp, Oil for deep fry, Ginger-garlic paste 2 tbsp, Salt, Red chili, Turmeric",
        "instructions": "1. Make deep cuts in chicken.\n2. Marinate with all spices and yogurt for 4 hours.\n3. Steam marinated chicken for 30 minutes.\n4. Deep fry until golden and crispy.\n5. Serve with raita and naan.",
        "substitutions": {
            "yogurt": "Use thick buttermilk for marinade",
            "chargha masala": "Mix: cumin, coriander, garam masala, red chili, turmeric in equal parts"
        }
    },
    {
        "city": "Lahore",
        "title": "Lahori Karahi",
        "category": "Karahi & Curries",
        "kcal": 445,
        "prep_time": "45 mins",
        "protein": "35g",
        "ingredients": "Chicken or mutton 1 kg, Tomatoes 4 (chopped), Ginger 2 inch piece, Green chilies 4-6, Oil 1/2 cup, Black pepper 1 tsp, Cumin 1 tsp, Salt, Fresh coriander",
        "instructions": "1. Heat oil in karahi on high heat.\n2. Add meat, fry until color changes.\n3. Add tomatoes and cook until they melt into the meat.\n4. Add ginger, green chilies and spices.\n5. Cook on high flame until oil separates.\n6. Garnish with ginger julienne and coriander.",
        "substitutions": {
            "fresh tomatoes": "Use 2 tbsp tomato paste + 1/2 cup water",
            "green chilies": "Use red chili flakes to adjust heat level"
        }
    },

    # ── ISLAMABAD ──
    {
        "city": "Islamabad",
        "title": "Doodh Patti Chai",
        "category": "Beverages",
        "kcal": 120,
        "prep_time": "10 mins",
        "protein": "4g",
        "ingredients": "Full cream milk 2 cups, Black tea leaves 2 tsp, Sugar 2 tbsp, Cardamom 2 pods (crushed)",
        "instructions": "1. Boil milk directly without water.\n2. Add tea leaves and crushed cardamom.\n3. Simmer on low flame for 5 minutes.\n4. Add sugar, strain and serve hot.",
        "substitutions": {
            "full cream milk": "Use evaporated milk for creamier taste",
            "cardamom": "Use a small cinnamon stick"
        }
    },
    {
        "city": "Islamabad",
        "title": "Chicken Tikka",
        "category": "BBQ & Grill",
        "kcal": 320,
        "prep_time": "40 mins",
        "protein": "38g",
        "ingredients": "Chicken pieces 1 kg, Yogurt 1 cup, Tikka masala 3 tbsp, Lemon juice 2 tbsp, Oil 3 tbsp, Red food color (optional), Ginger-garlic paste 2 tbsp",
        "instructions": "1. Mix all marinade ingredients.\n2. Marinate chicken for minimum 2 hours.\n3. Grill on charcoal or bake at 220°C for 25-30 mins.\n4. Baste with oil midway.\n5. Serve with naan, raita and chutney.",
        "substitutions": {
            "yogurt": "Use thick cream with lemon juice",
            "tikka masala": "Mix: cumin, coriander, paprika, garam masala, turmeric"
        }
    },

    # ── PESHAWAR ──
    {
        "city": "Peshawar",
        "title": "Chapli Kebab",
        "category": "BBQ & Grill",
        "kcal": 410,
        "prep_time": "35 mins",
        "protein": "32g",
        "ingredients": "Minced beef 500g (coarse), Onion 1 (grated), Tomato 1 (seeds removed), Coriander seeds 2 tbsp (crushed), Cumin 1 tsp, Red chili flakes 1 tsp, Green chili 4, Fresh coriander, Egg 1, Fat (beef tallow or oil), Pomegranate seeds 1 tbsp",
        "instructions": "1. Mix all ingredients, knead well.\n2. Refrigerate mixture for 30 minutes.\n3. Shape into large flat patties.\n4. Fry in generous oil on medium heat until cooked through.",
        "substitutions": {
            "beef tallow": "Use cooking oil — flavor will be lighter",
            "pomegranate seeds": "Use dried cranberries or skip entirely",
            "coarse minced beef": "Use a mix of beef mince + small lamb cubes for texture"
        }
    },
    {
        "city": "Peshawar",
        "title": "Peshawari Karahi",
        "category": "Karahi & Curries",
        "kcal": 520,
        "prep_time": "50 mins",
        "protein": "40g",
        "ingredients": "Mutton 1 kg, Tomatoes 5, Ginger 3 inch, Green chilies 8, Oil 1/2 cup, Black pepper 2 tsp, Salt, Cream 2 tbsp, Fresh coriander",
        "instructions": "1. Heat oil, add mutton and sear on high heat.\n2. Add chopped tomatoes, cook until soft.\n3. Add ginger, green chilies, black pepper.\n4. Cover and cook on medium until mutton is tender.\n5. Finish with cream and fresh coriander.",
        "substitutions": {
            "mutton": "Use bone-in chicken for quicker cook",
            "cream": "Use 2 tbsp full-fat yogurt"
        }
    },

    # ── QUETTA ──
    {
        "city": "Quetta",
        "title": "Sajji",
        "category": "BBQ & Grill",
        "kcal": 650,
        "prep_time": "300 mins",
        "protein": "55g",
        "ingredients": "Whole lamb or chicken, Salt (generous), Lemon juice, Sajji masala (minimal: just salt and lemon), Charcoal for cooking",
        "instructions": "1. Skewer whole lamb or chicken.\n2. Rub with salt and lemon juice only.\n3. Roast over charcoal for 4-5 hours (lamb) or 1.5 hours (chicken).\n4. Serve with rice cooked in meat stock.",
        "substitutions": {
            "sajji masala": "Use just rock salt and lemon — authentic sajji has very minimal spicing",
            "charcoal": "Use oven at 160°C fan-forced for a home version"
        }
    },

    # ── MULTAN ──
    {
        "city": "Multan",
        "title": "Multani Sohan Halwa",
        "category": "Desserts",
        "kcal": 380,
        "prep_time": "60 mins",
        "protein": "5g",
        "ingredients": "Wheat starch (maida) 1 cup, Sugar 2 cups, Ghee 1 cup, Milk 2 cups, Cardamom powder 1 tsp, Saffron (optional), Almonds, Pistachios for garnish",
        "instructions": "1. Dissolve wheat starch in cold milk.\n2. Cook sugar syrup to one-string consistency.\n3. Add starch mixture slowly, stirring continuously.\n4. Add ghee in parts and keep stirring.\n5. Cook until mixture leaves the sides.\n6. Pour in greased tray, garnish with nuts.",
        "substitutions": {
            "wheat starch": "Use cornstarch (arrowroot) — texture differs slightly",
            "saffron": "Use a pinch of turmeric for color only",
            "ghee": "Use unsalted butter"
        }
    },

    # ── SKARDU ──
    {
        "city": "Skardu",
        "title": "Mamtu (Dumplings)",
        "category": "Traditional",
        "kcal": 290,
        "prep_time": "60 mins",
        "protein": "18g",
        "ingredients": "All-purpose flour 2 cups, Minced beef or mutton 300g, Onion 2 (finely chopped), Cumin 1 tsp, Black pepper 1 tsp, Salt, Oil 2 tbsp, Water for dough",
        "instructions": "1. Make stiff dough with flour, salt and water.\n2. Mix minced meat with onions and spices.\n3. Roll dough thin, cut into circles.\n4. Fill with meat mixture, seal edges.\n5. Steam mamtu for 25-30 minutes.\n6. Serve with tomato-based dipping sauce.",
        "substitutions": {
            "minced beef": "Use minced chicken or potato-onion filling for vegetarian",
            "all-purpose flour": "Use half whole wheat flour for more nutrition"
        }
    },
]

# ─── 4. CREATE RECIPE OBJECTS ─────────────────────────────────────────────────
for r in recipes_data:
    city_name = r.pop("city")
    city_obj = city_objects.get(city_name)
    if city_obj:
        Recipe.objects.create(city=city_obj, **r)
        print(f"  ✓ Recipe created: {r['title']} ({city_name})")
    else:
        print(f"  ✗ City not found: {city_name}")

print("\n✅ Seed complete!")
print(f"   Cities: {City.objects.count()}")
print(f"   Recipes: {Recipe.objects.count()}")