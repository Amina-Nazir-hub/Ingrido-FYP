
# Register your models here.
# apps/common/admin.py
from django.contrib import admin
from .models import GeneratedImageCache

@admin.register(GeneratedImageCache)
class GeneratedImageCacheAdmin(admin.ModelAdmin):
    list_display = ['dish_name', 'image_url_preview', 'created_at', 'last_accessed']
    search_fields = ['dish_name']
    readonly_fields = ['created_at', 'last_accessed', 'prompt_used']
    
    def image_url_preview(self, obj):
        return f'<a href="{obj.image_url}" target="_blank">🔗 View Image</a>'
    image_url_preview.allow_html = True
    image_url_preview.short_description = 'Image'
