from django.db import models
from django.contrib.auth.models import User

class VolunteerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    age = models.IntegerField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    
    # Questionnaire / interests
    INTEREST_CHOICES = [
        ('Environment', 'Environment'),
        ('Education/Library', 'Education/Library'),
        ('Healthcare', 'Healthcare'),
        ('Government', 'Government'),
        ('Food & Hunger', 'Food & Hunger'),
        ('Elder Care', 'Elder Care'),
        ('Sports & Recreation', 'Sports & Recreation'),
        ('Town Square Events', 'Town Square Events'),
    ]
    areas_of_interest = models.JSONField(default=list, blank=True)  # store selected interests as a list
    # availability = models.CharField(max_length=200, blank=True)  # optional: free text or structured
    
    def __str__(self):
        return self.user.username


class Event(models.Model):
    CATEGORY_CHOICES = VolunteerProfile.INTEREST_CHOICES  # ensures categories match volunteer interests

    name = models.CharField(max_length=200)
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    def __str__(self):
        return self.name
