from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class VolunteerProfile(models.Model):
    # Link each volunteer profile to a user account
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Additional info about the volunteer
    age = models.IntegerField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    areas_of_interest = models.CharField(
        max_length=200,
        blank=True,
        help_text="Examples: Environment, Education, Food & Hunger"
    )
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.user.username
