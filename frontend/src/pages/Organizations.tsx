// Matthew Li
import { useState, useEffect } from 'react';
import { getOrganizations, type OrgLocationFilter } from '../api/events';
import type { Organization } from '../types';

export function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filter, setFilter] = useState<OrgLocationFilter>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrganizations() {
      setIsLoading(true);
      setError('');
      try {
        const data = await getOrganizations(filter);
        setOrganizations(data);
        setExpandedId(null);
      } catch (err) {
        setError('Failed to load organizations');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrganizations();
  }, [filter]);

  const toggleExpand = (id: number) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const locationLabel = (org: Organization) => {
    if (org.city) return org.city;
    return org.is_southlake_based ? 'Southlake' : 'Other location';
  };

  return (
    <div className="organizations-page">
      <header className="page-header">
        <h1>Volunteer Organizations</h1>
        <p>Browse the organizations partnering with Southlake Circle.</p>
      </header>

      <div className="filter-section">
        <label>Location:</label>
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`btn ${filter === 'southlake' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('southlake')}
        >
          Southlake-based
        </button>
        <button
          className={`btn ${filter === 'other' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('other')}
        >
          Non-Southlake
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading">Loading organizations...</div>
      ) : organizations.length > 0 ? (
        <div className="organizations-grid">
          {organizations.map((org) => {
            const isExpanded = expandedId === org.id;
            return (
              <div
                key={org.id}
                className={`org-card${isExpanded ? ' org-card-expanded' : ''}`}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => toggleExpand(org.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(org.id);
                  }
                }}
              >
                <div className="org-card-header">
                  <span className={`org-location-tag ${org.is_southlake_based ? 'southlake' : 'other'}`}>
                    {locationLabel(org)}
                  </span>
                </div>
                <h3 className="org-title">{org.name}</h3>
                <p className="org-subtitle">Based in {locationLabel(org)}</p>

                {isExpanded && (
                  <div className="org-card-body">
                    {org.description ? (
                      <p className="org-description">{org.description}</p>
                    ) : (
                      <p className="org-description org-description-empty">
                        No description provided.
                      </p>
                    )}
                    {(org.website || org.contact_email || org.contact_phone) && (
                      <div className="org-contact">
                        {org.website && (
                          <p>
                            <a
                              href={org.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {org.website}
                            </a>
                          </p>
                        )}
                        {org.contact_email && <p>{org.contact_email}</p>}
                        {org.contact_phone && <p>{org.contact_phone}</p>}
                      </div>
                    )}
                  </div>
                )}

                <div className="org-card-footer">
                  <span className="org-expand-hint">
                    {isExpanded ? 'Click to collapse' : 'Click to view description'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-events">
          <p>No organizations found.</p>
        </div>
      )}
    </div>
  );
}
