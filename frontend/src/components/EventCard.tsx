import { Link } from 'react-router-dom';
import type { EventListItem } from '../types';

interface EventCardProps {
  event: EventListItem;
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="event-card">
      <div className="event-card-header">
        <span className="event-category">{event.category}</span>
        {event.is_full && <span className="event-full-badge">Full</span>}
      </div>
      <h3 className="event-title">{event.name}</h3>
      <div className="event-details">
        <p className="event-date">{formatDate(event.date)}</p>
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
