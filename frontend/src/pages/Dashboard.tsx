// Matthew Li
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyStats, getRecommendedEvents, getMySignups } from '../api/events';
import { EventCard } from '../components/EventCard';
import type { VolunteerStats, EventListItem, EventSignup } from '../types';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [recommendedEvents, setRecommendedEvents] = useState<EventListItem[]>([]);
  const [mySignups, setMySignups] = useState<EventSignup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, eventsData, signupsData] = await Promise.all([
          getMyStats(),
          getRecommendedEvents().catch(() => []),
          getMySignups(),
        ]);
        setStats(statsData);
        setRecommendedEvents(eventsData);
        setMySignups(signupsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // If questionnaire not completed, redirect to it
  if (profile && !profile.questionnaire_completed) {
    return (
      <div className="dashboard-page">
        <div className="complete-profile-prompt">
          <h2>Complete Your Profile</h2>
          <p>Tell us about your interests to get matched with volunteer opportunities.</p>
          <Link to="/questionnaire" className="btn btn-primary">
            Take Questionnaire
          </Link>
        </div>
      </div>
    );
  }

  const upcomingSignups = mySignups.filter(
    (s) => s.status === 'signed_up' && new Date(s.event.date) > new Date()
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Welcome, {user?.first_name || user?.username}!</h1>
      </header>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <span className="stat-value">{stats?.total_hours || 0}</span>
          <span className="stat-label">Total Hours</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.events_attended || 0}</span>
          <span className="stat-label">Events Attended</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.upcoming_events || 0}</span>
          <span className="stat-label">Upcoming Events</span>
        </div>
      </section>

      {/* Upcoming Signups */}
      {upcomingSignups.length > 0 && (
        <section className="dashboard-section">
          <h2>Your Upcoming Events</h2>
          <div className="events-grid">
            {upcomingSignups.map((signup) => (
              <div key={signup.id} className="event-card">
                <div className="event-card-header">
                  <span className="event-category">{signup.event.category}</span>
                  <span className="signup-status">
                    {signup.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
                <h3 className="event-title">{signup.event.name}</h3>
                <div className="event-details">
                  <p className="event-date">
                    {new Date(signup.event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="event-location">{signup.event.location}</p>
                </div>
                <Link to={`/events/${signup.event.id}`} className="btn btn-secondary">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Events */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recommended For You</h2>
          <Link to="/events" className="btn-link">
            View All Events
          </Link>
        </div>
        {recommendedEvents.length > 0 ? (
          <div className="events-grid">
            {recommendedEvents.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="no-events">No recommended events at this time. Check back later!</p>
        )}
      </section>
    </div>
  );
}
