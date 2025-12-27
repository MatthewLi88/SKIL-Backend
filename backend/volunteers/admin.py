from django.contrib import admin
from .models import VolunteerProfile
from .forms import VolunteerProfileForm

class VolunteerProfileAdmin(admin.ModelAdmin):
    form = VolunteerProfileForm

admin.site.register(VolunteerProfile, VolunteerProfileAdmin)
