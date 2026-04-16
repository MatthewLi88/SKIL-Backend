# Matthew Li
import logging
import threading
import os

logger = logging.getLogger(__name__)


def _send_in_background(subject, text, to):
    """Fire-and-forget email via Resend's HTTPS API (works on Render free tier)."""
    def _send():
        try:
            import resend
            resend.api_key = os.environ.get('RESEND_API_KEY', '')
            if not resend.api_key:
                logger.error("Email not sent: RESEND_API_KEY env var is missing")
                return

            from_addr = os.environ.get('DEFAULT_FROM_EMAIL', 'Southlake Circle <onboarding@resend.dev>')

            resend.Emails.send({
                'from': from_addr,
                'to': [to],
                'subject': subject,
                'text': text,
            })
            logger.info("Email sent to %s: %s", to, subject)
        except Exception as e:
            logger.error("Email failed to %s: %s", to, e)

    threading.Thread(target=_send, daemon=True).start()


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
    lines += [f"  Location: {event.location}"]
    if event.address:
        lines.append(f"  Address:  {event.address}")
    lines += ["", event.description, ""]
    if event.contact_email:
        lines.append(f"Questions? Reach the organizer at {event.contact_email}")
    if event.organization_website:
        lines.append(f"Learn more: {event.organization_website}")
    lines += ["", "Thank you for volunteering!", "— The Southlake Circle Team"]

    _send_in_background(f"You're signed up: {event.name}", "\n".join(lines), user.email)


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

    _send_in_background(f"New signup for {event.name}: {full_name}", "\n".join(lines), recipient)
