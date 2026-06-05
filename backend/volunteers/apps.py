# Matthew Li
from django.apps import AppConfig


class VolunteersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'volunteers'

    def ready(self):
        # Point the default admin index at our custom template that adds a
        # platform-wide service-hours summary box at the top.
        from django.contrib import admin
        admin.site.index_template = 'admin/southlake_index.html'
