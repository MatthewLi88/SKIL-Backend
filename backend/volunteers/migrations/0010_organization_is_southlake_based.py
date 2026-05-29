# Matthew Li
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0009_add_animal_care_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='is_southlake_based',
            field=models.BooleanField(
                default=True,
                help_text='Whether this organization is based in Southlake',
            ),
        ),
    ]
