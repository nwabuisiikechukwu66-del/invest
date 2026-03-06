import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useScrolledNav } from '@hooks/useScrolledNav';
import { useApp } from '@context/AppContext';

const NAV_LINKS = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Investments',  to: '/investments' },
  { label: 'About',        to: '/about' },
  { label: 'Blog',         to: '/blog' },
  { label: 'FAQ',          to: '/faq' },
];

export default function Nav() {
  const scrolled   = useScrolledNav(40);
  const { user, logoutDemo } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate   = useNavigate();
  const location   = useLocation();
  const isHome     = location.pathname === '/';

  const forceBlack = !isHome;
  const navBg      = forceBlack ? 'var(--black)' : (scrolled ? 'rgba(15,15,15,0.96)' : 'transparent');

  const close = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logoutDemo();
    navigate('/');
    close();
  };

  return (
    <>
      <nav
        className={`nav ${scrolled || forceBlack ? 'scrolled' : ''}`}
        style={{ background: navBg }}
      >
        <div className="container">
          <div className="nav-inner">
            <Link to="/" className="nav-logo" onClick={close}>
              Realty<span>Investors</span>
            </Link>

            <div className="nav-links">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`nav-link${location.pathname === l.to ? ' active' : ''}`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="nav-actions">
              {user ? (
                <>
                  <Link to="/dashboard" className="nav-login">Dashboard</Link>
                  <button className="btn btn-gold btn-sm" onClick={handleLogout}>Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-login">Login</Link>
                  <Link to="/signup" className="btn btn-gold btn-sm">Get Started</Link>
                </>
              )}

              <div
                className="hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span style={menuOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
                <span style={menuOpen ? { opacity: 0 } : {}} />
                <span style={menuOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="mobile-link" onClick={close}>
            {l.label}
          </Link>
        ))}
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-gold" onClick={close}>Dashboard</Link>
              <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/signup" className="btn btn-gold" onClick={close}>Get Started</Link>
              <Link to="/login" className="btn btn-outline" onClick={close}>Login</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
