from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .forms import VolunteerProfileForm
from .models import Event  # make sure Event is imported


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

        # Get recommended events based on volunteer interests
        interests = profile.areas_of_interest  # this is a list
        recommended_events = Event.objects.filter(category__in=interests).order_by('date')[:5]  # top 5 upcoming events

        # Serialize events to JSON-friendly format
        events_list = [
            {
                "id": event.id,
                "name": event.name,
                "date": event.date.isoformat(),
                "location": event.location,
                "description": event.description,
                "category": event.category
            }
            for event in recommended_events
        ]

        return JsonResponse({
            "status": "success",
            "id": profile.id,
            "recommended_events": events_list
        }, status=201)

    return JsonResponse({
        "status": "error",
        "errors": form.errors
    }, status=400)
