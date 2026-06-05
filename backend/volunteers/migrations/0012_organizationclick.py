# Matthew Li
from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0011_organization_city'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='OrganizationClick',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('clicked_at', models.DateTimeField(auto_now_add=True)),
                ('organization', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='link_clicks',
                    to='volunteers.organization',
                )),
                ('user', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['-clicked_at'],
            },
        ),
    ]
