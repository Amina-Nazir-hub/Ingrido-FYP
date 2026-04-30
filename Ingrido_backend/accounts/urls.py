from django.urls import path

from .views import register_user, login_user, user_profile # user_profile yahan add kiya



urlpatterns = [

    # Signup ka rasta

    path('register/', register_user, name='register'),

    # Login ka rasta

    path('login/', login_user, name='login'),

    path('profile/', user_profile, name='user_profile'),

]