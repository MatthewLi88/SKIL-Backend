from django.db import migrations, models
import django.db.models.expressions


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0013_volunteerprofile_hours_adjustment'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='is_ongoing',
            field=models.BooleanField(
                default=False,
                help_text='Check for ongoing opportunities with no fixed date (volunteers can help anytime). '
                          'Date and end time are not needed when this is checked.',
            ),
        ),
        migrations.AlterField(
            model_name='event',
            name='date',
            field=models.DateTimeField(blank=True, help_text='Required unless the event is ongoing.', null=True),
        ),
        migrations.AlterModelOptions(
            name='event',
            options={'ordering': [django.db.models.expressions.OrderBy(django.db.models.expressions.F('date'), nulls_last=True)]},
        ),
    ]
