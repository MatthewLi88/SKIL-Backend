# Matthew Li
from django.db.models import Q
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.utils import timezone

from .models import VolunteerProfile, Event, EventSignup, Organization, ExternalRegistrationClick
from .serializers import (
    UserSerializer, RegisterSerializer, VolunteerProfileSerializer,
    UpdateUserSerializer, ChangePasswordSerializer,
    QuestionnaireSerializer, EventSerializer, EventListSerializer,
    EventSignupSerializer, MySignupSerializer,
    OrganizationSerializer, OrganizationRegistrationSerializer
)
from .categories import get_categories_dict
from .emails import send_signup_confirmation, send_org_signup_notification
from decimal import Decimal


def complete_past_signups(profile):
    """Auto-complete signups for events that have passed and log hours."""
    now = timezone.now()
    past_signups = profile.signups.filter(
        status='signed_up',
        event__date__lt=now,
    ).select_related('event')

    for signup in past_signups:
        event = signup.event
        # Calculate hours from event duration
        if event.end_time:
            duration = event.end_time - event.date
            hours = Decimal(str(duration.total_seconds() / 3600))
        else:
            # Default to 1 hour if no end time set
            hours = Decimal('1')

        signup.hours_logged = hours.quantize(Decimal('0.01'))
        signup.status = 'completed'
        signup.save()


class RegisterView(generics.CreateAPIView):
    """Register a new user."""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens for immediate login
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's profile."""
    serializer_class = VolunteerProfileSerializer

    def get_object(self):
        profile, _ = VolunteerProfile.objects.get_or_create(user=self.request.user)
        return profile


class UpdateUserView(generics.UpdateAPIView):
    """Update the current user's account details (username, email, names)."""
    serializer_class = UpdateUserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change the current user's password."""

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        return Response({'message': 'Password changed successfully'})


class QuestionnaireView(APIView):
    """Submit questionnaire and get matched events."""

    def post(self, request):
        serializer = QuestionnaireSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Update profile
        profile, _ = VolunteerProfile.objects.get_or_create(user=request.user)
        profile.areas_of_interest = serializer.validated_data['areas_of_interest']
        profile.phone_number = serializer.validated_data.get('phone_number', '')
        profile.age = serializer.validated_data.get('age')
        profile.questionnaire_completed = True
        profile.save()

        # Get recommended events
        recommended = Event.objects.filter(
            category__in=profile.areas_of_interest,
            status='published',
            date__gte=timezone.now()
        )
        if profile.age is not None:
            recommended = recommended.filter(Q(min_age__isnull=True) | Q(min_age__lte=profile.age))
        recommended = recommended.order_by('date')[:10]

        return Response({
            'message': 'Questionnaire submitted successfully',
            'profile': VolunteerProfileSerializer(profile, context={'request': request}).data,
            'recommended_events': EventListSerializer(recommended, many=True).data
        })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def categories_list(request):
    """Get available interest categories."""
    return Response(get_categories_dict())


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    """View events. List shows published upcoming events."""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Event.objects.filter(status='published')

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        # Filter upcoming only (default)
        show_past = self.request.query_params.get('show_past', 'false').lower() == 'true'
        if not show_past:
            queryset = queryset.filter(date__gte=timezone.now())

        return queryset.order_by('date')

    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        return EventSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Get events matching user's interests."""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            profile = request.user.volunteer_profile
        except VolunteerProfile.DoesNotExist:
            return Response(
                {'error': 'Please complete your profile first'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not profile.areas_of_interest:
            return Response(
                {'error': 'Please complete the questionnaire first'},
                status=status.HTTP_400_BAD_REQUEST
            )

        events = Event.objects.filter(
            category__in=profile.areas_of_interest,
            status='published',
            date__gte=timezone.now()
        )
        if profile.age is not None:
            events = events.filter(Q(min_age__isnull=True) | Q(min_age__lte=profile.age))
        events = events.order_by('date')[:10]

        serializer = EventListSerializer(events, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='track-click', permission_classes=[permissions.AllowAny])
    def track_click(self, request, pk=None):
        event = self.get_object()
        if event.registration_type != 'external':
            return Response({'error': 'Not an external registration event.'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user if request.user.is_authenticated else None
        ExternalRegistrationClick.objects.create(event=event, user=user)
        return Response({'status': 'recorded'})


class SignupViewSet(viewsets.ModelViewSet):
    """Manage event signups."""
    serializer_class = EventSignupSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # Send emails after a successful signup (status 201)
        if response.status_code == status.HTTP_201_CREATED:
            try:
                signup_id = response.data.get('id')
                from .models import EventSignup as ES
                signup = ES.objects.select_related(
                    'volunteer__user', 'event__organization__user'
                ).get(pk=signup_id)
                send_signup_confirmation(signup)
                send_org_signup_notification(signup)
            except Exception:
                pass  # Never block the response due to email failure
        return response

    def get_queryset(self):
        # Auto-complete past signups before returning
        try:
            profile = self.request.user.volunteer_profile
            complete_past_signups(profile)
        except VolunteerProfile.DoesNotExist:
            pass
        return EventSignup.objects.filter(
            volunteer__user=self.request.user
        ).select_related('event')

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return MySignupSerializer
        return EventSignupSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a signup."""
        signup = self.get_object()
        if signup.status in ['completed', 'no_show']:
            return Response(
                {'error': 'Cannot cancel a completed signup'},
                status=status.HTTP_400_BAD_REQUEST
            )
        signup.status = 'cancelled'
        signup.save()
        return Response({'message': 'Signup cancelled'})


class OrganizationRegistrationView(generics.CreateAPIView):
    """Register a new organization account."""
    permission_classes = [permissions.AllowAny]
    serializer_class = OrganizationRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        org = serializer.save()

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(org.user)

        return Response({
            'organization': OrganizationSerializer(org).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Organization registered successfully. An admin will review and approve your account.'
        }, status=status.HTTP_201_CREATED)


class MyStatsView(APIView):
    """Get volunteer statistics."""

    def get(self, request):
        try:
            profile = request.user.volunteer_profile
        except VolunteerProfile.DoesNotExist:
            return Response({
                'total_hours': 0,
                'events_attended': 0,
                'upcoming_events': 0,
            })

        # Auto-complete past signups before calculating stats
        complete_past_signups(profile)

        signups = profile.signups.all()

        return Response({
            'total_hours': float(profile.total_hours),
            'events_attended': signups.filter(status__in=['attended', 'completed']).count(),
            'upcoming_events': signups.filter(
                status='signed_up',
                event__date__gte=timezone.now()
            ).count(),
            'events_signed_up': signups.exclude(status='cancelled').count(),
        })
