# apps/common/services.py - COMPLETE FINAL VERSION

import requests
import os
import base64
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from dotenv import load_dotenv
import uuid
<<<<<<< HEAD
from django.utils import timezone
=======
import time
>>>>>>> origin/main

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
<<<<<<< HEAD
        'gol gappay': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
        'biryani': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
=======
        'biryani': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
        'raita': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
        'lassi': 'https://images.pexels.com/photos/1441038/pexels-photo-1441038.jpeg',
>>>>>>> origin/main
        'default': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg'
    }
    
    for key, url in fallbacks.items():
        if key in dish_lower:
            return url
    return fallbacks['default']


<<<<<<< HEAD
def get_ai_generated_image(dish_name, width=768, height=768, force_refresh=False):
    """
    Get image - Priority:
    1. Database cache (if exists)
    2. API generation (if not in cache)
    3. Fallback image (if API fails)
=======
def get_pakistani_food_prompt(dish_name):
    """Generate better prompts for Pakistani dishes"""
    dish_lower = dish_name.lower()
    
    # Specific prompts for different dishes
    dish_specific_prompts = {
        'raita': "creamy yogurt raita with cucumber and mint, Pakistani style, in a white bowl, garnished with fresh coriander, delicious food",
        'lassi': "creamy mango lassi in traditional clay glass, Pakistani drink, topped with crushed pistachios, refreshing beverage",
        'biryani': "chicken biryani in clay pot, Pakistani style, layers of rice and meat, garnished with fried onions, appetizing",
        'nihari': "slow cooked beef nihari in handi, Pakistani breakfast dish, garnished with ginger and green chilies",
        'karahi': "chicken karahi in wok, Pakistani style, tomato based gravy, garnished with fresh coriander",
        'kheer': "rice kheer in clay bowl, Pakistani dessert, garnished with almonds and pistachios",
        'chaat': "street style chaat, Pakistani snack, with chickpeas, potatoes, yogurt and chutney",
        'samosay': "crispy samosas, Pakistani snack, served with mint chutney",
        'haleem': "thick haleem with meat and lentils, Pakistani dish, topped with fried onions"
    }
    
    # Check if dish matches any specific prompt
    for key, prompt in dish_specific_prompts.items():
        if key in dish_lower:
            return prompt
    
    # Default prompt for any Pakistani dish
    return f"authentic {dish_name} Pakistani dish, traditional serving, delicious food, high quality"


def get_ai_generated_image_raphael(dish_name, width=768, height=768):
    """
    Generate image using Raphael.app API (Free, no API key needed)
>>>>>>> origin/main
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
<<<<<<< HEAD
        url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/black-forest-labs/flux-1-schnell"
=======
        # Get improved prompt
        prompt = get_pakistani_food_prompt(dish_name)
        
        # Raphael.app endpoint
        url = "https://raphael.app/api/generate"
>>>>>>> origin/main
        
        headers = {
            "Content-Type": "application/json"
        }
        
<<<<<<< HEAD
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
=======
        payload = {
            "prompt": prompt,
            "width": width,
            "height": height,
            "num_inference_steps": 25,
            "guidance_scale": 7.5
        }
        
        print(f"🎨 Generating via Raphael.app for: {dish_name}")
        print(f"📝 Prompt: {prompt}")
        
        response = requests.post(url, json=payload, headers=headers, timeout=90)
>>>>>>> origin/main
        
        if response.status_code == 200:
            result = response.json()
            
<<<<<<< HEAD
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
=======
            # Check different response formats
            image_url = None
            if "image" in result:
                image_url = result["image"]
            elif "url" in result:
                image_url = result["url"]
            elif "images" in result and len(result["images"]) > 0:
                image_url = result["images"][0]
            elif "output" in result:
                image_url = result["output"]
            
            if image_url:
                # Download the image
                img_response = requests.get(image_url, timeout=30)
                if img_response.status_code == 200:
                    filename = f"ai_images/{dish_name.replace(' ', '_')}_{uuid.uuid4().hex[:8]}.png"
                    saved_path = default_storage.save(filename, ContentFile(img_response.content))
                    local_url = f"{settings.MEDIA_URL}{saved_path}"
                    print(f"✅ Image saved: {local_url}")
                    return local_url
            else:
                # Maybe image is returned directly as base64
                if "image_base64" in result:
                    image_binary = base64.b64decode(result["image_base64"])
                    filename = f"ai_images/{dish_name.replace(' ', '_')}_{uuid.uuid4().hex[:8]}.png"
                    saved_path = default_storage.save(filename, ContentFile(image_binary))
                    local_url = f"{settings.MEDIA_URL}{saved_path}"
                    print(f"✅ Image saved from base64: {local_url}")
                    return local_url
                    
        else:
            print(f"❌ Raphael.app failed with status: {response.status_code}")
            if response.text:
                print(f"Response: {response.text[:200]}")
                
    except requests.exceptions.Timeout:
        print("⏰ Raphael.app request timed out")
    except Exception as e:
        print(f"❌ Raphael.app error: {e}")
    
    return None


