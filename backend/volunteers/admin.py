from decimal import Decimal
from django.contrib import admin
from django.utils import timezone
from .models import VolunteerProfile, Event, EventSignup, Organization


@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'questionnaire_completed', 'total_hours', 'created_at']
    list_filter = ['questionnaire_completed', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone_number']
    readonly_fields = ['total_hours', 'created_at', 'updated_at']


def mark_signups_completed(modeladmin, request, queryset):
    """Admin action: auto-log hours and mark selected signups as completed."""
    updated = 0
    for signup in queryset.filter(status='signed_up').select_related('event'):
        event = signup.event
        if event.end_time:
            duration = event.end_time - event.date
            hours = Decimal(str(duration.total_seconds() / 3600)).quantize(Decimal('0.01'))
        else:
            hours = Decimal('1.00')
        signup.hours_logged = hours
        signup.status = 'completed'
        signup.save()
        updated += 1
    modeladmin.message_user(request, f"{updated} signup(s) marked as completed with hours logged.")

mark_signups_completed.short_description = "Mark selected as completed (auto-log hours)"


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'date', 'organization_name', 'status', 'spots_remaining']
    list_filter = ['status', 'category', 'date', 'organization']
    search_fields = ['name', 'description', 'location', 'organization_name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-date']


class EventSignupInline(admin.TabularInline):
    model = EventSignup
    extra = 0
    fields = ['volunteer', 'status', 'hours_logged', 'signed_up_at']
    readonly_fields = ['signed_up_at']
    can_delete = False


@admin.register(EventSignup)
class EventSignupAdmin(admin.ModelAdmin):
    list_display = ['volunteer', 'event', 'status', 'hours_logged', 'signed_up_at']
    list_filter = ['status', 'event', 'signed_up_at']
    search_fields = ['volunteer__user__username', 'event__name']
    readonly_fields = ['signed_up_at', 'updated_at']
    actions = [mark_signups_completed]


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_email', 'website', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['name', 'contact_email', 'user__username']
    readonly_fields = ['created_at']
    actions = ['approve_organizations']

    def approve_organizations(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f"{updated} organization(s) approved.")
    approve_organizations.short_description = "Approve selected organizations"
