// Matthew Li
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { getEvent, signUpForEvent, cancelSignup, getMySignups, trackExternalClick } from '../api/events';
import type { Event, EventSignup } from '../types';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [signup, setSignup] = useState<EventSignup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelledMessage, setCancelledMessage] = useState('');

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      setIsLoading(true);
      try {
        const eventData = await getEvent(parseInt(id));
        setEvent(eventData);

        // Check if user is signed up
        if (isLoggedIn) {
          const signups = await getMySignups();
          const existingSignup = signups.find((s) => s.event.id === parseInt(id));
          if (existingSignup) {
            setSignup(existingSignup);
          }
        }
      } catch (err) {
        setError('Failed to load event');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvent();
  }, [id, isLoggedIn]);

  const handleSignUp = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    if (!event) return;

    setIsSubmitting(true);
    setError('');
    setCancelledMessage('');
    try {
      const newSignup = await signUpForEvent(event.id);
      setSignup(newSignup);
      setSuccessMessage('Successfully signed up!');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });

      // Refresh event data so spots_remaining updates
      const updatedEvent = await getEvent(event.id);
      setEvent(updatedEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!signup) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      await cancelSignup(signup.id);
      setSignup(null);
      setCancelledMessage('Sign-up cancelled');

      // Refresh event data so spots_remaining updates
      const updatedEvent = await getEvent(parseInt(id!));
      setEvent(updatedEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExternalClick = async () => {
    if (!event) return;
    try {
      await trackExternalClick(event.id);
    } catch {
      // Non-blocking — don't surface tracking errors to the user
    }
    window.open(event.external_url!, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className="loading">Loading event...</div>;
  }

  if (!event) {
    return (
      <div className="error-page">
        <h1>Event Not Found</h1>
        <Link to="/events">Back to Events</Link>
      </div>
    );
  }

  const isSignedUp = signup && signup.status !== 'cancelled';
  const isPastEvent = new Date(event.date) < new Date();

  return (
    <div className="event-detail-page">
      <Link to="/events" className="back-link">
        Back to Events
      </Link>

      <article className="event-detail">
        <header className="event-detail-header">
          <span className="event-category">{event.category}</span>
          <h1>{event.name}</h1>
          <p className="event-org">{event.organization_name}</p>
        </header>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {cancelledMessage && <div className="cancelled-message">{cancelledMessage}</div>}

        <div className="event-detail-content">
          <div className="event-info">
            <section className="info-section">
              <h3>When</h3>
              <p>{formatDate(event.date)}</p>
              {event.end_time && <p>Ends: {formatDate(event.end_time)}</p>}
            </section>

            <section className="info-section">
              <h3>Where</h3>
              <p>{event.location}</p>
              {event.address && <p className="address">{event.address}</p>}
            </section>

            <section className="info-section">
              <h3>About This Opportunity</h3>
              <p>{event.description}</p>
            </section>

            {(event.contact_email || event.organization_website) && (
              <section className="info-section">
                <h3>Contact</h3>
                {event.contact_email && <p>{event.contact_email}</p>}
                {event.organization_website && (
                  <p>
                    <a href={event.organization_website} target="_blank" rel="noopener noreferrer">
                      {event.organization_website}
                    </a>
                  </p>
                )}
              </section>
            )}
          </div>

          <aside className="event-sidebar">
            <div className="signup-card">
              {event.spots_remaining !== null && (
                <p className="spots-info">
                  <strong>{event.spots_remaining}</strong> spots remaining
                </p>
              )}

              {isPastEvent ? (
                <p className="past-event">This event has already occurred</p>
              ) : event.registration_type === 'external' ? (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleExternalClick}
                >
                  Register on {event.organization_name || 'Organization'}'s Site
                </button>
              ) : isSignedUp ? (
                <>
                  <p className="signed-up-message">You're signed up!</p>
                  <p className="signup-status">Status: {signup?.status}</p>
                  {signup?.status === 'signed_up' && (
                    <button
                      className="btn btn-secondary btn-block"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Cancelling...' : 'Cancel Signup'}
                    </button>
                  )}
                </>
              ) : event.is_full ? (
                <p className="event-full">This event is full</p>
              ) : (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleSignUp}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing up...' : isLoggedIn ? 'Sign Up' : 'Login to Sign Up'}
                </button>
              )}
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
