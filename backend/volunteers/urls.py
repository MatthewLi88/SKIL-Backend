from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

router = DefaultRouter()
router.register(r'events', views.EventViewSet, basename='event')
router.register(r'signups', views.SignupViewSet, basename='signup')

urlpatterns = [
    # Authentication
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile & Questionnaire
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/update-user/', views.UpdateUserView.as_view(), name='update_user'),
    path('profile/change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('questionnaire/', views.QuestionnaireView.as_view(), name='questionnaire'),
    path('categories/', views.categories_list, name='categories'),

    # Stats
    path('stats/', views.MyStatsView.as_view(), name='my_stats'),

    # Router URLs (events, signups)
    path('', include(router.urls)),
]
