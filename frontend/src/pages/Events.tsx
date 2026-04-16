// Matthew Li
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
  const [selectedOrg, setSelectedOrg] = useState<string>('');
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
        <label htmlFor="org-filter">Organization:</label>
        <select
          id="org-filter"
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
        >
          <option value="">All Organizations</option>
          {Array.from(new Set(events.map((e) => e.organization_name).filter(Boolean))).sort().map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {(searchName || searchDate || selectedCategory || selectedOrg) && (
          <button
            className="btn btn-secondary"
            onClick={() => { setSearchName(''); setSearchDate(''); setSelectedCategory(''); setSelectedOrg(''); }}
          >
            Clear
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading">Loading events...</div>
      ) : (() => {
        const filtered = events.filter((event) => {
          const matchesName = !searchName || event.name.toLowerCase().includes(searchName.toLowerCase());
          const matchesDate = !searchDate || event.date.startsWith(searchDate);
          const matchesOrg = !selectedOrg || event.organization_name === selectedOrg;
          return matchesName && matchesDate && matchesOrg;
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
            <button className="btn btn-secondary" onClick={() => { setSearchName(''); setSearchDate(''); setSelectedCategory(''); setSelectedOrg(''); }}>
              Clear Filters
            </button>
          </div>
        );
      })()}
    </div>
  );
}
