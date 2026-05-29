# Matthew Li
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0010_organization_is_southlake_based'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='city',
            field=models.CharField(
                max_length=100,
                blank=True,
                default='',
                help_text='City the organization is located in',
            ),
            preserve_default=False,
        ),
    ]
