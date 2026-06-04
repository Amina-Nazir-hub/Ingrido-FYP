from django.contrib import admin
from .models import ViewedHistory, DashboardStats

@admin.register(ViewedHistory)
class ViewedHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'recipe_title', 'is_ai_generated', 'viewed_at')
    list_filter = ('viewed_at', 'is_ai_generated')
    search_fields = ('user__email', 'recipe_title')
    readonly_fields = ('viewed_at',)
    ordering = ('-viewed_at',)

@admin.register(DashboardStats)
class DashboardStatsAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_recipes_viewed', 'total_recipes_saved', 'last_active')
    list_filter = ('last_active',)
    search_fields = ('user__email',)
    readonly_fields = ('last_active',)