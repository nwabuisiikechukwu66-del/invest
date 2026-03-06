import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal } from '@hooks/useReveal';
import PageHeader from '@components/PageHeader';
import SectionHeader from '@components/SectionHeader';
import { TESTIMONIALS, TEAM } from '@data/constants';

export default function About() {
  const navigate = useNavigate();
  useReveal();

  return (
    <>
      <PageHeader
        tag="Our Story"
        title="About RealtyInvestors"
        subtitle="We are on a mission to democratize access to global real estate, giving every investor the tools that were once reserved for the ultra-wealthy."
      />

      <section className="section">
        <div className="container">
          <div className="about-grid reveal">
            <div>
              <SectionHeader tag="Mission" title="Real Estate for Everyone" />
              <p className="body-md" style={{ color: 'var(--gray)', marginBottom: 24, lineHeight: 1.8 }}>
                Founded in 2021, RealtyInvestors was built on a simple observation: the world's most
                reliable wealth-building asset — real estate — was effectively inaccessible to anyone
                without significant capital or the right connections.
              </p>
              <p className="body-md" style={{ color: 'var(--gray)', marginBottom: 24, lineHeight: 1.8 }}>
                We changed that. Through fractional ownership, our platform allows investors from over
                80 countries to invest in premium properties across the globe, starting with as little
                as $100.
              </p>
              <p className="body-md" style={{ color: 'var(--gray)', marginBottom: 40, lineHeight: 1.8 }}>
                Every property on our platform goes through rigorous due diligence: independent valuation,
                legal structuring, building inspection, and financial modeling. We list only what we
                would personally invest in ourselves.
              </p>
              <button className="btn btn-dark" onClick={() => navigate('/investments')}>
                View Properties
              </button>
            </div>
            <div className="about-img">
              <img
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=700&q=80"
                alt="About RealtyInvestors"
              />
              <div className="about-img-accent">
                <div className="about-img-accent-num">5</div>
                <div className="about-img-accent-text">Years of<br />Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--black)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40, textAlign: 'center' }}>
            {[
              { n: '80+',    l: 'Countries Served' },
              { n: '$50M+',  l: 'Total Invested' },
              { n: '120+',   l: 'Properties Funded' },
              { n: '10,000+', l: 'Active Investors' },
            ].map((s, i) => (
              <div key={i} className="reveal">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 300, color: 'var(--gold)', lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'rgba(248,246,241,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader tag="Leadership" title="Our Team" center />
          <div className="team-grid">
            {TEAM.map((m, i) => (
              <div key={i} className="team-card reveal">
                <img src={m.img} alt={m.name} className="team-img" />
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section testi-section">
        <div className="container">
          <SectionHeader tag="Investors" title="More Investor Stories" center />
          <div className="testi-grid">
            {TESTIMONIALS.slice(2, 5).map((t) => (
              <div key={t.id} className="testi-card reveal">
                <p className="testi-text">"{t.text}"</p>
                <div className="testi-author">
                  <img src={t.avatar} alt={t.name} className="testi-avatar" />
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                  <div className="testi-return">
                    <div className="testi-return-val">{t.return}</div>
                    <div className="testi-return-label">Return</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
