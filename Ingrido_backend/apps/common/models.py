from django.db import models

# Create your models here.
# apps/common/models.py
# APNE PURANE MODELS KE NEECHE YEH ADD KARO

class GeneratedImageCache(models.Model):
    """Cache for AI generated images to avoid repeated API calls"""
    dish_name = models.CharField(max_length=255, unique=True, db_index=True)
    image_url = models.CharField(max_length=500)
    image_path = models.CharField(max_length=500)
    prompt_used = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'generated_image_cache'
        verbose_name = 'Generated Image Cache'
        verbose_name_plural = 'Generated Image Cache'
    
    def __str__(self):
        return f"{self.dish_name} - {self.created_at}"
