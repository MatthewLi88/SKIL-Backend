from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import VolunteerProfile, Event, EventSignup
from .categories import get_category_keys


class UserSerializer(serializers.ModelSerializer):
    """Basic user info serializer."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': "Passwords don't match."})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        # Create empty volunteer profile
        VolunteerProfile.objects.create(user=user)
        return user


class VolunteerProfileSerializer(serializers.ModelSerializer):
    """Serializer for volunteer profile."""
    user = UserSerializer(read_only=True)
    total_hours = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    events_count = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerProfile
        fields = [
            'id', 'user', 'phone_number', 'areas_of_interest',
            'questionnaire_completed', 'total_hours', 'events_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_events_count(self, obj):
        return obj.signups.exclude(status='cancelled').count()

    def validate_areas_of_interest(self, value):
        valid_keys = get_category_keys()
        for interest in value:
            if interest not in valid_keys:
                raise serializers.ValidationError(f"Invalid interest: {interest}")
        return value


class UpdateUserSerializer(serializers.ModelSerializer):
    """Serializer for updating user account details (username, email)."""
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    current_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {'new_password_confirm': "New passwords don't match."}
            )
        return attrs


class QuestionnaireSerializer(serializers.Serializer):
    """Serializer for questionnaire submission."""
    areas_of_interest = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        help_text="List of interest category keys"
    )
    phone_number = serializers.CharField(required=False, allow_blank=True)

    def validate_areas_of_interest(self, value):
        valid_keys = get_category_keys()
        for interest in value:
            if interest not in valid_keys:
                raise serializers.ValidationError(f"Invalid interest: {interest}")
        return value


class EventSerializer(serializers.ModelSerializer):
    """Serializer for events."""
    spots_remaining = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    is_signed_up = serializers.SerializerMethodField()
    signup_status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'name', 'description', 'category', 'date', 'end_time',
            'location', 'address', 'max_volunteers', 'organization_name',
            'contact_email', 'status', 'spots_remaining', 'is_full',
            'is_signed_up', 'signup_status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_is_signed_up(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        try:
            profile = request.user.volunteer_profile
            return obj.signups.filter(volunteer=profile).exclude(status='cancelled').exists()
        except VolunteerProfile.DoesNotExist:
            return False

    def get_signup_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        try:
            profile = request.user.volunteer_profile
            signup = obj.signups.filter(volunteer=profile).first()
            return signup.status if signup else None
        except VolunteerProfile.DoesNotExist:
            return None


class EventListSerializer(serializers.ModelSerializer):
    """Lighter serializer for event lists."""
    spots_remaining = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'name', 'category', 'date', 'location',
            'organization_name', 'spots_remaining', 'is_full', 'status'
        ]


class EventSignupSerializer(serializers.ModelSerializer):
    """Serializer for event signups."""
    event = EventListSerializer(read_only=True)
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        source='event',
        write_only=True
    )

    class Meta:
        model = EventSignup
        fields = [
            'id', 'event', 'event_id', 'status', 'hours_logged',
            'signed_up_at', 'notes'
        ]
        read_only_fields = ['id', 'signed_up_at', 'status', 'hours_logged']

    def validate_event_id(self, value):
        if value.status != 'published':
            raise serializers.ValidationError("This event is not available for signup.")
        if value.is_full:
            raise serializers.ValidationError("This event is full.")
        return value

    def create(self, validated_data):
        volunteer = self.context['request'].user.volunteer_profile
        event = validated_data['event']

        # Check for existing signup
        existing = EventSignup.objects.filter(volunteer=volunteer, event=event).first()
        if existing:
            if existing.status == 'cancelled':
                existing.status = 'signed_up'
                existing.save()
                return existing
            raise serializers.ValidationError("You are already signed up for this event.")

        return EventSignup.objects.create(volunteer=volunteer, **validated_data)


class MySignupSerializer(serializers.ModelSerializer):
    """Serializer for viewing own signups with full event details."""
    event = EventSerializer(read_only=True)

    class Meta:
        model = EventSignup
        fields = [
            'id', 'event', 'status', 'hours_logged',
            'signed_up_at', 'updated_at', 'notes'
        ]
