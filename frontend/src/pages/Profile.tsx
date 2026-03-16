import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUser, changePassword, updateProfile } from '../api/auth';
import { getMySignups } from '../api/events';
import type { EventSignup } from '../types';

export function Profile() {
  const { user, profile, refreshProfile } = useAuth();

  // Account info form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Volunteer preferences state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [prefsError, setPrefsError] = useState('');
  const [prefsSuccess, setPrefsSuccess] = useState('');
  const [prefsLoading, setPrefsLoading] = useState(false);

  // Events state
  const [signups, setSignups] = useState<EventSignup[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Populate form fields from current user/profile data
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setPhoneNumber(profile.phone_number || '');
      setAge(profile.age ?? undefined);
    }
  }, [profile]);

  // Load signups on mount
  useEffect(() => {
    async function loadSignups() {
      try {
        const data = await getMySignups();
        setSignups(data);
      } catch (err) {
        console.error('Failed to load signups:', err);
      } finally {
        setEventsLoading(false);
      }
    }
    loadSignups();
  }, []);

  // Handle account info update
  const handleAccountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');
    setAccountLoading(true);
    try {
      await updateUser({ username, email });
      await refreshProfile();
      setAccountSuccess('Account details updated successfully');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Failed to update account');
    } finally {
      setAccountLoading(false);
    }
  };

  // Handle volunteer preferences update
  const handlePrefsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPrefsError('');
    setPrefsSuccess('');
    setPrefsLoading(true);
    try {
      await updateProfile({ phone_number: phoneNumber, age: age ?? null });
      await refreshProfile();
      setPrefsSuccess('Preferences updated successfully');
    } catch (err) {
      setPrefsError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setPrefsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== newPasswordConfirm) {
      setPasswordError("New passwords don't match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Split signups into upcoming vs past
  const now = new Date();
  const upcomingSignups = signups.filter(
    (s) => s.status !== 'cancelled' && new Date(s.event.date) >= now
  );
  const pastSignups = signups.filter(
    (s) => s.status !== 'cancelled' && new Date(s.event.date) < now
  );

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account and view your events</p>
      </header>

      {/* Account Details */}
      <section className="profile-section">
        <h2>Account Details</h2>
        {accountError && <div className="error-message">{accountError}</div>}
        {accountSuccess && <div className="success-message">{accountSuccess}</div>}
        <form onSubmit={handleAccountSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={accountLoading}>
            {accountLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      {/* Volunteer Preferences */}
      <section className="profile-section">
        <h2>Volunteer Preferences</h2>
        {prefsError && <div className="error-message">{prefsError}</div>}
        {prefsSuccess && <div className="success-message">{prefsSuccess}</div>}
        <form onSubmit={handlePrefsSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number (optional)</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(555) 555-5555"
              />
            </div>
            <div className="form-group">
              <label htmlFor="age">Age (optional)</label>
              <input
                type="number"
                id="age"
                value={age ?? ''}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Your age"
                min={0}
                max={120}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={prefsLoading}>
              {prefsLoading ? 'Saving...' : 'Save Preferences'}
            </button>
            <Link to="/questionnaire" className="btn btn-secondary">
              Retake Questionnaire
            </Link>
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className="profile-section">
        <h2>Change Password</h2>
        {passwordError && <div className="error-message">{passwordError}</div>}
        {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPasswordConfirm">Confirm New Password</label>
              <input
                type="password"
                id="newPasswordConfirm"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </section>

      {/* My Events */}
      <section className="profile-section">
        <h2>My Events</h2>
        {eventsLoading ? (
          <div className="loading">Loading events...</div>
        ) : signups.length === 0 ? (
          <p className="no-events">
            You haven't signed up for any events yet.{' '}
            <Link to="/events">Browse events</Link>
          </p>
        ) : (
          <>
            {upcomingSignups.length > 0 && (
              <>
                <h3>Upcoming</h3>
                <div className="profile-events-list">
                  {upcomingSignups.map((signup) => (
                    <div key={signup.id} className="profile-event-item">
                      <div className="profile-event-info">
                        <span className="event-category">{signup.event.category}</span>
                        <h4>
                          <Link to={`/events/${signup.event.id}`}>{signup.event.name}</Link>
                        </h4>
                        <p className="event-date">{formatDate(signup.event.date)}</p>
                        <p className="event-location">{signup.event.location}</p>
                      </div>
                      <span className="signup-status">
                        {signup.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {pastSignups.length > 0 && (
              <>
                <h3>Past</h3>
                <div className="profile-events-list">
                  {pastSignups.map((signup) => (
                    <div key={signup.id} className="profile-event-item past">
                      <div className="profile-event-info">
                        <span className="event-category">{signup.event.category}</span>
                        <h4>
                          <Link to={`/events/${signup.event.id}`}>{signup.event.name}</Link>
                        </h4>
                        <p className="event-date">{formatDate(signup.event.date)}</p>
                        <p className="event-location">{signup.event.location}</p>
                      </div>
                      <span className="signup-status">
                        {signup.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
