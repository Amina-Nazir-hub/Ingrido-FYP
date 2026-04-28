from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer
from .models import UserProfile
import traceback

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            health = request.data.get('health_conditions', [])
            diet = request.data.get('dietary_preferences', [])
            
            UserProfile.objects.create(
                user=user, 
                health_conditions=health, 
                dietary_preferences=diet
            )
            
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "message": "User registered successfully!"
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            print("ERROR:", traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)
    
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": {
                "first_name": user.first_name,
                "email": user.email
            }
        }, status=status.HTTP_200_OK)
    
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    try:
        profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            "first_name": user.first_name,
            "email": user.email,
            "health_conditions": profile.health_conditions,
            "dietary_preferences": profile.dietary_preferences
        })

    if request.method == 'PUT':
        # 1. User basic info update
        user.first_name = request.data.get('first_name', user.first_name)
        user.save()
        
        # 2. Profile extra info update
        health = request.data.get('health_conditions')
        diet = request.data.get('dietary_preferences')

        if health is not None:
            profile.health_conditions = health
        if diet is not None:
            profile.dietary_preferences = diet
            
        profile.save() # Database mein save karna
        
        print(f"DEBUG: Data saved for {user.email}")
        return Response({"message": "Profile updated successfully!", "status": "success"})