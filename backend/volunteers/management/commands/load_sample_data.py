"""
Management command to load sample events data.
Usage: python manage.py load_sample_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from volunteers.models import Event


class Command(BaseCommand):
    help = 'Load sample events for development/testing'

    def handle(self, *args, **options):
        # Clear existing events
        Event.objects.all().delete()

        # Base date for upcoming events
        now = timezone.now()

        # Sample events - easily replaceable with real data
        sample_events = [
            {
                'name': 'Park Cleanup Day',
                'description': 'Join us for a community park cleanup! We will be picking up litter, planting flowers, and maintaining trails. All supplies provided.',
                'category': 'environment',
                'date': now + timedelta(days=7),
                'end_time': now + timedelta(days=7, hours=3),
                'location': 'Central Park',
                'address': '123 Park Ave, Southlake, TX',
                'max_volunteers': 20,
                'organization_name': 'Southlake Parks Department',
                'contact_email': 'parks@example.org',
            },
            {
                'name': 'Library Reading Program',
                'description': 'Read to children at the local library. Help foster a love of reading in young minds. Training provided for new volunteers.',
                'category': 'education',
                'date': now + timedelta(days=3),
                'end_time': now + timedelta(days=3, hours=2),
                'location': 'Southlake Public Library',
                'address': '456 Library Lane, Southlake, TX',
                'max_volunteers': 10,
                'organization_name': 'Southlake Library',
                'contact_email': 'library@example.org',
            },
            {
                'name': 'Food Bank Sorting',
                'description': 'Help sort and package food donations at the community food bank. Make a direct impact on families facing food insecurity.',
                'category': 'food',
                'date': now + timedelta(days=5),
                'end_time': now + timedelta(days=5, hours=4),
                'location': 'Community Food Bank',
                'address': '789 Charity Way, Southlake, TX',
                'max_volunteers': 15,
                'organization_name': 'Southlake Food Bank',
                'contact_email': 'foodbank@example.org',
            },
            {
                'name': 'Senior Center Bingo Night',
                'description': 'Help run bingo night at the senior center. Assist with setup, calling numbers, and socializing with residents.',
                'category': 'eldercare',
                'date': now + timedelta(days=10),
                'end_time': now + timedelta(days=10, hours=3),
                'location': 'Sunshine Senior Center',
                'address': '321 Elder St, Southlake, TX',
                'max_volunteers': 8,
                'organization_name': 'Sunshine Senior Center',
                'contact_email': 'seniors@example.org',
            },
            {
                'name': 'Youth Soccer Coaching',
                'description': 'Assist with coaching youth soccer practice. No experience necessary - just enthusiasm and a love for kids and sports!',
                'category': 'sports',
                'date': now + timedelta(days=2),
                'end_time': now + timedelta(days=2, hours=2),
                'location': 'Southlake Sports Complex',
                'address': '555 Athletic Dr, Southlake, TX',
                'max_volunteers': 6,
                'organization_name': 'Southlake Youth Sports',
                'contact_email': 'sports@example.org',
            },
            {
                'name': 'Health Fair Volunteer',
                'description': 'Help at the community health fair. Assist with registration, direct attendees, and help at various health screening stations.',
                'category': 'healthcare',
                'date': now + timedelta(days=14),
                'end_time': now + timedelta(days=14, hours=6),
                'location': 'Community Center',
                'address': '100 Main St, Southlake, TX',
                'max_volunteers': 25,
                'organization_name': 'Southlake Health Department',
                'contact_email': 'health@example.org',
            },
            {
                'name': 'Town Square Festival Setup',
                'description': 'Help set up for the annual town square festival. Tasks include arranging tables, hanging decorations, and general setup.',
                'category': 'events',
                'date': now + timedelta(days=21),
                'end_time': now + timedelta(days=21, hours=5),
                'location': 'Town Square',
                'address': '1 Town Square, Southlake, TX',
                'max_volunteers': 30,
                'organization_name': 'Southlake Events Committee',
                'contact_email': 'events@example.org',
            },
            {
                'name': 'City Council Meeting Support',
                'description': 'Assist with setup and logistics for city council meetings. Help with sign-in, materials distribution, and general support.',
                'category': 'government',
                'date': now + timedelta(days=8),
                'end_time': now + timedelta(days=8, hours=3),
                'location': 'City Hall',
                'address': '200 Government Plaza, Southlake, TX',
                'max_volunteers': 5,
                'organization_name': 'City of Southlake',
                'contact_email': 'cityhall@example.org',
            },
        ]

        for event_data in sample_events:
            Event.objects.create(**event_data)
            self.stdout.write(f"Created event: {event_data['name']}")

        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {len(sample_events)} sample events'))
