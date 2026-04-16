# Matthew Li
"""
Configurable interest/category choices for volunteer matching.

To modify categories:
1. Edit the INTEREST_CATEGORIES list below
2. Run migrations if needed: python manage.py makemigrations && python manage.py migrate
3. Update any existing data if category names changed

Note: Category keys should be URL-safe (no spaces, special chars).
Display names can be anything.
"""

# Format: (key, display_name)
# key: used in database and URLs (keep stable once in production)
# display_name: shown to users (can be changed freely)
INTEREST_CATEGORIES = [
    ('Environment', 'Environment'),
    ('Education/Library', 'Education/Library'),
    ('Healthcare', 'Healthcare'),
    ('Government', 'Government'),
    ('Food & Hunger', 'Food & Hunger'),
    ('Senior Center', 'Senior Center'),
    ('Physical Wellness', 'Physical Wellness'),
    ('Town Square Events', 'Town Square Events'),
    ('Animal Care', 'Animal Care'),
]

# Convert to Django choices format
def get_category_choices():
    """Returns list of tuples for Django model choices."""
    return INTEREST_CATEGORIES

def get_category_keys():
    """Returns just the keys (for validation)."""
    return [key for key, _ in INTEREST_CATEGORIES]

def get_category_display(key):
    """Get display name for a category key."""
    for k, display in INTEREST_CATEGORIES:
        if k == key:
            return display
    return key

def get_categories_dict():
    """Returns categories as a dict for API responses."""
    return [
        {'key': key, 'label': label}
        for key, label in INTEREST_CATEGORIES
    ]
