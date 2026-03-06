import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal } from '@hooks/useReveal';
import SectionHeader from '@components/SectionHeader';
import PropertyCard from '@components/PropertyCard';
import { PROPERTIES, TESTIMONIALS, FAQS, PARTNERS, HERO_IMAGES } from '@data/constants';

export default function Home() {
  const navigate   = useNavigate();
  const [heroIdx, setHeroIdx]   = useState(0);
  const [openFaq, setOpenFaq]   = useState(null);
  useReveal();

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`hero-slide${heroIdx === i ? ' active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="hero-overlay" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-tag">
              <div className="hero-tag-dot" />
              <span>Global Real Estate Platform</span>
            </div>
            <h1 className="display display-xl hero-title">
              Invest in Real<br />Estate from<br />Anywhere.
            </h1>
            <p className="body-lg hero-sub">
              Build wealth through fractional real estate investments. Start with as little as $100
              and earn from rental income and property appreciation.
            </p>
            <div className="hero-actions">
              <button className="btn btn-gold btn-lg" onClick={() => navigate('/signup')}>
                Start Investing
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/investments')}>
                View Properties
              </button>
            </div>
            <div className="hero-trust">
              {['Secure Platform', 'Verified Properties', 'Global Investors', 'Regulated Entity'].map((t, i) => (
                <div key={i} className="hero-trust-item">
                  <div className="hero-trust-dot" />
                  <span className="hero-trust-text">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-dots">
          {HERO_IMAGES.map((_, i) => (
            <div
              key={i}
              className={`hero-dot${heroIdx === i ? ' active' : ''}`}
              onClick={() => setHeroIdx(i)}
            />
          ))}
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { num: '$50M+',  label: 'Total Invested' },
              { num: '10,000+', label: 'Global Investors' },
              { num: '120+',   label: 'Properties Funded' },
              { num: '12.4%',  label: 'Average Annual ROI' },
            ].map((s, i) => (
              <div key={i} className="stat-item reveal">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ─────────────────────────────────────────────────────── */}
      <section className="partners-section">
        <p className="partners-label">Trusted by partners worldwide</p>
        <div style={{ overflow: 'hidden' }}>
          <div className="partners-track">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <span key={i} className="partner-item">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionHeader
            tag="Process"
            title="How It Works"
            subtitle="Investing in global real estate has never been simpler. Follow four straightforward steps to start building your property portfolio."
            center
          />
          <div className="steps-grid">
            {[
              { n: '01', t: 'Create Account', d: 'Sign up in minutes and complete our streamlined identity verification to protect your investment.' },
              { n: '02', t: 'Browse Properties', d: 'Explore our curated marketplace of verified real estate opportunities across global markets.' },
              { n: '03', t: 'Invest', d: 'Choose your investment amount, starting from $100. Diversify across multiple properties and geographies.' },
              { n: '04', t: 'Earn Returns', d: 'Receive monthly rental income distributions and benefit from property appreciation over time.' },
            ].map((s, i) => (
              <div key={i} className="step-item reveal">
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.t}</div>
                <div className="step-text">{s.d}</div>
                {i < 3 && <div className="step-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ──────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--ivory-dark)', paddingTop: 80 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <SectionHeader
              tag="Marketplace"
              title="Featured Properties"
              subtitle="Hand-selected investment opportunities, each thoroughly verified and independently valued."
            />
            <button className="btn btn-outline-dark" onClick={() => navigate('/investments')}>
              View All
            </button>
          </div>
          <div className="properties-grid">
            {PROPERTIES.slice(0, 3).map((p) => (
              <div key={p.id} className="reveal">
                <PropertyCard prop={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY REALTYINVESTORS ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionHeader
            tag="Advantages"
            title="Why RealtyInvestors"
            subtitle="We built the platform that institutional investors have used for decades — and opened it to everyone."
            center
          />
          <div className="why-grid">
            {[
              { icon: '◈', t: 'Low Minimum Investment', d: 'Start investing in premium global real estate from just $100. No large capital or bank financing required.' },
              { icon: '◉', t: 'Diversified Portfolio',  d: 'Spread risk across multiple properties, locations, and property types with a single platform.' },
              { icon: '◎', t: 'Transparent Returns',    d: 'Track earnings in real time. Full visibility into rental income, appreciation, and all associated fees.' },
              { icon: '◬', t: 'Global Access',          d: 'Invest in premium properties across 30+ countries from anywhere in the world.' },
            ].map((w, i) => (
              <div key={i} className="why-item reveal">
                <div className="why-icon" style={{ fontSize: 22, color: 'var(--gold)' }}>{w.icon}</div>
                <div className="why-title">{w.t}</div>
                <div className="why-text">{w.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERFORMANCE ──────────────────────────────────────────────────── */}
      <section className="section perf-section">
        <div className="container">
          <div className="perf-grid">
            <div className="reveal">
              <div className="section-tag">
                <div className="section-tag-line" />
                <span className="section-tag-text" style={{ color: 'var(--gold)' }}>Performance</span>
                <div className="section-tag-line" />
              </div>
              <h2 className="display display-md" style={{ color: 'var(--ivory)', marginBottom: 20 }}>
                Returns That<br />Outperform
              </h2>
              <p className="body-md" style={{ color: 'rgba(248,246,241,0.6)', marginBottom: 40, lineHeight: 1.8 }}>
                Real estate has historically delivered superior risk-adjusted returns compared to
                traditional asset classes. Our platform gives you access to institutional-grade
                properties with professional management.
              </p>
              <button className="btn btn-gold" onClick={() => navigate('/investments')}>
                Explore Opportunities
              </button>
            </div>
            <div className="perf-bar-wrap reveal">
              {[
                { label: 'RealtyInvestors Properties', val: '12.4%', pct: 82, cls: 'perf-fill-gold' },
                { label: 'Global Real Estate Index',   val: '8.1%',  pct: 54, cls: 'perf-fill-gray' },
                { label: 'S&P 500 (10-year avg)',      val: '7.8%',  pct: 52, cls: 'perf-fill-gray' },
                { label: 'High-Yield Savings',         val: '2.1%',  pct: 14, cls: 'perf-fill-dim'  },
              ].map((b, i) => (
                <div key={i} className="perf-bar-row">
                  <div className="perf-bar-header">
                    <span className="perf-bar-label">{b.label}</span>
                    <span className="perf-bar-val">{b.val}</span>
                  </div>
                  <div className="perf-track">
                    <div className={`perf-fill ${b.cls}`} style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 11, color: 'rgba(248,246,241,0.3)', marginTop: 16 }}>
                Past performance is not indicative of future results. Investing involves risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="section testi-section">
        <div className="container">
          <SectionHeader tag="Investors" title="What Our Investors Say" center />
          <div className="testi-grid">
            {TESTIMONIALS.slice(0, 3).map((t) => (
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

      {/* ── FAQ PREVIEW ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <SectionHeader tag="FAQ" title="Common Questions" center />
          <div>
            {FAQS.slice(0, 4).map((f, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button className="btn btn-outline-dark" onClick={() => navigate('/faq')}>
              View All FAQs
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="section cta-section">
        <div
          className="cta-bg"
          style={{ backgroundImage: `url(${HERO_IMAGES[0]})` }}
        />
        <div className="container">
          <div className="cta-content">
            <div className="section-tag" style={{ justifyContent: 'center', marginBottom: 24 }}>
              <div className="section-tag-line" />
              <span className="section-tag-text" style={{ color: 'var(--gold)' }}>Get Started Today</span>
              <div className="section-tag-line" />
            </div>
            <h2 className="display display-lg" style={{ color: 'var(--ivory)', marginBottom: 20 }}>
              Start Building Wealth with Real Estate
            </h2>
            <p className="body-md" style={{ color: 'rgba(248,246,241,0.6)', marginBottom: 24 }}>
              Join over 10,000 investors already building their property portfolios on
              RealtyInvestors. Create your free account in minutes.
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 16, 
              marginBottom: 32,
              flexWrap: 'wrap'
            }}>
              <button className="btn btn-gold btn-lg" onClick={() => navigate('/signup')}>
                Create Free Account
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/contact')}>
                Chat with Support
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(248,246,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>◎</span>
              Our support team is available 24/7 to help you get started
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
