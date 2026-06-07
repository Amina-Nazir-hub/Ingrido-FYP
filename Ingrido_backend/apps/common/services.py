import requests
import os
import base64
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from dotenv import load_dotenv
import uuid
import time

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
        'biryani': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg',
        'raita': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
        'lassi': 'https://images.pexels.com/photos/1441038/pexels-photo-1441038.jpeg',
        'default': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg'
    }
    
    for key, url in fallbacks.items():
        if key in dish_lower:
            return url
    return fallbacks['default']


def get_pakistani_food_prompt(dish_name):
    """Generate better prompts for Pakistani dishes"""
    dish_lower = dish_name.lower()

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
    for key, prompt in dish_specific_prompts.items():
        if key in dish_lower:
            return prompt
    return f"authentic {dish_name} Pakistani dish, traditional serving, delicious food, high quality"

def get_ai_generated_image_raphael(dish_name, width=768, height=768):
    """
    Generate image using Raphael.app API (Free, no API key needed)
    """
    try:
        # Get improved prompt
        prompt = get_pakistani_food_prompt(dish_name)
        
        # Raphael.app endpoint
        url = "https://raphael.app/api/generate"
        
        headers = {
            "Content-Type": "application/json"
        }
        
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
        
        if response.status_code == 200:
            result = response.json()
            
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