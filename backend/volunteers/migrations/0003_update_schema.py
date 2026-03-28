"""
Migration to bridge old schema (0001+0002) to new schema.

Old DB state (after old 0001+0002):
- VolunteerProfile: id, phone_number, areas_of_interest, user_id
- Event: id, name, date, location, description, category
- No EventSignup table

New state needed:
- VolunteerProfile: + questionnaire_completed, created_at, updated_at
- Event: + end_time, address, max_volunteers, organization_name,
          contact_email, status, created_at, updated_at
- EventSignup: new table
"""

import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Add missing VolunteerProfile fields
        migrations.AddField(
            model_name='volunteerprofile',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='volunteerprofile',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),

        # Add missing Event fields
        migrations.AddField(
            model_name='event',
            name='end_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='address',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='event',
            name='max_volunteers',
            field=models.PositiveIntegerField(default=0, help_text='0 = unlimited'),
        ),
        migrations.AddField(
            model_name='event',
            name='organization_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='event',
            name='contact_email',
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='event',
            name='status',
            field=models.CharField(
                choices=[('draft', 'Draft'), ('published', 'Published'), ('cancelled', 'Cancelled'), ('completed', 'Completed')],
                default='published',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='event',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='event',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),

        # Create EventSignup table
        migrations.CreateModel(
            name='EventSignup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(
                    choices=[('signed_up', 'Signed Up'), ('attended', 'Attended'), ('completed', 'Completed'), ('no_show', 'No Show'), ('cancelled', 'Cancelled')],
                    default='signed_up',
                    max_length=20,
                )),
                ('hours_logged', models.DecimalField(
                    decimal_places=2,
                    default=0,
                    max_digits=5,
                    validators=[django.core.validators.MinValueValidator(0)],
                )),
                ('signed_up_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('notes', models.TextField(blank=True)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='signups', to='volunteers.event')),
                ('volunteer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='signups', to='volunteers.volunteerprofile')),
            ],
            options={
                'ordering': ['-signed_up_at'],
                'unique_together': {('volunteer', 'event')},
            },
        ),
    ]
