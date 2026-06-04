# apps/common/services.py
import requests
import os
import base64
from urllib.parse import quote
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from dotenv import load_dotenv
import uuid

load_dotenv()

def get_fallback_image(dish_name):
    """Return fallback image URLs for Pakistani dishes"""
    dish_lower = dish_name.lower()
    
    fallbacks = {
        'default': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg'
    }
    
    for key, url in fallbacks.items():
        if key in dish_lower:
            return url
    
    return fallbacks['default']


def get_ai_generated_image(dish_name, width=768, height=768):
    """
    Generate image using Cloudflare Workers AI and save locally
    """
    try:
        account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        api_token = os.getenv("CLOUDFLARE_API_TOKEN")
        
        if not account_id or not api_token:
            print("Cloudflare credentials not configured, using fallback")
            return get_fallback_image(dish_name)
        
        url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/black-forest-labs/flux-1-schnell"
        
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "prompt": f"delicious {dish_name} pakistani food photography, professional food styling, high resolution",
            "width": width,
            "height": height
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            image_data = result.get("result", {}).get("image")
            
            if image_data:
                image_binary = base64.b64decode(image_data)
                filename = f"ai_images/{dish_name.replace(' ', '_')}_{uuid.uuid4().hex[:8]}.png"
                saved_path = default_storage.save(filename, ContentFile(image_binary))
                image_url = f"{settings.MEDIA_URL}{saved_path}"
                print(f"✅ Image saved and URL returned: {image_url}")
                return image_url
        
        print(f"Cloudflare failed with status: {response.status_code}")
        return get_fallback_image(dish_name)
        
    except Exception as e:
        print(f"Image generation error: {e}")
        return get_fallback_image(dish_name)