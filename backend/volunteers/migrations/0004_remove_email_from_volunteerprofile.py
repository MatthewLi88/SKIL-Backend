from django.db import migrations


class Migration(migrations.Migration):
    """
    Drops the legacy 'email' column from volunteers_volunteerprofile.
    This column was added by an old migration that is no longer in the codebase,
    but may still exist in the production database.
    """

    dependencies = [
        ('volunteers', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE volunteers_volunteerprofile DROP COLUMN IF EXISTS email;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
