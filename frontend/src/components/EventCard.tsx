// Matthew Li
import { Link } from 'react-router-dom';
import type { EventListItem } from '../types';

interface EventCardProps {
  event: EventListItem;
}

export function EventCard({ event }: EventCardProps) {
  const date = !event.is_ongoing && event.date ? new Date(event.date) : null;

  return (
    <div className="event-card">
      <div className="event-card-top">
        {/* Calendar-style tile so the date is easy to scan */}
        <div className={`date-tile${date ? '' : ' date-tile-ongoing'}`}>
          {date ? (
            <>
              <span className="date-tile-month">
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span className="date-tile-day">{date.getDate()}</span>
            </>
          ) : (
            <span className="date-tile-ongoing-label">Ongoing</span>
          )}
        </div>
        <div className="event-card-header">
          <span className="event-category">{event.category}</span>
          {event.is_full && <span className="event-full-badge">Full</span>}
          {event.min_age && <span className="event-age-badge">Ages {event.min_age}+</span>}
        </div>
      </div>
      <h3 className="event-title">{event.name}</h3>
      <div className="event-details">
        <p className="event-date">
          {date
            ? date.toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' })
            : 'Flexible schedule, help anytime'}
        </p>
        <p className="event-location">{event.location}</p>
        <p className="event-org">{event.organization_name}</p>
      </div>
      <div className="event-card-footer">
        {event.spots_remaining !== null && (
          <span className="spots-remaining">
            {event.spots_remaining} spots left
          </span>
        )}
        <Link to={`/events/${event.id}`} className="btn btn-secondary">
          View Details
        </Link>
      </div>
    </div>
  );
}
