from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('volunteers', '0004_remove_email_from_volunteerprofile'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE volunteers_volunteerprofile ADD COLUMN IF NOT EXISTS age integer NULL;",
            reverse_sql="ALTER TABLE volunteers_volunteerprofile DROP COLUMN IF EXISTS age;",
        ),
        migrations.RunSQL(
            sql="ALTER TABLE volunteers_event ADD COLUMN IF NOT EXISTS min_age integer NULL;",
            reverse_sql="ALTER TABLE volunteers_event DROP COLUMN IF EXISTS min_age;",
        ),
    ]
