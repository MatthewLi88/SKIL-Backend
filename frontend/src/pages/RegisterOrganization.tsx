// Matthew Li
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setTokens } from '../api/client';
import { registerOrganization } from '../api/events';

export function RegisterOrganization() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    org_name: '',
    org_description: '',
    org_website: '',
    org_contact_email: '',
    org_contact_phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerOrganization(formData);
      setTokens(result.tokens.access, result.tokens.refresh);
      navigate('/dashboard', { state: { orgPending: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h1>Register Your Organization</h1>
        <p className="auth-subtitle">
          Create an organization account to post volunteer opportunities. An admin will review and
          approve your account before you can publish events.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <h3 style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>Organization Info</h3>

          <div className="form-group">
            <label htmlFor="org_name">Organization Name *</label>
            <input
              type="text"
              id="org_name"
              name="org_name"
              value={formData.org_name}
              onChange={handleChange}
              required
              placeholder="e.g. Southlake Community Food Bank"
            />
          </div>

          <div className="form-group">
            <label htmlFor="org_description">Description</label>
            <textarea
              id="org_description"
              name="org_description"
              value={formData.org_description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of your organization and mission"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="org_contact_email">Contact Email</label>
              <input
                type="email"
                id="org_contact_email"
                name="org_contact_email"
                value={formData.org_contact_email}
                onChange={handleChange}
                placeholder="contact@yourorg.org"
              />
            </div>
            <div className="form-group">
              <label htmlFor="org_contact_phone">Contact Phone</label>
              <input
                type="tel"
                id="org_contact_phone"
                name="org_contact_phone"
                value={formData.org_contact_phone}
                onChange={handleChange}
                placeholder="(555) 000-0000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="org_website">Website</label>
            <input
              type="url"
              id="org_website"
              name="org_website"
              value={formData.org_website}
              onChange={handleChange}
              placeholder="https://yourorg.org"
            />
          </div>

          <h3 style={{ marginBottom: '0.5rem', marginTop: '1rem' }}>Account Login</h3>

          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password_confirm">Confirm Password *</label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Register Organization'}
          </button>
        </form>

        <p className="auth-footer">
          Volunteering as an individual? <Link to="/register">Create a volunteer account</Link>
        </p>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
