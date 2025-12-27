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
    #availability = models.CharField(max_length=200, blank=True)     # optional: free text or structured
    
    #is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.user.username
