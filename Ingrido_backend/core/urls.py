"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include  # 'include' add karna zaroori hai

urlpatterns = [
    # Admin Panel ka rasta
    path('admin/', admin.site.urls),

    # Accounts App ke saare raste (Register, Login)
    # Ye line React frontend ko Django views se jorti hai
    path('api/accounts/', include('accounts.urls')), 
]