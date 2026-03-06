import React from 'react';

export default function PageHeader({ tag, title, subtitle }) {
  return (
    <div className="page-header">
      <div className="container">
        {tag && (
          <div style={{ marginBottom: 20 }}>
            <div className="section-tag">
              <div className="section-tag-line" />
              <span className="section-tag-text">{tag}</span>
            </div>
          </div>
        )}
        <h1 className="display display-lg" style={{ color: 'var(--ivory)' }}>{title}</h1>
        {subtitle && (
          <p className="body-lg" style={{ color: 'rgba(248,246,241,0.6)', marginTop: 16 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
