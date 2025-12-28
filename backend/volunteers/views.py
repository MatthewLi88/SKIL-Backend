#from django.shortcuts import render, redirect
from .forms import VolunteerProfileForm

#def questionnaire(request):
#    if request.method == 'POST':
#        form = VolunteerProfileForm(request.POST)
#        if form.is_valid():
#            form.save()
#            return redirect('thank_you')
#    else:
#        form = VolunteerProfileForm()
#    return render(request, 'volunteers/questionnaire.html', {'form': form})

#def thank_you(request):
#    return render(request, 'volunteers/thank_you.html')

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .forms import VolunteerProfileForm


@csrf_exempt   # temporary — remove later when frontend handles CSRF
def questionnaire(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    form = VolunteerProfileForm(data)

    if form.is_valid():
        profile = form.save()
        return JsonResponse({
            "status": "success",
            "id": profile.id
        }, status=201)

    return JsonResponse({
        "status": "error",
        "errors": form.errors
    }, status=400)
