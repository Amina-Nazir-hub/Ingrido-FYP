from django.db import models
from django.conf import settings

class ViewedHistory(models.Model):
    """Store user's viewed recipe history"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dashboard_viewed')
    recipe_id = models.CharField(max_length=100)
    recipe_title = models.CharField(max_length=255)
    recipe_data = models.JSONField(default=dict)
    is_ai_generated = models.BooleanField(default=False)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-viewed_at']
        unique_together = ('user', 'recipe_id')
        db_table = 'dashboard_viewed_history'
    
    def __str__(self):
        return f"{self.user.email} - {self.recipe_title}"

class DashboardStats(models.Model):
    """Store dashboard statistics for user"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dashboard_stats')
    total_recipes_viewed = models.IntegerField(default=0)
    total_recipes_saved = models.IntegerField(default=0)
    last_active = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dashboard_stats'
    
    def __str__(self):
        return f"Stats for {self.user.email}"