import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fmtCurrency, pct } from '@utils/format';

export default function PropertyCard({ prop }) {
  const navigate  = useNavigate();
  const progress  = pct(prop.raised, prop.target);
  const isClosing = prop.status === 'closing';

  return (
    <div className="prop-card" onClick={() => navigate(`/property/${prop.id}`)}>
      <div className="prop-img">
        <img src={prop.image} alt={prop.name} loading="lazy" />
        <div className={`prop-badge${isClosing ? ' prop-badge-closing' : ''}`}>
          {isClosing ? 'Closing Soon' : 'Open'}
        </div>
      </div>

      <div className="prop-body">
        <div className="prop-type">{prop.type}</div>
        <div className="prop-name">{prop.name}</div>
        <div className="prop-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {prop.location}
        </div>

        <div className="prop-stats">
          <div>
            <div className="prop-stat-label">Expected ROI</div>
            <div className="prop-stat-val gold">{prop.roi}%</div>
          </div>
          <div>
            <div className="prop-stat-label">Min. Investment</div>
            <div className="prop-stat-val">{fmtCurrency(prop.minInvestment)}</div>
          </div>
        </div>

        <div className="prop-progress">
          <div className="prop-progress-labels">
            <span className="body-sm" style={{ color: 'var(--gray)' }}>
              Funded:{' '}
              <strong style={{ color: 'var(--black)' }}>{fmtCurrency(prop.raised)}</strong>
            </span>
            <span className="body-sm" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>
              {progress}%
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ marginTop: 6 }}>
            <span className="body-sm" style={{ color: 'var(--gray-light)' }}>
              Target: {fmtCurrency(prop.target)}
            </span>
          </div>
        </div>

        <div className="prop-footer">
          <span className="body-sm" style={{ color: 'var(--gray)' }}>{prop.duration}</span>
          <button className="btn btn-dark btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/property/${prop.id}`); }}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
