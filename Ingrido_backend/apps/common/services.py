import requests
import os
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from dotenv import load_dotenv
import uuid
from urllib.parse import quote

from django.utils import timezone


load_dotenv()

try:
    from .models import GeneratedImageCache
    CACHE_AVAILABLE = True
except ImportError:
    CACHE_AVAILABLE = False
    print("⚠️ Cache model not found")


DEFAULT_FALLBACK_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg'


def get_fallback_image(dish_name):
    return DEFAULT_FALLBACK_IMAGE


def _build_dish_prompt(dish_name):
    """Build a dish-specific prompt based on keywords in the name."""
    name_lower = dish_name.lower()

    # Rice dishes
    if any(w in name_lower for w in ['biryani', 'pulao', 'pilau', 'pulao', 'rice', 'tahari', 'yakhni']):
        return f"Close-up of {dish_name}, traditional Pakistani rice dish with meat and spices, beautifully plated on a serving dish, professional food photography, realistic, high detail"

    # Breads
    if any(w in name_lower for w in ['naan', 'paratha', 'roti', 'chapati', 'kulcha', 'puri', 'bhatura']):
        return f"Freshly cooked {dish_name}, Pakistani bread on a plate, buttery and golden brown, professional food photography, realistic"

    # Kebabs and grills
    if any(w in name_lower for w in ['kebab', 'kabab', 'seekh', 'tikka', 'boti', 'kofta', 'chapli', 'shawarma']):
        return f"Grilled {dish_name}, Pakistani meat kebab on a plate with salad, no rice, professional food photography, realistic, high detail"

    # Meat curries / gravies
    if any(w in name_lower for w in ['karahi', 'nihari', 'haleem', 'korma', 'qorma', 'bhuna', 'roghan', 'gosht', 'paye', 'payee', 'nihari', 'salan', 'handi', 'dopiaza', 'achaar']):
        return f"{dish_name}, rich Pakistani meat curry in a bowl, thick gravy with spices, no rice, professional food photography, realistic"

    # Chicken dishes
    if any(w in name_lower for w in ['chicken', 'murgh', 'murgi']):
        return f"{dish_name}, Pakistani chicken dish served on a plate, thick masala gravy, no rice, professional food photography, realistic"

    # Mutton / beef
    if any(w in name_lower for w in ['mutton', 'beef', 'gosht']):
        return f"{dish_name}, traditional Pakistani meat dish, rich gravy, no rice, professional food photography, realistic"

    # Snacks / street food (check before lentils to avoid 'chana' ambiguity)
    if any(w in name_lower for w in ['samosa', 'chaat', 'pakora', 'dahi', 'papri', 'chana roll', 'chana chaat', 'chana papri', 'sandwich', 'cutlet', 'tikki', 'nuggets', 'chana masala']):
        return f"{dish_name}, Pakistani street food snack, crispy and golden, on a plate with chutney, professional food photography, realistic"

    # Lentils
    if any(w in name_lower for w in ['daal', 'dal', 'lobia', 'chana', 'channa', 'masoor', 'moong', 'toor', 'maash']):
        return f"{dish_name}, Pakistani lentil curry served in a bowl, garnished with coriander, professional food photography, realistic"

    # Sweets / desserts
    if any(w in name_lower for w in ['gulab', 'jalebi', 'kheer', 'falooda', 'barfi', 'halwa', 'laddu', 'ladoo', 'rasmalai', 'gajar', 'sheer', 'phirni', 'shahi']):
        return f"{dish_name}, traditional Pakistani sweet dessert, beautifully presented in a bowl, professional food photography, realistic"

    # Snacks / street food
    if any(w in name_lower for w in ['samosa', 'chaat', 'pakora', 'dahi', 'papri', 'chana', 'roll', 'sandwich', 'cutlet', 'tikki', 'nuggets']):
        return f"{dish_name}, Pakistani street food snack, crispy and golden, on a plate with chutney, professional food photography, realistic"

    # Seafood
    if any(w in name_lower for w in ['fish', 'macchi', 'machli', 'prawn', 'shrimp', 'kingfish', 'salmon']):
        return f"{dish_name}, Pakistani fish dish, fried or grilled, on a plate with lemon, no rice, professional food photography, realistic"

    # Default
    return f"Close-up of {dish_name}, authentic Pakistani dish, realistically plated on a serving dish, professional food photography, high resolution, appetizing"


