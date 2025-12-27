from django import forms
from .models import VolunteerProfile

class VolunteerProfileForm(forms.ModelForm):
    # Example: areas of interest as checkboxes
    areas_of_interest = forms.MultipleChoiceField(
        choices=VolunteerProfile.INTEREST_CHOICES,  # use your model's choices
        widget=forms.CheckboxSelectMultiple,        # renders as checkboxes
        required=False
    )

    class Meta:
        model = VolunteerProfile
        fields = '__all__'  # include all fields from the model
