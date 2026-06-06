
# apps/recipes/services.py
import os
import requests
import random
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY") or "AIzaSyByBTRLlawcXiiIznJh8rprwrSymEmv8Gc"
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")

# Initialize Groq client
groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("✅ Groq client initialized successfully")
    except Exception as e:
        print(f"❌ Groq client initialization failed: {e}")
else:
    print("❌ GROQ_API_KEY not found in environment variables")


def get_groq_client():
    """Return Groq client instance"""
    return groq_client


def fetch_youtube_video_id(recipe_title):
    """Fetch YouTube video ID for recipe"""
    try:
        search_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': f"how to cook {recipe_title} recipe authentic",
            'key': YOUTUBE_API_KEY,
            'maxResults': 1,
            'type': 'video'
        }
        res = requests.get(search_url, params=params, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data.get('items'):
                return data['items'][0]['id']['videoId']
    except Exception as e:
        print(f"YouTube fetch failed: {e}")
    return None


def fetch_pexels_image(dish_name):
    """Fetch image from Pexels API"""
    try:
        if not PEXELS_API_KEY:
            print("Pexels API key not found")
            return get_fallback_image(dish_name)
        
        search_query = f"{dish_name} pakistani food"
        url = "https://api.pexels.com/v1/search"
        headers = {"Authorization": PEXELS_API_KEY}
        params = {
            "query": search_query,
            "per_page": 3,
            "orientation": "landscape"
        }
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("photos") and len(data["photos"]) > 0:
                # Return random image from results
                photo = random.choice(data["photos"])
                return photo["src"]["medium"]
        
        return get_fallback_image(dish_name)
        
    except Exception as e:
        print(f"Pexels API error: {e}")
        return get_fallback_image(dish_name)


def get_fallback_image(dish_name):
    """Return fallback images for Pakistani dishes"""
    dish_lower = dish_name.lower()
    
    fallbacks = {
        'biryani': 'https://images.pexels.com/photos/16188923/pexels-photo-16188923.jpeg',
        'karahi': 'https://images.pexels.com/photos/2672759/pexels-photo-2672759.jpeg',
        'nihari': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
        'haleem': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        'korma': 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg',
        'chicken': 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
        'kabab': 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
        'daal': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        'roti': 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
        'default': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg'
    }
    
    for key, url in fallbacks.items():
        if key in dish_lower:
            return url
    
    return fallbacks['default']