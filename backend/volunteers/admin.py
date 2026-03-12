from django.contrib import admin
from .models import VolunteerProfile, Event, EventSignup


@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'questionnaire_completed', 'total_hours', 'created_at']
    list_filter = ['questionnaire_completed', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone_number']
    readonly_fields = ['total_hours', 'created_at', 'updated_at']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'date', 'location', 'status', 'spots_remaining']
    list_filter = ['status', 'category', 'date']
    search_fields = ['name', 'description', 'location', 'organization_name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-date']


@admin.register(EventSignup)
class EventSignupAdmin(admin.ModelAdmin):
    list_display = ['volunteer', 'event', 'status', 'hours_logged', 'signed_up_at']
    list_filter = ['status', 'signed_up_at']
    search_fields = ['volunteer__user__username', 'event__name']
    readonly_fields = ['signed_up_at', 'updated_at']
