from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import UserProfile, SavedRecipe, UserSearchHistory, UserViewedRecipe

User = get_user_model()

# Custom User Admin
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'username')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

# User Profile Admin
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'health_conditions', 'dietary_preferences')
    search_fields = ('user__email', 'user__first_name')
    list_filter = ('health_conditions',)
    
    def get_health_conditions_display(self, obj):
        return ", ".join(obj.health_conditions) if obj.health_conditions else "None"
    get_health_conditions_display.short_description = "Health Conditions"

# Saved Recipe Admin
@admin.register(SavedRecipe)
class SavedRecipeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'recipe', 'saved_at')
    list_filter = ('saved_at',)
    search_fields = ('user__email', 'recipe__title')
    readonly_fields = ('saved_at',)

# Search History Admin
@admin.register(UserSearchHistory)
class UserSearchHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'query', 'searched_at')
    list_filter = ('searched_at',)
    search_fields = ('user__email', 'query')
    readonly_fields = ('searched_at',)

# Viewed Recipe Admin
@admin.register(UserViewedRecipe)
class UserViewedRecipeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'recipe_title', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('user__email', 'recipe_title')
    readonly_fields = ('viewed_at',)