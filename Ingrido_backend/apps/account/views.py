from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .models import UserProfile, SavedRecipe, UserSearchHistory, UserViewedRecipe
from .serializers import UserSerializer
from apps.recipes.serializers import RecipeListSerializer

User = get_user_model()

# ========== AUTHENTICATION ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        UserProfile.objects.get_or_create(user=user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'first_name': user.first_name
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email_input = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email_input, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'first_name': user.first_name
        }, status=200)
    return Response({'error': 'Invalid Credentials'}, status=401)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'GET':
        return Response({
            'username': request.user.username,
            'first_name': request.user.first_name,
            'email': request.user.email,
            'health_conditions': profile.health_conditions,
            'dietary_preferences': profile.dietary_preferences
        })
    elif request.method == 'PUT':
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.save()
        profile.health_conditions = request.data.get('health_conditions', profile.health_conditions)
        profile.dietary_preferences = request.data.get('dietary_preferences', profile.dietary_preferences)
        profile.save()
        return Response({'message': 'Profile updated successfully'})

# apps/accounts/views.py

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Delete user account permanently"""
    user = request.user
    user.delete()
    return Response({'message': 'Account deleted successfully'}, status=200)

# ========== BOOKMARKS ==========
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, recipe_id=None):
    from apps.recipes.models import Recipe, AIGeneratedRecipe
    
    recipe_data = request.data.get('recipe_data')
    
    if recipe_id and str(recipe_id).isdigit():
        from apps.recipes.models import Recipe
        recipe = get_object_or_404(Recipe, id=recipe_id)
    elif recipe_data:
        recipe_title = recipe_data.get('title')
        from apps.recipes.models import Recipe
        existing_recipe = Recipe.objects.filter(title__iexact=recipe_title).first()
        if existing_recipe:
            recipe = existing_recipe
        else:
            recipe = Recipe.objects.create(
                title=recipe_data.get('title', 'Untitled Recipe'),
                description=recipe_data.get('description', ''),
                ingredients=recipe_data.get('ingredients', ''),
                instructions=recipe_data.get('instructions', ''),
                prep_time=int(recipe_data.get('prep_time', 30)),
                calories=int(recipe_data.get('kcal', 0)),
                cuisine=recipe_data.get('cuisine', 'Pakistani'),
                dietary_type=recipe_data.get('dietary_type', 'mixed'),
                spice_level=recipe_data.get('spice_level', 'Medium')
            )
    else:
        return Response({'error': 'No recipe identifier provided'}, status=400)
    
    bookmark, created = SavedRecipe.objects.get_or_create(user=request.user, recipe=recipe)
    if not created:
        bookmark.delete()
        return Response({'saved': False, 'status': 'removed'})
    return Response({'saved': True, 'status': 'saved'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_ai_bookmark(request, recipe_title):
    """Toggle bookmark for AI generated recipe"""
    from urllib.parse import unquote
    
    recipe_title = unquote(recipe_title).replace('-', ' ').title()
    
    # Get or create user profile
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    # Ensure ai_bookmarks is a list
    if not profile.ai_bookmarks:
        profile.ai_bookmarks = []
    
    # Convert to list if it's not
    if not isinstance(profile.ai_bookmarks, list):
        profile.ai_bookmarks = []
    
    print(f"Current bookmarks: {profile.ai_bookmarks}")  # Debug
    print(f"Toggling for: {recipe_title}")  # Debug
    
    # Toggle bookmark
    if recipe_title in profile.ai_bookmarks:
        profile.ai_bookmarks.remove(recipe_title)
        saved = False
        status_msg = 'removed'
    else:
        profile.ai_bookmarks.append(recipe_title)
        saved = True
        status_msg = 'saved'
    
    profile.save()
    
    print(f"New bookmarks: {profile.ai_bookmarks}")  # Debug
    
    return Response({
        'status': status_msg, 
        'saved': saved,
        'bookmarks': profile.ai_bookmarks
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_recipes(request):
    """Get all saved recipes (both normal and AI)"""
    from apps.recipes.models import AIGeneratedRecipe
    
    # Get normal saved recipes
    bookmarks = SavedRecipe.objects.filter(user=request.user).select_related('recipe')
    
    data = []
    
    # Add normal recipes
    for b in bookmarks:
        recipe_data = RecipeListSerializer(b.recipe, context={'request': request}).data
        recipe_data['bookmark_id'] = b.id
        recipe_data['saved_at'] = b.saved_at
        recipe_data['is_ai_generated'] = False
        data.append(recipe_data)
    
    # Get AI bookmarks from user profile
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    
    if profile.ai_bookmarks and isinstance(profile.ai_bookmarks, list):
        for ai_title in profile.ai_bookmarks:
            # Check if already in data
            if not any(item.get('title') == ai_title for item in data):
                # Get AI recipe from cache
                ai_recipe = AIGeneratedRecipe.objects.filter(title__iexact=ai_title).first()
                
                ai_data = {
                    'id': f"ai-{ai_title.replace(' ', '-')}",
                    'title': ai_title,
                    'meal': ai_title,
                    'image': ai_recipe.image_url if ai_recipe else None,
                    'prep_time': ai_recipe.prep_time if ai_recipe else 30,
                    'kcal': ai_recipe.kcal if ai_recipe else 350,
                    'category': 'AI Generated',
                    'is_ai_generated': True,
                    'is_saved': True,
                    'saved_at': None
                }
                data.append(ai_data)
    
    return Response(data)

# ========== SEARCH HISTORY ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_search_history(request):
    history = UserSearchHistory.objects.filter(user=request.user)[:10]
    return Response({'searches': [item.query for item in history]})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_search_history(request):
    query = request.data.get('query', '').strip()
    if not query:
        return Response({'error': 'Query required'}, status=400)
    
    UserSearchHistory.objects.filter(user=request.user, query=query).delete()
    UserSearchHistory.objects.create(user=request.user, query=query)
    
    history = UserSearchHistory.objects.filter(user=request.user)
    if history.count() > 10:
        history.last().delete()
    return Response({'status': 'added'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_search_history(request):
    UserSearchHistory.objects.filter(user=request.user).delete()
    return Response({'status': 'cleared'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_search_item(request, query):
    UserSearchHistory.objects.filter(user=request.user, query=query).delete()
    return Response({'status': 'removed'})

# ========== VIEWED RECIPES ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_viewed_recipes(request):
    viewed = UserViewedRecipe.objects.filter(user=request.user)[:20]
    return Response({'recipes': [item.recipe_data for item in viewed]})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_viewed_recipe(request):
    recipe_data = request.data.get('recipe_data', {})
    if not recipe_data:
        return Response({'error': 'Recipe data required'}, status=400)
    
    recipe_title = recipe_data.get('title', '')
    recipe_id = recipe_data.get('id', recipe_title)
    
    UserViewedRecipe.objects.filter(user=request.user, recipe_id=recipe_id).delete()
    UserViewedRecipe.objects.create(
        user=request.user,
        recipe_id=recipe_id,
        recipe_title=recipe_title,
        recipe_data=recipe_data
    )
    
    viewed = UserViewedRecipe.objects.filter(user=request.user)
    if viewed.count() > 20:
        viewed.last().delete()
    return Response({'status': 'added'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_viewed_recipes(request):
    UserViewedRecipe.objects.filter(user=request.user).delete()
    return Response({'status': 'cleared'})