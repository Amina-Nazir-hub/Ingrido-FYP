import os
import re
import random
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from groq import Groq
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / '.env')

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY") or "AIzaSyByBTRLlawcXiiIznJh8rprwrSymEmv8Gc"

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


# ========== YOUTUBE CHANNEL CONFIG ==========

CHANNEL_NAMES = [
    "Food Fusion",
    "Sooper Chef",
    "Ijaz Ansari Food Secrets",
    "Kitchen with Amna",
    "Baba Food Secrets",
    "Muhammad Danial",
    "Kun Foods"
]

# Channel handles for quota-efficient lookup (Channels API costs 1 quota)
_CHANNEL_HANDLES = {
    "Food Fusion": "@foodfusionpk",
    "Sooper Chef": "@SooperChef",
    "Ijaz Ansari Food Secrets": "@IjazAnsariFoodSecrets",
    "Kitchen with Amna": "@KitchenwithAmna",
    "Baba Food Secrets": "@BabaFoodSecrets",
    "Muhammad Danial": "@MuhammadDanial",
    "Kun Foods": "@KunFoods",
}

_channel_ids_cache = {}
_channel_uploads_cache = {}
_channel_videos_cache = []
_channel_videos_cache_timestamp = 0

CHANNEL_CACHE_TTL = 3600  # 1 hour


