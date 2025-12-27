from django.shortcuts import render, redirect
from .forms import VolunteerProfileForm

def questionnaire(request):
    if request.method == 'POST':
        form = VolunteerProfileForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('thank_you')  # can create a simple thank you page
    else:
        form = VolunteerProfileForm()
    return render(request, 'volunteers/questionnaire.html', {'form': form})
