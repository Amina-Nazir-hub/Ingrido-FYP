# apps/common/services.py - COMPLETE FINAL VERSION

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


def get_fallback_image(dish_name):
    """Return specific fallback images"""
    dish_lower = dish_name.lower()
    
    fallbacks = {
        'gol gappay': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
        'biryani': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
        'default': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg'
    }
    
    for key, url in fallbacks.items():
        if key in dish_lower:
            return url
    return fallbacks['default']


def get_ai_generated_image(dish_name, width=768, height=768, force_refresh=False):
    """
    Get image - Priority:
    1. Database cache (if exists)
    2. API generation (if not in cache)
    3. Fallback image (if API fails)
    """
    
    # ========== STEP 1: DATABASE CACHE CHECK ==========
    if CACHE_AVAILABLE and not force_refresh:
        try:
            cached = GeneratedImageCache.objects.filter(
                dish_name__iexact=dish_name
            ).first()
            
            if cached:
                # Check if file exists
                if cached.image_path and default_storage.exists(cached.image_path):
                    print(f"✅ DATABASE CACHE: {dish_name} - API call nahi hui!")
                    cached.last_accessed = timezone.now()
                    cached.save(update_fields=['last_accessed'])
                    return cached.image_url
                elif cached.image_url and cached.image_url.startswith('http'):
                    # For external URLs (pexels, etc.)
                    print(f"✅ DATABASE CACHE (external): {dish_name} - API call nahi hui!")
                    return cached.image_url
                else:
                    print(f"⚠️ Cache file missing for {dish_name}, deleting...")
                    cached.delete()
        except Exception as e:
            print(f"Cache check error: {e}")
    
    # ========== STEP 2: API CALL (if not in cache) ==========
    print(f"📡 API CALL for: {dish_name} (database mein nahi thi)")
    
    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    api_token = os.getenv("CLOUDFLARE_API_TOKEN")
    
    if not account_id or not api_token:
        print(f"⚠️ No Cloudflare credentials")
        return get_fallback_image(dish_name)
    
    try:
        url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/black-forest-labs/flux-1-schnell"
        
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
        prompt = f"delicious {dish_name} pakistani food, professional food photography, high resolution"
        
        response = requests.post(
            url,
            json={"prompt": prompt, "width": width, "height": height},
            headers=headers,
            timeout=60
        )
        
        if response.status_code == 429:
            print(f"⚠️ Rate limit (429) for {dish_name}")
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
                
                # ========== STEP 3: SAVE TO DATABASE ==========
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
                    except Exception as e:
                        print(f"Database save error: {e}")
                
                print(f"✅ IMAGE GENERATED & SAVED: {dish_name}")
                return image_url
        
        print(f"❌ API failed ({response.status_code}) for {dish_name}")
        return get_fallback_image(dish_name)
        
    except Exception as e:
        print(f"❌ API error for {dish_name}: {e}")
        return get_fallback_image(dish_name)


def pre_generate_all_dishes(dish_list):
    """Ek saath multiple dishes generate karo aur cache mein save karo"""
    results = {'success': [], 'failed': [], 'cached': []}
    
    for dish in dish_list:
        # Check if already cached
        if CACHE_AVAILABLE and GeneratedImageCache.objects.filter(dish_name__iexact=dish).exists():
            print(f"⏭️ Already cached: {dish}")
            results['cached'].append(dish)
            continue
        
        # Generate and save
        url = get_ai_generated_image(dish)
        if url and 'pexels' not in url.lower():
            results['success'].append(dish)
        else:
            results['failed'].append(dish)
    
    print(f"\n📊 Results: Success: {len(results['success'])}, Failed: {len(results['failed'])}, Cached: {len(results['cached'])}")
    return results


def get_cache_stats():
    """Cache statistics dekhne ke liye"""
    if CACHE_AVAILABLE:
        total = GeneratedImageCache.objects.count()
        print(f"\n📊 CACHE STATISTICS:")
        print(f"Total images in database: {total}")
        print("\nAll cached dishes:")
        for dish in GeneratedImageCache.objects.all():
            print(f"  🍽️ {dish.dish_name}")
            print(f"     📷 {dish.image_url[:60]}...")
            print(f"     📅 {dish.created_at.strftime('%Y-%m-%d %H:%M')}")
        return total
    return 0