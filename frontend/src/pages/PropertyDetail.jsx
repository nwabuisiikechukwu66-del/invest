import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@context/AppContext';
import { PROPERTIES } from '@data/constants';
import { fmtCurrency, fmt, pct } from '@utils/format';

export default function PropertyDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user, addNotification } = useApp();
  const prop         = PROPERTIES.find((p) => p.id === Number(id));
  const [amount, setAmount] = useState(prop?.minInvestment || 100);

  if (!prop) {
    return (
      <div className="page-loading" style={{ paddingTop: 'var(--nav-h)' }}>
        <div style={{ textAlign: 'center' }}>
          <p className="body-lg" style={{ marginBottom: 24 }}>Property not found.</p>
          <button className="btn btn-dark" onClick={() => navigate('/investments')}>
            Back to Investments
          </button>
        </div>
      </div>
    );
  }

  const progress = pct(prop.raised, prop.target);

  const handleInvest = () => {
    if (!user) { navigate('/signup'); return; }
    if (amount < prop.minInvestment) {
      addNotification(`Minimum investment is ${fmtCurrency(prop.minInvestment)}`);
      return;
    }
    addNotification(`Investment of ${fmtCurrency(amount)} submitted for ${prop.name}`);
  };

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 'var(--nav-h)', background: 'var(--black)' }}>
        <div className="container" style={{ padding: '40px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <Link
              to="/investments"
              style={{ background: 'none', border: 'none', color: 'rgba(248,246,241,0.5)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ← Investments
            </Link>
            <span style={{ color: 'rgba(248,246,241,0.3)' }}>/</span>
            <span style={{ color: 'var(--gold)', fontSize: 13 }}>{prop.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span
              className={`prop-badge${prop.status === 'closing' ? ' prop-badge-closing' : ''}`}
              style={{ position: 'static' }}
            >
              {prop.status === 'closing' ? 'Closing Soon' : 'Open'}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(248,246,241,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {prop.type}
            </span>
          </div>
        </div>
      </div>

      <section style={{ padding: '48px 0 100px' }}>
        <div className="container">
          <div className="prop-detail-grid">
            {/* ── Left Column ──────────────────────────────────────────── */}
            <div>
              <div className="prop-detail-img" style={{ marginBottom: 40 }}>
                <img src={prop.image} alt={prop.name} />
              </div>

              <h1 className="display display-md" style={{ marginBottom: 8 }}>{prop.name}</h1>
              <p style={{ fontSize: 15, color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {prop.location}
              </p>

              {/* Property Overview */}
              <div style={{ marginBottom: 48 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Property Overview</h3>
                <p className="body-md" style={{ color: 'var(--gray)', lineHeight: 1.8 }}>{prop.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginTop: 32, background: 'var(--ivory-dark)', padding: 24 }}>
                  {[
                    { l: 'Year Built',   v: prop.yearBuilt },
                    { l: 'Square Feet',  v: fmt(prop.sqft) },
                    { l: 'Total Units',  v: prop.bedrooms || 'N/A' },
                  ].map((d, i) => (
                    <div key={i}>
                      <div className="prop-stat-label">{d.l}</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--black)', marginTop: 4 }}>{d.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Projections */}
              <div style={{ marginBottom: 48 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Financial Projections</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  {[
                    { l: 'Expected Annual ROI', v: `${prop.roi}%`,        highlight: true },
                    { l: 'Rental Yield',         v: `${prop.rentalYield}%` },
                    { l: 'Investment Duration',  v: prop.duration },
                  ].map((s, i) => (
                    <div key={i} style={{ background: s.highlight ? 'var(--black)' : 'var(--ivory-dark)', padding: 24 }}>
                      <div className="prop-stat-label" style={{ color: s.highlight ? 'rgba(248,246,241,0.4)' : 'var(--gray-light)' }}>{s.l}</div>
                      <div style={{ fontSize: 28, fontWeight: 600, color: s.highlight ? 'var(--gold)' : 'var(--black)', marginTop: 8 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Documents</h3>
                <div className="doc-list">
                  {prop.documents.map((doc, i) => (
                    <div key={i} className="doc-item">
                      <div className="doc-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div>
                        <div className="doc-name">{doc}</div>
                        <div className="doc-size">PDF — Available after signup</div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gold-dark)', fontWeight: 600 }}>Download</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right Column — Investment Panel ───────────────────────── */}
            <div>
              <div className="prop-panel">
                <div className="prop-panel-roi">
                  <div className="prop-panel-roi-num">{prop.roi}%</div>
                  <div className="prop-panel-roi-label">Expected Annual Return</div>
                </div>

                <div className="prop-info-grid">
                  {[
                    { l: 'Minimum', v: fmtCurrency(prop.minInvestment) },
                    { l: 'Duration', v: prop.duration },
                    { l: 'Target',  v: fmtCurrency(prop.target) },
                    { l: 'Raised',  v: fmtCurrency(prop.raised) },
                  ].map((d, i) => (
                    <div key={i} className="prop-info-item">
                      <div className="prop-stat-label">{d.l}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--black)', marginTop: 4 }}>{d.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div className="prop-progress-labels" style={{ marginBottom: 8 }}>
                    <span className="body-sm" style={{ fontWeight: 600 }}>{progress}% Funded</span>
                    <span className="body-sm" style={{ color: 'var(--gray)' }}>
                      {fmtCurrency(prop.target - prop.raised)} remaining
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: 8 }}>
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div className="form-label">Your Investment Amount ($)</div>
                  <input
                    type="number"
                    className="invest-input"
                    value={amount}
                    min={prop.minInvestment}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>

                {amount >= prop.minInvestment && (
                  <div style={{ background: 'var(--ivory-dark)', padding: 16, marginBottom: 20, fontSize: 13, color: 'var(--gray)' }}>
                    Estimated annual return:{' '}
                    <strong style={{ color: 'var(--gold-dark)' }}>
                      {fmtCurrency(Math.round(amount * prop.roi / 100))}
                    </strong>
                  </div>
                )}

                <button
                  className="btn btn-gold"
                  style={{ width: '100%', justifyContent: 'center', padding: 16 }}
                  onClick={handleInvest}
                >
                  {user ? 'Invest Now' : 'Sign Up to Invest'}
                </button>

                <p style={{ fontSize: 11, color: 'var(--gray-light)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
                  Investing involves risk. Returns are projections, not guarantees.
                  Read all documents before investing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
