from django.shortcuts import render, redirect
from .forms import VolunteerProfileForm

def questionnaire(request):
    if request.method == 'POST':
        form = VolunteerProfileForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('thank_you')
    else:
        form = VolunteerProfileForm()
    return render(request, 'volunteers/questionnaire.html', {'form': form})

def thank_you(request):
    return render(request, 'volunteers/thank_you.html')
