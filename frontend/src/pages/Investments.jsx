import React, { useState } from 'react';
import { useReveal } from '@hooks/useReveal';
import PageHeader from '@components/PageHeader';
import PropertyCard from '@components/PropertyCard';
import { PROPERTIES } from '@data/constants';

export default function Investments() {
  const [filter, setFilter] = useState({ type: '', roi: '', stage: '' });
  useReveal();

  const filtered = PROPERTIES.filter((p) => {
    if (filter.roi === 'high' && p.roi < 15) return false;
    if (filter.roi === 'mid' && (p.roi < 12 || p.roi >= 15)) return false;
    if (filter.roi === 'low' && p.roi >= 12) return false;
    if (filter.stage && p.status !== filter.stage) return false;
    if (filter.type && !p.type.toLowerCase().includes(filter.type.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        tag="Marketplace"
        title="Investment Opportunities"
        subtitle="Browse verified properties across global markets. Each opportunity is independently valued and legally structured."
      />

      <section className="section">
        <div className="container">
          <div className="filters-bar">
            <select
              className="filter-select"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Property Types</option>
              <option value="Apartment">Apartments</option>
              <option value="Commercial">Commercial</option>
              <option value="Villa">Villas</option>
              <option value="Hotel">Hotel Residences</option>
              <option value="Office">Office</option>
              <option value="Residential">Residential</option>
            </select>

            <select
              className="filter-select"
              value={filter.roi}
              onChange={(e) => setFilter({ ...filter, roi: e.target.value })}
            >
              <option value="">All ROI Ranges</option>
              <option value="high">High (&gt;15%)</option>
              <option value="mid">Mid (12%–15%)</option>
              <option value="low">Conservative (&lt;12%)</option>
            </select>

            <select
              className="filter-select"
              value={filter.stage}
              onChange={(e) => setFilter({ ...filter, stage: e.target.value })}
            >
              <option value="">All Funding Stages</option>
              <option value="active">Open</option>
              <option value="closing">Closing Soon</option>
            </select>

            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => setFilter({ type: '', roi: '', stage: '' })}
            >
              Clear Filters
            </button>
          </div>

          <p className="body-sm" style={{ color: 'var(--gray)', marginBottom: 32 }}>
            Showing {filtered.length} of {PROPERTIES.length} properties
          </p>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray)' }}>
              <p className="body-lg">No properties match your current filters.</p>
            </div>
          ) : (
            <div className="properties-grid">
              {filtered.map((p) => (
                <div key={p.id} className="reveal">
                  <PropertyCard prop={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
