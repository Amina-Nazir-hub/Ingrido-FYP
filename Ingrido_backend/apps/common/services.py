import requests
import os
import base64
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from dotenv import load_dotenv
import uuid
from django.utils import timezone

load_dotenv()

try:
    from .models import GeneratedImageCache
    CACHE_AVAILABLE = True
except ImportError:
    CACHE_AVAILABLE = False
    print("⚠️ Cache model not found")


# ========== FAMOUS PAKISTANI DISHES - PEXELS SPECIFIC IMAGES ==========
# Dish-specific fallback images (Pexels URLs)
# Jab API fail ho to yeh images show hongi - har dish ki alag image

PEXELS_FALLBACK_IMAGES = {
    # BBQ & Grill Dishes
    'seekh kabab': 'https://images.pexels.com/photos/11917907/pexels-photo-11917907.jpeg',
    'reshmi kabab': 'https://images.pexels.com/photos/11917907/pexels-photo-11917907.jpeg',
    'chicken tikka': 'https://images.pexels.com/photos/14637892/pexels-photo-14637892.jpeg',
    'boti kebab': 'https://images.pexels.com/photos/14637892/pexels-photo-14637892.jpeg',
    'bihari kebab': 'https://images.pexels.com/photos/11917907/pexels-photo-11917907.jpeg',
    'malai boti': 'https://images.pexels.com/photos/11917907/pexels-photo-11917907.jpeg',
    
    # Biryani & Rice Dishes
    'biryani': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    'karachi biryani': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    'sindhi biryani': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    'chicken biryani': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    'pulao': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    'tahari': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    
    # Karahi & Curry Dishes
    'chicken karahi': 'https://images.pexels.com/photos/18501894/pexels-photo-18501894.jpeg',
    'karahi': 'https://images.pexels.com/photos/18501894/pexels-photo-18501894.jpeg',
    'lamb karahi': 'https://images.pexels.com/photos/18501894/pexels-photo-18501894.jpeg',
    'nihari': 'https://images.pexels.com/photos/18501894/pexels-photo-18501894.jpeg',
    'haleem': 'https://images.pexels.com/photos/18501894/pexels-photo-18501894.jpeg',
    'korma': 'https://images.pexels.com/photos/18501894/pexels-photo-18501894.jpeg',
    
    # Street Food
    'gol gappay': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
    'golgappa': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
    'pani puri': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
    'samosa chaat': 'https://images.pexels.com/photos/11612722/pexels-photo-11612722.jpeg',
    'samosa': 'https://images.pexels.com/photos/11612722/pexels-photo-11612722.jpeg',
    'channa chaat': 'https://images.pexels.com/photos/11612722/pexels-photo-11612722.jpeg',
    'dahi baray': 'https://images.pexels.com/photos/11612722/pexels-photo-11612722.jpeg',
    'chaat': 'https://images.pexels.com/photos/11612722/pexels-photo-11612722.jpeg',
    
    # Desserts & Sweets
    'gulab jamun': 'https://images.pexels.com/photos/7481892/pexels-photo-7481892.jpeg',
    'jalebi': 'https://images.pexels.com/photos/7481892/pexels-photo-7481892.jpeg',
    'ras malai': 'https://images.pexels.com/photos/7481892/pexels-photo-7481892.jpeg',
    'kheer': 'https://images.pexels.com/photos/5694681/pexels-photo-5694681.jpeg',
    'falooda': 'https://images.pexels.com/photos/5694681/pexels-photo-5694681.jpeg',
    'shahi tukray': 'https://images.pexels.com/photos/7481892/pexels-photo-7481892.jpeg',
    
    # Drinks & Beverages
    'lassi': 'https://images.pexels.com/photos/5694681/pexels-photo-5694681.jpeg',
    'mango lassi': 'https://images.pexels.com/photos/5694681/pexels-photo-5694681.jpeg',
    'rooh afza': 'https://images.pexels.com/photos/5694681/pexels-photo-5694681.jpeg',
    'sarbat': 'https://images.pexels.com/photos/5694681/pexels-photo-5694681.jpeg',
    
    # Breads
    'naan': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    'roti': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    'paratha': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    
    # Seafood
    'trout fish': 'https://images.pexels.com/photos/18501894/pexels-photo-18501894.jpeg',
    'fish karahi': 'https://images.pexels.com/photos/18501894/pexels-photo-18501894.jpeg',
    'prawn karahi': 'https://images.pexels.com/photos/18501894/pexels-photo-18501894.jpeg',
    
    # Winter Special
    'sarson ka saag': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    'makki ki roti': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
    
    # Summer Special
    'mango kulfi': 'https://images.pexels.com/photos/5694681/pexels-photo-5694681.jpeg',
    'kulfi': 'https://images.pexels.com/photos/5694681/pexels-photo-5694681.jpeg',
}

# Default fallback (if no match found)
DEFAULT_FALLBACK_IMAGE = 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg'


def get_fallback_image(dish_name):
    """
    Return dish-specific fallback image from Pexels
    Based on dish name - har dish ki alag image
    """
    dish_lower = dish_name.lower().strip()
    
    # Exact match check
    if dish_lower in PEXELS_FALLBACK_IMAGES:
        print(f"📍 Using dish-specific fallback: {dish_name}")
        return PEXELS_FALLBACK_IMAGES[dish_lower]
    
    # Partial match check (e.g., "Chicken Biryani" matches "biryani")
    for key, url in PEXELS_FALLBACK_IMAGES.items():
        if key in dish_lower or dish_lower in key:
            print(f"📍 Using partial match fallback: {dish_name} -> {key}")
            return url
    
    # Default fallback
    print(f"📍 Using default fallback for: {dish_name}")
    return DEFAULT_FALLBACK_IMAGE


