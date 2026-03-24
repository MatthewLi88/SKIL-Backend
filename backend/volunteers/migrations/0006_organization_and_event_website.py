from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('volunteers', '0005_add_age_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('website', models.URLField(blank=True)),
                ('contact_email', models.EmailField(blank=True)),
                ('contact_phone', models.CharField(blank=True, max_length=20)),
                ('is_approved', models.BooleanField(default=False, help_text='Admin must approve before org can post events')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='organization',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
        migrations.AddField(
            model_name='event',
            name='organization',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='events',
                to='volunteers.organization',
            ),
        ),
        migrations.AddField(
            model_name='event',
            name='organization_website',
            field=models.URLField(blank=True),
        ),
    ]