def get_channel_id(channel_name):
    """Look up channel ID using Channels API (1 quota) by handle, fallback to name search."""
    if channel_name in _channel_ids_cache:
        return _channel_ids_cache[channel_name]

    try:
        handle = _CHANNEL_HANDLES.get(channel_name, '')
        if handle:
            url = "https://www.googleapis.com/youtube/v3/channels"
            params = {
                'part': 'id',
                'forHandle': handle,
                'key': YOUTUBE_API_KEY
            }
            res = requests.get(url, params=params, timeout=5)
            if res.status_code == 200:
                data = res.json()
                if data.get('items'):
                    channel_id = data['items'][0]['id']
                    _channel_ids_cache[channel_name] = channel_id
                    return channel_id

        # Fallback: name search (costs 100 quota, avoid if possible)
        search_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': channel_name,
            'key': YOUTUBE_API_KEY,
            'maxResults': 1,
            'type': 'channel'
        }
        res = requests.get(search_url, params=params, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data.get('items'):
                channel_id = data['items'][0]['id']['channelId']
                _channel_ids_cache[channel_name] = channel_id
                return channel_id
    except Exception as e:
        print(f"Channel ID fetch failed for {channel_name}: {e}")
    return None


def get_uploads_playlist_id(channel_id):
    """Get the uploads playlist ID for a channel (1 quota)."""
    if channel_id in _channel_uploads_cache:
        return _channel_uploads_cache[channel_id]
    try:
        url = "https://www.googleapis.com/youtube/v3/channels"
        params = {
            'part': 'contentDetails',
            'id': channel_id,
            'key': YOUTUBE_API_KEY
        }
        res = requests.get(url, params=params, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data.get('items'):
                playlist_id = data['items'][0]['contentDetails']['relatedPlaylists']['uploads']
                _channel_uploads_cache[channel_id] = playlist_id
                return playlist_id
    except Exception as e:
        print(f"Uploads playlist fetch failed for {channel_id}: {e}")
    return None


def fetch_channel_videos(channel_name, max_results=10):
    """Fetch recent recipe videos using PlaylistItems API (1 quota).
    Much cheaper than Search API (100 quota).
    """
    channel_id = get_channel_id(channel_name)
    if not channel_id:
        return []

    playlist_id = get_uploads_playlist_id(channel_id)
    if not playlist_id:
        return []

    try:
        url = "https://www.googleapis.com/youtube/v3/playlistItems"
        params = {
            'part': 'snippet',
            'playlistId': playlist_id,
            'key': YOUTUBE_API_KEY,
            'maxResults': max_results
        }
        res = requests.get(url, params=params, timeout=5)
        if res.status_code == 200:
            data = res.json()
            return [{
                'title': item['snippet']['title'],
                'video_id': item['snippet']['resourceId']['videoId'],
                'channel': channel_name
            } for item in data.get('items', [])]
    except Exception as e:
        print(f"Channel videos fetch failed for {channel_name}: {e}")
    return []


def _is_channel_segment(segment):
    """Check if a title segment contains a channel name."""
    s = segment.lower().replace(' ', '')
    for cn in CHANNEL_NAMES:
        cn_words = cn.lower().split()
        matches = sum(1 for w in cn_words if w in s)
        if matches >= 2:
            return True
    return False


def _is_instruction_segment(segment):
    """Check if a segment is cooking instructions, not a dish name."""
    kw = ['banana', 'banane', 'ka tarika', 'kaise', 'bnany', 'bnane',
          'bnonay', 'kay', 'how to', 'banany']
    s = segment.lower()
    return any(w in s for w in kw)


def _is_non_recipe_title(title):
    """Check if title is NOT a recipe (kitchen hacks, tips, etc.)."""
    t = title.lower()
    non_recipe = [
        'kitchen hack', 'kitchen tips', 'life hack', 'recipes for life',
        'tips and tricks', 'cooking tip', 'meal prep', 'weekly plan',
        'shorts', '#shorts', 'subscribe', 'vlog', 'day in the life',
        'kitchen tour', 'kitchen organization', 'kitchen setup',
        'groceries', 'grocery haul', 'what i eat', 'what i cook',
        'behind the scenes', 'coming soon', 'teaser', 'announcement',
    ]
    return any(kw in t for kw in non_recipe)


def _has_urdu_script(text):
    """Check if text contains Urdu/Arabic script characters."""
    for ch in text:
        if '\u0600' <= ch <= '\u06FF' or '\u0750' <= ch <= '\u077F' or \
           '\uFB50' <= ch <= '\uFDFF' or '\uFE70' <= ch <= '\uFEFF' or \
           '\u08A0' <= ch <= '\u08FF':
            return True
    return False


def clean_youtube_title(title):
    """Clean YouTube video title to get pure dish name only (Roman Urdu or English).
    Returns empty string if title is not a recipe (kitchen hacks, tips, etc.)
    or if the only remaining content is in Urdu script.

    Strategy: split by separators (|, -, —), pick the longest
    segment that is NOT a channel name, NOT cooking instructions,
    and NOT Urdu script. Then apply basic cleanup.

    Examples:
      'Eid Recipe By Ijaz Ansari | Mutton Paya Recipe | Bakry Ke Paay Banana Ka Tarika |'
      -> 'Mutton Paya'

      'Mutton Gravy Recipes Collection | Food Fusion' -> 'Mutton Gravy'

      'آلو گوشت بنانے کا آسان طریقہ | Food Fusion' -> ''
    """
    # Reject non-recipe titles immediately
    if _is_non_recipe_title(title):
        return ''

    # Split by common separators and clean each segment
    parts = re.split(r'\s*[|\-—]\s*', title)
    segments = [s.strip() for s in parts if s.strip()]

    if len(segments) > 1:
        candidates = [s for s in segments if not _is_channel_segment(s)]
        dish_parts = [s for s in candidates if not _is_instruction_segment(s) and not _has_urdu_script(s)]
        if dish_parts:
            t = max(dish_parts, key=len)
        elif candidates:
            latin_candidates = [s for s in candidates if not _has_urdu_script(s)]
            t = max(latin_candidates, key=len) if latin_candidates else max(candidates, key=len)
        else:
            latin_segments = [s for s in segments if not _has_urdu_script(s)]
            t = max(latin_segments, key=len) if latin_segments else max(segments, key=len)
    else:
        t = segments[0] if segments else title

    # Loop cleanup until stable (handles stacked fluff like "Recipes Collection")
    prev = None
    while prev != t:
        prev = t

        # Remove trailing "Recipe" / "Recipes" / "Recipes Collection"
        t = re.sub(r'(?i)\s+recipes?\s+collection\s*$', '', t)
        t = re.sub(r'(?i)\s+recipes?\s*$', '', t)
        t = re.sub(r'(?i)\s+collection\s*$', '', t)

        # Remove leading "Recipe" / "Recipes"
        t = re.sub(r'(?i)^recipes?\s+', '', t)

        # Remove leading adjectives
        t = re.sub(r'''(?ix)
            ^(
                delicious\s+ | viral\s+ | best\s+ | easy\s+ | super\s+ |
                amazing\s+ | quick\s+ | simple\s+ | perfect\s+ | special\s+ |
                ultimate\s+ | flavorful\s+ | mouthwatering\s+ | tasty\s+ |
                yummy\s+ | crispy\s+ | juicy\s+ | creamy\s+ | sooper\s+
            )
        ''', '', t)

        # Remove mid-title adjectives
        t = re.sub(r'''(?ix)
            \b(
                delicious|viral|best|easy|super|amazing|quick|simple|perfect|
                special|ultimate|flavorful|mouthwatering|tasty|yummy|crispy|
                juicy|creamy|sooper
            )\b
        ''', '', t)

        # Remove trailing fluff
        t = re.sub(r'(?i)\s+(method|style|by\s+\w+|episode\s*\d*|part\s*\d*|#?shorts|recipe|recipes)\s*$', '', t)

        # Remove all hashtags
        t = re.sub(r'#\w+', '', t)

        # Remove trailing Urdu instruction words (Banaye, Banana, etc.)
        t = re.sub(r'(?i)\s+(banaye|banaiye|bnaye|banaen|bnaen|banao|bnao|banay|bnay|banana|banane|bnany|bnane|bnonay|banany)\s*$', '', t)

        # Remove leading Urdu intro fluff
        t = re.sub(r'''(?ix)
            ^(
                garmi\s+ke\s+mausam\s+main\s+yeh\s* |
                sardi\s+ke\s+mausam\s+main\s+yeh\s* |
                is\s+mausam\s+main\s+yeh\s* |
                mausam\s+main\s+yeh\s* |
                aaj\s+banaye\s+ |
                aaj\s+bnaye\s+ |
                bakra\s+eid\s+per\s+aap\s+apne\s+ghar\s+mein\s+ |
                aap\s+apne\s+ghar\s+mein\s+ |
                apne\s+ghar\s+mein\s+ |
                ghar\s+mein\s+banaye\s+
            )
        ''', '', t)

        # Remove instruction words from anywhere in title (not just end)
        t = re.sub(r'''(?ix)
            \b(
                banaye | banaiye | bnaye | banaen | bnaen |
                banao | bnao | banay | bnay |
                banana | banane | bnany | bnane | bnonay | banany |
                ka\s+tarika | kaise | how\s+to
            )\b
        ''', ' ', t)

        # Remove Urdu connecting words and fluff particles
        t = re.sub(r'(?i)\s+(ka|ke|ki)\s+', ' ', t)
        t = re.sub(r'(?i)^(ka|ke|ki)\s+', '', t)
        t = re.sub(r'(?i)\s+(ka|ke|ki)$', '', t)
        t = re.sub(r'''(?ix)
            \b(
                asaan | aasan | asani | asani\s+se | asaan\s+tarika |
                simple | easy | best | quick | special |
                tarika | tareeqa | tareka
            )\b
        ''', ' ', t)

        # Remove trailing "Ka Tarika" / "Tarika" / "Method" (Urdu/English instruction suffixes)
        t = re.sub(r'(?i)\s+(tarika|recipe|recipes|method|style)\s*$', '', t)

        # Remove standalone ampersand
        t = re.sub(r'\s+&\s+', ' ', t)
        t = re.sub(r'\s+&$', '', t)
        t = re.sub(r'^&\s+', '', t)

        # Remove emojis
        t = re.sub(r'[\U0001F300-\U0001FFFF\u2600-\u27BF\u2665\u2764\ufe0f]', '', t)

        # Remove brackets and their content
        t = re.sub(r'\s*[\(\[].*?[\)\]]', '', t)

        # Normalize spaces
        t = re.sub(r'\s+', ' ', t).strip()

    # If after all cleaning the title is too short, generic, or still in Urdu script, reject it
    if _has_urdu_script(t):
        return ''
    t_lower = t.lower()
    if len(t) < 4 or t_lower in ['recipe', 'recipes', 'food', 'cooking', 'food recipe',
                                  'method', 'style', 'easy', 'quick', 'simple',
                                  'and', 'the', 'for', 'you', 'your', 'new', 'try',
                                  'best', 'top', 'how', 'why', 'what', 'make',
                                  'special', 'super', 'homemade', '']:
        return ''

    return t


def fetch_seasonal_dishes(force_refresh=False):
    """Fetch dishes from all specified YouTube channels, return 6 unique.
    Caches results for CHANNEL_CACHE_TTL seconds.
    Stores pre-cleaned title in dict to avoid re-processing.
    """
    global _channel_videos_cache, _channel_videos_cache_timestamp

    now = time.time()
    if not force_refresh and _channel_videos_cache and (now - _channel_videos_cache_timestamp) < CHANNEL_CACHE_TTL:
        return _channel_videos_cache

    all_videos = []
    with ThreadPoolExecutor(max_workers=7) as executor:
        futures = {executor.submit(fetch_channel_videos, channel, 10): channel for channel in CHANNEL_NAMES}
        for future in as_completed(futures):
            try:
                result = future.result()
                all_videos.extend(result)
            except Exception as e:
                channel = futures[future]
                print(f"Channel fetch failed for {channel}: {e}")

    seen = set()
    unique = []
    for v in all_videos:
        clean = clean_youtube_title(v['title'])
        if not clean:
            continue
        clean_lower = clean.lower()
        if clean_lower not in seen:
            seen.add(clean_lower)
            unique.append({
                'title': v['title'],
                'clean_title': clean,
                'video_id': v['video_id'],
                'channel': v['channel']
            })

    random.shuffle(unique)
    result = unique[:6]

    _channel_videos_cache = result
    _channel_videos_cache_timestamp = now

    return result


def fetch_youtube_video_id(recipe_title, restrict_to_channels=True):
    """Fetch YouTube video ID for recipe, restricted to specified channels."""
    try:
        search_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': recipe_title,
            'key': YOUTUBE_API_KEY,
            'maxResults': 5,
            'type': 'video'
        }
        res = requests.get(search_url, params=params, timeout=5)
        if res.status_code == 200:
            data = res.json()
            for item in data.get('items', []):
                video_id = item['id']['videoId']
                if restrict_to_channels:
                    channel_title = item['snippet']['channelTitle']
                    if any(cn.lower() in channel_title.lower() for cn in CHANNEL_NAMES):
                        return video_id
                else:
                    return video_id
            # Fallback: return first result even if not from our channels
            if data.get('items'):
                return data['items'][0]['id']['videoId']
    except Exception as e:
        print(f"YouTube fetch failed: {e}")
    return None