def get_ai_generated_image(dish_name, width=768, height=768, force_refresh=False):
    """
    Generate image using Cloudflare Workers AI with PostgreSQL caching
    Priority: Database -> Cloudflare API -> Dish-specific Pexels fallback
    """
    
    # ========== STEP 1: DATABASE CACHE CHECK ==========
    if CACHE_AVAILABLE and not force_refresh:
        try:
            cached = GeneratedImageCache.objects.filter(
                dish_name__iexact=dish_name
            ).first()
            
            if cached:
                # Check if file exists locally
                if cached.image_path and default_storage.exists(cached.image_path):
                    print(f"✅ DATABASE CACHE HIT: {dish_name}")
                    cached.last_accessed = timezone.now()
                    cached.save(update_fields=['last_accessed'])
                    return cached.image_url
                elif cached.image_url and cached.image_url.startswith('http'):
                    print(f"✅ DATABASE CACHE HIT (external): {dish_name}")
                    return cached.image_url
                else:
                    print(f"⚠️ Cache file missing for {dish_name}, deleting...")
                    cached.delete()
        except Exception as e:
            print(f"Cache check error: {e}")
    
    # ========== STEP 2: CLOUDFLARE API CALL ==========
    print(f"📡 API CALL (Cloudflare) for: {dish_name}")
    
    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    api_token = os.getenv("CLOUDFLARE_API_TOKEN")
    
    if account_id and api_token:
        try:
            url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/black-forest-labs/flux-1-schnell"
            
            headers = {
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json"
            }
            
            prompt = f"delicious {dish_name} pakistani food, professional food photography, high resolution, restaurant quality"
            
            response = requests.post(
                url,
                json={"prompt": prompt, "width": width, "height": height},
                headers=headers,
                timeout=60
            )
            
            # Rate limit hit (429) or other error
            if response.status_code == 429:
                print(f"⚠️ Cloudflare rate limit (429) for {dish_name}")
                return get_fallback_image(dish_name)
            
            if response.status_code == 200:
                result = response.json()
                image_data = result.get("result", {}).get("image")
                
                if image_data:
                    # Save image locally
                    image_binary = base64.b64decode(image_data)
                    safe_name = dish_name.replace(' ', '_').replace('/', '_').lower()
                    filename = f"ai_images/{safe_name}_{uuid.uuid4().hex[:8]}.png"
                    saved_path = default_storage.save(filename, ContentFile(image_binary))
                    image_url = f"{settings.MEDIA_URL}{saved_path}"
                    
                    # Save to database
                    if CACHE_AVAILABLE:
                        try:
                            obj, created = GeneratedImageCache.objects.update_or_create(
                                dish_name__iexact=dish_name,
                                defaults={
                                    'dish_name': dish_name,
                                    'image_url': image_url,
                                    'image_path': saved_path,
                                    'prompt_used': prompt,
                                    'last_accessed': timezone.now()
                                }
                            )
                            if created:
                                print(f"💾 DATABASE SAVED (new): {dish_name}")
                            else:
                                print(f"💾 DATABASE UPDATED: {dish_name}")
                        except Exception as db_error:
                            print(f"Database save error: {db_error}")
                    
                    print(f"✅ IMAGE GENERATED & SAVED: {dish_name}")
                    return image_url
                    
        except Exception as e:
            print(f"Cloudflare error: {e}")
    
    # ========== STEP 3: DISH-SPECIFIC PEXELS FALLBACK ==========
    print(f"⚠️ Using fallback image for: {dish_name}")
    return get_fallback_image(dish_name)


def pre_generate_famous_dishes():
    """
    Pre-generate images for famous Pakistani dishes
    Call this once to populate database
    """
    famous_dishes = [
        'Biryani', 'Chicken Karahi', 'Gol Gappay', 'Nihari', 'Haleem',
        'Seekh Kabab', 'Chicken Tikka', 'Samosa Chaat', 'Dahi Baray',
        'Gulab Jamun', 'Jalebi', 'Kheer', 'Lassi', 'Mango Kulfi',
        'Falooda', 'Pulao', 'Korma', 'Naan', 'Paratha', 'Fish Karahi'
    ]
    
    results = {'success': [], 'failed': [], 'cached': []}
    
    for dish in famous_dishes:
        if CACHE_AVAILABLE and GeneratedImageCache.objects.filter(dish_name__iexact=dish).exists():
            print(f"⏭️ Already cached: {dish}")
            results['cached'].append(dish)
            continue
        
        url = get_ai_generated_image(dish)
        if url:
            results['success'].append(dish)
            print(f"✅ Generated: {dish}")
        else:
            results['failed'].append(dish)
    
    print(f"\n📊 Summary: Success: {len(results['success'])}, Failed: {len(results['failed'])}, Cached: {len(results['cached'])}")
    return results


def get_cache_stats():
    """Get cache statistics"""
    if CACHE_AVAILABLE:
        total = GeneratedImageCache.objects.count()
        print(f"\n📊 CACHE STATISTICS:")
        print(f"Total images in database: {total}")
        
        print("\n📸 Cached dishes:")
        for dish in GeneratedImageCache.objects.all()[:15]:
            print(f"  🍽️ {dish.dish_name}")
        return total
    return 0