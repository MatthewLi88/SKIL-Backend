from django import forms
from .models import VolunteerProfile

class VolunteerProfileForm(forms.ModelForm):
    areas_of_interest = forms.MultipleChoiceField(
        choices=VolunteerProfile.INTEREST_CHOICES,  # use your defined choices
        widget=forms.CheckboxSelectMultiple,        # renders as checkboxes
        required=False
    )

    class Meta:
        model = VolunteerProfile
        fields = '__all__'
