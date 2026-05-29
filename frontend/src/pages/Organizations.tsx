// Matthew Li
import { useState, useEffect } from 'react';
import { getOrganizations, type OrgLocationFilter } from '../api/events';
import type { Organization } from '../types';

export function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filter, setFilter] = useState<OrgLocationFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrganizations() {
      setIsLoading(true);
      setError('');
      try {
        const data = await getOrganizations(filter);
        setOrganizations(data);
      } catch (err) {
        setError('Failed to load organizations');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrganizations();
  }, [filter]);

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
          {organizations.map((org) => (
            <article key={org.id} className="org-card">
              <header className="org-card-header">
                <h3>{org.name}</h3>
                <span className={`org-location-tag ${org.is_southlake_based ? 'southlake' : 'other'}`}>
                  {org.is_southlake_based ? 'Southlake-based' : 'Non-Southlake'}
                </span>
              </header>
              {org.description && <p className="org-description">{org.description}</p>}
              <div className="org-contact">
                {org.website && (
                  <p>
                    <a href={org.website} target="_blank" rel="noopener noreferrer">
                      {org.website}
                    </a>
                  </p>
                )}
                {org.contact_email && <p>{org.contact_email}</p>}
                {org.contact_phone && <p>{org.contact_phone}</p>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="no-events">
          <p>No organizations found.</p>
        </div>
      )}
    </div>
  );
}
