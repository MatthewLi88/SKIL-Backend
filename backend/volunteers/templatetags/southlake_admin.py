# Matthew Li
from decimal import Decimal
from django import template
from django.db.models import Sum

from volunteers.models import EventSignup, VolunteerProfile

register = template.Library()


@register.simple_tag
def southlake_totals():
    """Platform-wide volunteer hour stats for the admin dashboard."""
    signup_total = EventSignup.objects.filter(status='completed').aggregate(
        s=Sum('hours_logged')
    )['s'] or Decimal('0')
    adjustment_total = VolunteerProfile.objects.aggregate(
        s=Sum('hours_adjustment')
    )['s'] or Decimal('0')
    total_hours = signup_total + adjustment_total

    return {
        'total_hours': total_hours,
        'signup_hours': signup_total,
        'adjustment_hours': adjustment_total,
        'volunteer_count': VolunteerProfile.objects.count(),
        'completed_signup_count': EventSignup.objects.filter(status='completed').count(),
    }
