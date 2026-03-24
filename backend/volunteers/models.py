from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from .categories import get_category_choices


class VolunteerProfile(models.Model):
    """
    Extended profile for volunteers, linked to Django User.
    Created after user completes the questionnaire.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer_profile')

    # Contact info (email comes from User model)
    phone_number = models.CharField(max_length=20, blank=True)

    # Questionnaire responses - stores list of category keys like ['environment', 'food']
    areas_of_interest = models.JSONField(default=list, blank=True)

    # Volunteer info
    age = models.PositiveIntegerField(null=True, blank=True)

    # Profile completion tracking
    questionnaire_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

    @property
    def total_hours(self):
        """Calculate total volunteer hours from completed signups."""
        return self.signups.filter(
            status='completed'
        ).aggregate(
            total=models.Sum('hours_logged')
        )['total'] or 0


class Organization(models.Model):
    """
    A volunteer organization that can host events.
    """
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)

    # Linked user account (the org's admin account)
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='organization'
    )

    is_approved = models.BooleanField(default=False, help_text="Admin must approve before org can post events")
    notify_on_signup = models.BooleanField(default=True, help_text="Email the org when a volunteer signs up for one of their events")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Event(models.Model):
    """
    Volunteer opportunity/event that users can sign up for.
    """
    CATEGORY_CHOICES = get_category_choices()

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    # Scheduling
    date = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)

    # Location
    location = models.CharField(max_length=200)
    address = models.TextField(blank=True)

    # Capacity
    max_volunteers = models.PositiveIntegerField(default=0, help_text="0 = unlimited")
    min_age = models.PositiveIntegerField(null=True, blank=True, help_text="Minimum volunteer age (optional)")

    # Organization info (plain text for backwards compat; links to Organization if available)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='events'
    )
    organization_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    organization_website = models.URLField(blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return self.name

    @property
    def spots_remaining(self):
        """Calculate remaining spots (None if unlimited)."""
        if self.max_volunteers == 0:
            return None
        signed_up = self.signups.exclude(status='cancelled').count()
        return max(0, self.max_volunteers - signed_up)

    @property
    def is_full(self):
        """Check if event has reached capacity."""
        if self.max_volunteers == 0:
            return False
        return self.spots_remaining == 0


class EventSignup(models.Model):
    """
    Tracks a volunteer's signup to an event, including hours logged.
    """
    STATUS_CHOICES = [
        ('signed_up', 'Signed Up'),
        ('attended', 'Attended'),
        ('completed', 'Completed'),  # Hours verified
        ('no_show', 'No Show'),
        ('cancelled', 'Cancelled'),
    ]

    volunteer = models.ForeignKey(
        VolunteerProfile,
        on_delete=models.CASCADE,
        related_name='signups'
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='signups'
    )

    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='signed_up')

    # Hours tracking
    hours_logged = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    # Timestamps
    signed_up_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Notes
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['volunteer', 'event']  # Prevent duplicate signups
        ordering = ['-signed_up_at']

    def __str__(self):
        return f"{self.volunteer.user.username} - {self.event.name}"
