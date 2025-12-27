from django.urls import path
from . import views

urlpatterns = [
    path('questionnaire/', views.questionnaire, name='questionnaire'),
    path('thank-you/', views.thank_you, name='thank_you'),
]
