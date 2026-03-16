from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0004_remove_email_from_volunteerprofile'),
    ]

    operations = [
        migrations.AddField(
            model_name='volunteerprofile',
            name='age',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='min_age',
            field=models.PositiveIntegerField(blank=True, null=True, help_text='Minimum volunteer age (optional)'),
        ),
    ]
