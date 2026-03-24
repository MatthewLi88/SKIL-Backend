from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0006_organization_and_event_website'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='notify_on_signup',
            field=models.BooleanField(
                default=True,
                help_text='Email the org when a volunteer signs up for one of their events',
            ),
        ),
    ]
