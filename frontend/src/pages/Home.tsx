// Matthew Li
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  {
    title: 'Find your match',
    text: 'Take a quick questionnaire and get opportunities that fit what you care about.',
  },
  {
    title: 'Sign up in one click',
    text: 'Browse upcoming and ongoing events, then grab a spot right from the event page.',
  },
  {
    title: 'Track your impact',
    text: 'Your volunteer hours add up automatically, so you always know where you stand.',
  },
];

export function Home() {
  const { isLoggedIn, profile } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        {/* Slowly turning rings: "Change moves in Circles" */}
        <svg className="hero-rings" viewBox="0 0 600 600" aria-hidden="true">
          <circle className="ring ring-1" cx="300" cy="300" r="120" />
          <circle className="ring ring-2" cx="300" cy="300" r="190" />
          <circle className="ring ring-3" cx="300" cy="300" r="260" />
          <circle className="ring-dot dot-1" cx="300" cy="180" r="7" />
          <circle className="ring-dot dot-2" cx="490" cy="300" r="5" />
          <circle className="ring-dot dot-3" cx="300" cy="560" r="6" />
        </svg>

        <div className="hero-content">
          <h1 className="hero-title">Make a difference in your community</h1>
          <p className="hero-text">
            Find volunteer opportunities that match your interests and schedule.
            Connect with local organizations making an impact in Southlake.
          </p>
          <div className="hero-buttons">
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
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
                <Link to="/events" className="btn btn-ghost btn-lg">
                  Browse Events
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="how-it-works" aria-labelledby="how-heading">
        <h2 id="how-heading">How it works</h2>
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="step">
              <span className="step-number" aria-hidden="true">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
