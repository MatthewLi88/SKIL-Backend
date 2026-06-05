# Matthew Li
from decimal import Decimal
from django.contrib import admin
from django.utils import timezone
from .models import VolunteerProfile, Event, EventSignup, Organization, ExternalRegistrationClick, OrganizationClick


@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'questionnaire_completed', 'signup_hours_display', 'hours_adjustment', 'total_hours_display', 'created_at']
    list_filter = ['questionnaire_completed', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone_number']
    readonly_fields = ['signup_hours_display', 'total_hours_display', 'created_at', 'updated_at']
    fieldsets = (
        (None, {
            'fields': ('user', 'phone_number', 'age', 'areas_of_interest', 'questionnaire_completed'),
        }),
        ('Service hours', {
            'fields': ('signup_hours_display', 'hours_adjustment', 'total_hours_display'),
            'description': (
                'Hours from completed signups are computed automatically. '
                'Use "Hours adjustment" to manually credit or correct hours '
                '(e.g. off-platform volunteering). It can be negative.'
            ),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    @admin.display(description='Signup hours', ordering=None)
    def signup_hours_display(self, obj):
        return obj.signup_hours

    @admin.display(description='Total hours', ordering=None)
    def total_hours_display(self, obj):
        return obj.total_hours


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

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Org staff users only see their own events
        return qs.filter(organization__user=request.user)

    def save_model(self, request, obj, form, change):
        if not change and not request.user.is_superuser:
            # Auto-assign the org when creating a new event
            try:
                obj.organization = request.user.organization
                obj.organization_name = obj.organization.name
            except Organization.DoesNotExist:
                pass
        super().save_model(request, obj, form, change)


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
    list_display = ['name', 'city', 'contact_email', 'website', 'is_approved', 'is_southlake_based', 'link_click_count', 'notify_on_signup', 'created_at']
    list_filter = ['is_approved', 'is_southlake_based', 'notify_on_signup', 'created_at']
    search_fields = ['name', 'city', 'contact_email', 'user__username']
    readonly_fields = ['created_at']
    actions = ['approve_organizations']

    def get_queryset(self, request):
        from django.db.models import Count
        return super().get_queryset(request).annotate(_click_count=Count('link_clicks'))

    @admin.display(description='Link clicks', ordering='_click_count')
    def link_click_count(self, obj):
        return getattr(obj, '_click_count', obj.link_clicks.count())

    def approve_organizations(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f"{updated} organization(s) approved.")
    approve_organizations.short_description = "Approve selected organizations"


@admin.register(ExternalRegistrationClick)
class ExternalRegistrationClickAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'clicked_at']
    list_filter = ['clicked_at', 'event']
    search_fields = ['event__name', 'user__username']
    readonly_fields = ['event', 'user', 'clicked_at']


@admin.register(OrganizationClick)
class OrganizationClickAdmin(admin.ModelAdmin):
    list_display = ['organization', 'user', 'clicked_at']
    list_filter = ['clicked_at', 'organization']
    search_fields = ['organization__name', 'user__username']
    readonly_fields = ['organization', 'user', 'clicked_at']
