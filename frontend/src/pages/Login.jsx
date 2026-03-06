import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login, addNotification } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) { addNotification('Please fill in all fields.'); return; }
    setLoading(true);
    const { error } = await login(form);
    setLoading(false);
    if (error) { addNotification('Invalid email or password.'); return; }
    addNotification('Welcome back to RealtyInvestors.');
    navigate('/dashboard');
  };

  return (
    <div className="auth-page" style={{ paddingTop: 'var(--nav-h)' }}>
      {/* Visual side */}
      <div className="auth-visual">
        <div
          className="auth-visual-bg"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80)' }}
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="section-tag" style={{ marginBottom: 20 }}>
            <div className="section-tag-line" />
            <span className="section-tag-text">Investor Portal</span>
          </div>
          <h2 className="display display-lg" style={{ color: 'var(--ivory)', marginBottom: 20 }}>
            Welcome Back.
          </h2>
          <p style={{ color: 'rgba(248,246,241,0.5)', fontSize: 15, lineHeight: 1.7, maxWidth: 360 }}>
            Access your portfolio, track investments, and manage your real estate returns.
          </p>
          <div style={{ marginTop: 48, display: 'flex', gap: 48 }}>
            {[['$50M+', 'Invested'], ['10,000+', 'Investors'], ['12.4%', 'Avg ROI']].map(([n, l], i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--gold)', fontWeight: 300 }}>{n}</div>
                <div style={{ fontSize: 11, color: 'rgba(248,246,241,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-title">Sign In</div>
          <p className="auth-sub">Enter your credentials to access your investor dashboard.</p>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <a style={{ fontSize: 13, color: 'var(--gold-dark)', cursor: 'pointer', fontWeight: 500 }}>
              Forgot password?
            </a>
          </div>

          <button
            className="btn btn-gold btn-block"
            style={{ padding: 16 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup">Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
