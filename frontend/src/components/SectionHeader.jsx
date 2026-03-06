import React from 'react';

export default function SectionHeader({ tag, title, subtitle, center = false, light = false }) {
  return (
    <div className={`section-header${center ? ' section-header-center' : ''}`}>
      {tag && (
        <div className="section-tag" style={center ? { justifyContent: 'center' } : {}}>
          <div className="section-tag-line" />
          <span className="section-tag-text" style={light ? { color: 'var(--gold)' } : {}}>
            {tag}
          </span>
          <div className="section-tag-line" />
        </div>
      )}
      <h2
        className="display display-md"
        style={{ marginBottom: subtitle ? 16 : 0, color: light ? 'var(--ivory)' : undefined }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="body-md"
          style={{
            color: light ? 'rgba(248,246,241,0.6)' : 'var(--gray)',
            maxWidth: center ? 560 : '100%',
            margin: center ? '0 auto' : 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
