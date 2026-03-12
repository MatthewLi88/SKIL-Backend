import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { isLoggedIn, profile } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Make a Difference in Your Community</h1>
        <p>
          Find volunteer opportunities that match your interests and schedule.
          Connect with local organizations making an impact.
        </p>
        {isLoggedIn ? (
          profile?.questionnaire_completed ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/questionnaire" className="btn btn-primary btn-lg">
              Complete Your Profile
            </Link>
          )
        ) : (
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/events" className="btn btn-secondary btn-lg">
              Browse Events
            </Link>
          </div>
        )}
      </section>

      <section className="features">
        <div className="feature">
          <h3>Find Your Match</h3>
          <p>Take our quick questionnaire to discover opportunities aligned with your interests.</p>
        </div>
        <div className="feature">
          <h3>Sign Up Easily</h3>
          <p>Browse upcoming events and sign up with just one click.</p>
        </div>
        <div className="feature">
          <h3>Track Your Impact</h3>
          <p>Log your volunteer hours and see the difference you're making.</p>
        </div>
      </section>
    </div>
  );
}
