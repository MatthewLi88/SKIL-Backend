// Matthew Li
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollReveal, useScrolled } from '../hooks/useMotion';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const scrolled = useScrolled();
  useScrollReveal();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app">
      <header className={`header${scrolled ? ' header-scrolled' : ''}`}>
        <div className="header-content">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="Southlake Circle" className="logo-img" />
            <span>Southlake Circle</span>
          </Link>
          <nav className="nav">
            <NavLink to="/events">Events</NavLink>
            <NavLink to="/organizations">Organizations</NavLink>
            {isLoggedIn ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                <span className="user-name">Hi, {user?.first_name || user?.username}</span>
                <button onClick={handleLogout} className="btn-link">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {/* Keyed on the route so each page fades in when you navigate */}
      <main className="main" key={pathname}>
        {children}
      </main>
      <footer className="footer">
        <p>Southlake Circle - Change moves in Circles</p>
      </footer>
    </div>
  );
}