# Alternative Raphael endpoint (if primary doesn't work)
def get_ai_generated_image_raphael_v2(dish_name, width=768, height=768):
    """
    Alternative Raphael.app endpoint
    """
    try:
        prompt = get_pakistani_food_prompt(dish_name)
        
        # Different Raphael endpoint
        url = "https://api.raphael.app/v1/images/generations"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "prompt": prompt,
            "size": f"{width}x{height}",
            "model": "flux-schnell"
        }
        
        print(f"🎨 Generating via Raphael.app v2 for: {dish_name}")
        
        response = requests.post(url, json=payload, headers=headers, timeout=90)
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract image URL
            image_url = result.get("data", [{}])[0].get("url")
            
            if image_url:
                img_response = requests.get(image_url, timeout=30)
                if img_response.status_code == 200:
                    filename = f"ai_images/{dish_name.replace(' ', '_')}_{uuid.uuid4().hex[:8]}.png"
                    saved_path = default_storage.save(filename, ContentFile(img_response.content))
                    local_url = f"{settings.MEDIA_URL}{saved_path}"
                    print(f"✅ Image saved: {local_url}")
                    return local_url
        
        print(f"❌ Raphael.app v2 failed with status: {response.status_code}")
        
    except Exception as e:
        print(f"❌ Raphael.app v2 error: {e}")
    
    return None


# Alternative: Replicate.com (Free tier available)
def get_ai_generated_image_replicate(dish_name, width=768, height=768):
    """
    Generate image using Replicate.com (Free tier available)
    Requires REPLICATE_API_TOKEN in .env
    """
    try:
        api_token = os.getenv("REPLICATE_API_TOKEN")
        
        if not api_token:
            print("❌ Replicate API token not configured")
            return None
        
        prompt = get_pakistani_food_prompt(dish_name)
        
        url = "https://api.replicate.com/v1/predictions"
        
        headers = {
            "Authorization": f"Token {api_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "version": "black-forest-labs/flux-schnell",
            "input": {
                "prompt": prompt,
                "width": width,
                "height": height,
                "num_outputs": 1
            }
        }
        
        print(f"🎨 Generating via Replicate for: {dish_name}")
        
        # Submit prediction
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 201:
            prediction = response.json()
            prediction_id = prediction.get("id")
            
            # Poll for completion
            for _ in range(30):
                time.sleep(2)
                status_response = requests.get(f"{url}/{prediction_id}", headers=headers)
                
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    
                    if status_data.get("status") == "succeeded":
                        image_url = status_data.get("output", [None])[0]
                        if image_url:
                            img_response = requests.get(image_url, timeout=30)
                            if img_response.status_code == 200:
                                filename = f"ai_images/{dish_name.replace(' ', '_')}_{uuid.uuid4().hex[:8]}.png"
                                saved_path = default_storage.save(filename, ContentFile(img_response.content))
                                local_url = f"{settings.MEDIA_URL}{saved_path}"
                                print(f"✅ Image saved: {local_url}")
                                return local_url
                        break
                    elif status_data.get("status") == "failed":
                        print(f"❌ Prediction failed: {status_data.get('error')}")
                        break
        
        print(f"❌ Replicate failed")
        
    except Exception as e:
        print(f"❌ Replicate error: {e}")
    
    return None


# Main function - try Raphael first, then fallbacks
def get_ai_generated_image(dish_name, width=768, height=768):
    """
    Generate image using Raphael.app and other free alternatives
    """
    print(f"\n🔵 Getting image for: {dish_name}")
    
    # Try Raphael.app first
    result = get_ai_generated_image_raphael(dish_name, width, height)
    if result:
        return result
    
    # Try alternative Raphael endpoint
    print("🔄 Trying Raphael.app v2...")
    result = get_ai_generated_image_raphael_v2(dish_name, width, height)
    if result:
        return result
    
    # Try Replicate if API key available
    if os.getenv("REPLICATE_API_TOKEN"):
        print("🔄 Trying Replicate.com...")
        result = get_ai_generated_image_replicate(dish_name, width, height)
        if result:
            return result
    
    # Final fallback
    print("📸 Using fallback image")
    return get_fallback_image(dish_name)


# Optional: Test function
def test_raphael_api():
    """
    Test if Raphael.app is working
    """
    print("Testing Raphael.app API...")
    result = get_ai_generated_image_raphael("biryani", 512, 512)
    
    if result:
        print(f"✅ Success! Image URL: {result}")
        return True
    else:
        print("❌ Failed to generate image")
        return False
>>>>>>> origin/main
