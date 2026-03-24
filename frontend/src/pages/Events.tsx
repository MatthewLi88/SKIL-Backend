import { useState, useEffect } from 'react';
import { getEvents, getCategories } from '../api/events';
import { EventCard } from '../components/EventCard';
import type { EventListItem, Category } from '../types';

export function Events() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'organization'>('date');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      setError('');
      try {
        const data = await getEvents(selectedCategory || undefined);
        setEvents(data);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, [selectedCategory]);

  return (
    <div className="events-page">
      <header className="page-header">
        <h1>Volunteer Opportunities</h1>
        <p>Browse upcoming events and find your next volunteer experience.</p>
      </header>

      {/* Filters */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="search-input"
        />
        <input
          type="month"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="search-input"
        />
        <label htmlFor="category-filter">Category:</label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>
        <label htmlFor="sort-by">Sort by:</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'organization')}
        >
          <option value="date">Date</option>
          <option value="organization">Organization</option>
        </select>
        {(searchName || searchDate || selectedCategory) && (
          <button
            className="btn btn-secondary"
            onClick={() => { setSearchName(''); setSearchDate(''); setSelectedCategory(''); }}
          >
            Clear
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading">Loading events...</div>
      ) : (() => {
        const filtered = events
          .filter((event) => {
            const matchesName = !searchName || event.name.toLowerCase().includes(searchName.toLowerCase());
            const matchesDate = !searchDate || event.date.startsWith(searchDate);
            return matchesName && matchesDate;
          })
          .sort((a, b) => {
            if (sortBy === 'organization') {
              return (a.organization_name || '').localeCompare(b.organization_name || '');
            }
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
        return filtered.length > 0 ? (
          <div className="events-grid">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="no-events">
            <p>No events found matching your search.</p>
            <button className="btn btn-secondary" onClick={() => { setSearchName(''); setSearchDate(''); setSelectedCategory(''); }}>
              Clear Filters
            </button>
          </div>
        );
      })()}
    </div>
  );
}
