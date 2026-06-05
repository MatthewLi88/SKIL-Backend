# Matthew Li
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0012_organizationclick'),
    ]

    operations = [
        migrations.AddField(
            model_name='volunteerprofile',
            name='hours_adjustment',
            field=models.DecimalField(
                max_digits=7,
                decimal_places=2,
                default=0,
                help_text=(
                    'Admin-only manual adjustment added to total service hours. '
                    'Can be negative.'
                ),
            ),
        ),
    ]
