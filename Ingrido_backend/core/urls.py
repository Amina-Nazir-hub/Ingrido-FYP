"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include 
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static 



urlpatterns = [
    # Admin Panel 
    path('admin/', admin.site.urls),

    # Accounts App ke saare raste (Register, Login, Recipes)
    # Ye line React frontend ko Django views se jorti hai

    path('api/accounts/', include('accounts.urls')), 
]

# --- MEDIA CONFIGURATION ---
# Ye hissa Django ko batata hai ke 'media' folder se images kaise serve karni hain
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)