def search_pollinations_image(dish_name, width=768, height=768):
    """
    Generate dish image using Pollinations.ai
    Endpoint: GET https://image.pollinations.ai/prompt/{prompt}
    Model: flux (default). API key optional (enables higher rate limits).
    """
    try:
        prompt = _build_dish_prompt(dish_name)
        api_key = os.getenv("POLLINATIONS_API_KEY")

        url = "https://image.pollinations.ai/prompt/" + quote(prompt)
        params = {
            "width": width,
            "height": height,
            "model": "flux",
            "nologo": "true",
            "seed": abs(hash(dish_name)) % 1000000,
        }
        if api_key:
            params["key"] = api_key

        print(f"🖼️ Pollinations generating: {dish_name}")
        print(f"Prompt: {prompt[:100]}...")
        img_resp = requests.get(url, params=params, timeout=30)

        if img_resp.status_code == 200 and img_resp.headers.get('Content-Type', '').startswith('image/'):
            safe_name = dish_name.replace(' ', '_').replace('/', '_').lower()
            filename = f"ai_images/{safe_name}_{uuid.uuid4().hex[:8]}.jpg"
            saved_path = default_storage.save(filename, ContentFile(img_resp.content))
            local_url = f"{settings.MEDIA_URL}{saved_path}"
            print(f"✅ Image saved: {local_url}")
            return local_url

        print(f"⚠️ Pollinations failed for: {dish_name} (status {img_resp.status_code})")
        if img_resp.text:
            print(f"Response: {img_resp.text[:300]}")
        return None

    except Exception as e:
        print(f"❌ Pollinations error: {e}")
        return None


def get_ai_generated_image(dish_name, width=768, height=768, force_refresh=False):
    """
    Get dish image:
    1. Database cache -> 2. Pollinations.ai generate -> 3. Static fallback
    """

    # ========== STEP 1: DATABASE CACHE ==========
    if CACHE_AVAILABLE and not force_refresh:
        try:
            cached = GeneratedImageCache.objects.filter(
                dish_name__iexact=dish_name
            ).first()

            if cached:
                if cached.image_path and default_storage.exists(cached.image_path):
                    print(f"✅ DB CACHE HIT: {dish_name}")
                    cached.last_accessed = timezone.now()
                    cached.save(update_fields=['last_accessed'])
                    return cached.image_url
                elif cached.image_url:
                    print(f"✅ DB CACHE HIT (url): {dish_name}")
                    return cached.image_url
                else:
                    print(f"⚠️ Cache entry invalid for {dish_name}, deleting...")
                    cached.delete()
        except Exception as e:
            print(f"Cache check error: {e}")

    # ========== STEP 2: POLLINATIONS.AI IMAGE ==========
    image_url = search_pollinations_image(dish_name, width=width, height=height)
    if image_url:
        if CACHE_AVAILABLE:
            try:
                saved_path = ''
                if image_url.startswith(settings.MEDIA_URL):
                    saved_path = image_url[len(settings.MEDIA_URL):]
                GeneratedImageCache.objects.update_or_create(
                    dish_name__iexact=dish_name,
                    defaults={
                        'dish_name': dish_name,
                        'image_url': image_url,
                        'image_path': saved_path,
                        'prompt_used': f'pollinations:{dish_name}',
                        'last_accessed': timezone.now()
                    }
                )
            except Exception:
                pass
        return image_url

    # ========== STEP 3: STATIC FALLBACK ==========
    print(f"⚠️ All failed, using fallback for: {dish_name}")
    return get_fallback_image(dish_name)


def pre_generate_famous_dishes():
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
    if CACHE_AVAILABLE:
        total = GeneratedImageCache.objects.count()
        print(f"\n📊 CACHE STATISTICS:")
        print(f"Total images in database: {total}")

        print("\n📸 Cached dishes:")
        for dish in GeneratedImageCache.objects.all()[:15]:
            print(f"  🍽️ {dish.dish_name}")
        return total
    return 0
