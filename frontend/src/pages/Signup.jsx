import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { COUNTRIES } from '@data/constants';

export default function Signup() {
  const navigate = useNavigate();
  const { register, addNotification } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first: '', last: '', email: '', password: '',
    country: '', goal: 'Passive Income', agree: false,
  });

  const handleNext = () => {
    if (!form.first || !form.last || !form.email || !form.password) {
      addNotification('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 8) {
      addNotification('Password must be at least 8 characters.');
      return;
    }
    setStep(2);
  };

  const handleCreate = async () => {
    if (!form.agree) { addNotification('Please agree to the Terms of Service.'); return; }
    setLoading(true);
    const { error } = await register({
      email: form.email,
      password: form.password,
      firstName: form.first,
      lastName: form.last,
      country: form.country,
    });
    setLoading(false);
    if (error) { addNotification('Could not create account. Please try again.'); return; }
    addNotification('Account created. Welcome to RealtyInvestors.');
    navigate('/dashboard');
  };

  return (
    <div className="auth-page" style={{ paddingTop: 'var(--nav-h)' }}>
      {/* Visual side */}
      <div className="auth-visual">
        <div
          className="auth-visual-bg"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=900&q=80)' }}
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="section-tag" style={{ marginBottom: 20 }}>
            <div className="section-tag-line" />
            <span className="section-tag-text">Join 10,000+ Investors</span>
          </div>
          <h2 className="display display-lg" style={{ color: 'var(--ivory)', marginBottom: 20 }}>
            Start Building<br />Wealth Today.
          </h2>
          <div style={{ marginTop: 40 }}>
            {[
              'Free to create an account',
              'Start investing from $100',
              'Properties in 30+ countries',
              'Monthly income distributions',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 20, height: 20, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: 'var(--black)', fontWeight: 800 }}>✓</span>
                </div>
                <span style={{ fontSize: 14, color: 'rgba(248,246,241,0.7)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          {/* Step progress */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {[1, 2].map((s) => (
              <div key={s} style={{ flex: 1, height: 3, background: step >= s ? 'var(--gold)' : 'var(--ivory-dark)', transition: 'background 0.3s', borderRadius: 2 }} />
            ))}
          </div>

          <div className="auth-title">{step === 1 ? 'Create Account' : 'Finish Setup'}</div>
          <p className="auth-sub">
            {step === 1
              ? 'Join thousands of investors building wealth through real estate.'
              : 'Complete your profile to start investing.'}
          </p>

          {step === 1 ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" type="text" placeholder="First name" value={form.first} onChange={(e) => setForm({ ...form, first: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" type="text" placeholder="Last name" value={form.last} onChange={(e) => setForm({ ...form, last: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <button className="btn btn-gold btn-block" style={{ padding: 16 }} onClick={handleNext}>
                Continue
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Country of Residence</label>
                <select className="form-select" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Investment Goal</label>
                <select className="form-select" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                  <option>Passive Income</option>
                  <option>Long-term Wealth Building</option>
                  <option>Portfolio Diversification</option>
                  <option>Retirement Planning</option>
                </select>
              </div>
              <div className="form-check" style={{ marginBottom: 24 }}>
                <input
                  type="checkbox"
                  id="agree"
                  checked={form.agree}
                  onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                />
                <label htmlFor="agree">
                  I agree to the{' '}
                  <a style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Terms of Service</a>,{' '}
                  <a style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Privacy Policy</a>, and{' '}
                  <a style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Risk Disclosure</a>.
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-outline-dark" style={{ padding: '16px 24px' }} onClick={() => setStep(1)}>
                  Back
                </button>
                <button
                  className="btn btn-gold"
                  style={{ flex: 1, justifyContent: 'center', padding: 16 }}
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </>
          )}

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
