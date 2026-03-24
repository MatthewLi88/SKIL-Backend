from django.core.mail import send_mail
from django.conf import settings


def _fmt_date(dt):
    return dt.strftime('%A, %B %d, %Y at %I:%M %p')


def send_signup_confirmation(signup):
    """Send a confirmation email to a volunteer after they sign up for an event."""
    user = signup.volunteer.user
    event = signup.event

    if not user.email:
        return

    name = user.first_name or user.username
    lines = [
        f"Hi {name},",
        "",
        f"You're signed up for {event.name}!",
        "",
        f"  Date:     {_fmt_date(event.date)}",
    ]
    if event.end_time:
        lines.append(f"  Ends:     {_fmt_date(event.end_time)}")
    lines += [
        f"  Location: {event.location}",
    ]
    if event.address:
        lines.append(f"  Address:  {event.address}")
    lines += [
        "",
        event.description,
        "",
    ]
    if event.contact_email:
        lines.append(f"Questions? Reach the organizer at {event.contact_email}")
    if event.organization_website:
        lines.append(f"Learn more: {event.organization_website}")
    lines += [
        "",
        "Thank you for volunteering!",
        "— The Southlake Circle Team",
    ]

    send_mail(
        subject=f"You're signed up: {event.name}",
        message="\n".join(lines),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def send_org_signup_notification(signup):
    """Notify an organization when a volunteer signs up for one of their events."""
    event = signup.event
    org = event.organization

    if not org or not org.notify_on_signup:
        return

    recipient = org.contact_email or (org.user.email if org.user else None)
    if not recipient:
        return

    volunteer = signup.volunteer.user
    full_name = volunteer.get_full_name() or volunteer.username

    lines = [
        f"Hello {org.name},",
        "",
        "A new volunteer just signed up for one of your events:",
        "",
        f"  Event:     {event.name}",
        f"  Date:      {_fmt_date(event.date)}",
        "",
        f"  Volunteer: {full_name}",
        f"  Email:     {volunteer.email}",
        "",
        "You can view all signups in the admin panel.",
        "",
        "— The Southlake Circle Team",
    ]

    send_mail(
        subject=f"New signup for {event.name}: {full_name}",
        message="\n".join(lines),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient],
        fail_silently=True,
    )
