# apps/cities/admin.py
from django.contrib import admin
from .models import City

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'region', 'tagline', 'is_pandamart_available']
    list_filter = ['region', 'is_pandamart_available']
    search_fields = ['name', 'region']