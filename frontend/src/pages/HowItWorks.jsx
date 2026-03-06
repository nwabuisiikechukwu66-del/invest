import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal } from '@hooks/useReveal';
import PageHeader from '@components/PageHeader';
import SectionHeader from '@components/SectionHeader';

const STEPS = [
  {
    n: '01', t: 'Create Your Account', sub: 'Sign up in under 3 minutes',
    img: 'https://images.unsplash.com/photo-1555421689-3f034debb7a6?w=700&q=80',
    d: 'Creating an account is completely free and takes less than three minutes. Provide your basic information, verify your email address, and you are ready to explore available properties. Full investing capability requires identity verification (KYC), which protects both you and other investors on the platform.',
    points: ['Free to create an account', 'Email verification required', 'KYC verification for investing', 'Secure data encryption'],
  },
  {
    n: '02', t: 'Browse & Research Properties', sub: 'Explore verified investment opportunities',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80',
    d: 'Browse our curated marketplace of investment properties. Each listing includes comprehensive information: independent valuations, legal documentation, financial projections, building inspection reports, and market analysis.',
    points: ['Independent property valuations', 'Full legal documentation', 'Financial projections', 'Market analysis reports'],
  },
  {
    n: '03', t: 'Invest Your Chosen Amount', sub: 'Start from just $100',
    img: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=700&q=80',
    d: 'Select a property and choose how much you wish to invest, starting from the listed minimum (as low as $100). You can invest in multiple properties to diversify your portfolio. Funds are held in a regulated escrow account until the property reaches its funding target.',
    points: ['Minimum from $100', 'Bank transfer accepted', 'Crypto payment (optional)', 'Escrow protection'],
  },
  {
    n: '04', t: 'Earn and Grow', sub: 'Receive income and watch your portfolio grow',
    img: 'https://images.unsplash.com/photo-1611348586840-ea9872d33411?w=700&q=80',
    d: 'Once funded and operational, properties begin generating rental income distributed to investors monthly or quarterly, proportionate to your ownership stake. You also benefit from property appreciation. Track everything in real time through your investor dashboard.',
    points: ['Monthly/quarterly income', 'Real-time portfolio tracking', 'Property appreciation gains', 'Withdrawal at any time'],
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  useReveal();

  return (
    <>
      <PageHeader
        tag="Process"
        title="How It Works"
        subtitle="Everything you need to know about investing through RealtyInvestors."
      />

      <section className="section">
        <div className="container">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="reveal"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginBottom: 100, alignItems: 'center' }}
            >
              <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
                <div className="section-tag" style={{ marginBottom: 20 }}>
                  <div className="section-tag-line" />
                  <span className="section-tag-text">Step {step.n}</span>
                </div>
                <h2 className="display display-md" style={{ marginBottom: 8 }}>{step.t}</h2>
                <p style={{ color: 'var(--gold-dark)', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>{step.sub}</p>
                <p className="body-md" style={{ color: 'var(--gray)', marginBottom: 32 }}>{step.d}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {step.points.map((pt, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 20, height: 20, background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 800 }}>✓</span>
                      </div>
                      <span style={{ fontSize: 14, color: 'var(--charcoal)' }}>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ order: i % 2 === 0 ? 2 : 1, overflow: 'hidden' }}>
                <img src={step.img} alt={step.t} style={{ width: '100%', height: 380, objectFit: 'cover' }} loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ background: 'var(--ivory-dark)' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <SectionHeader
            tag="Verification"
            title="Identity Verification (KYC)"
            subtitle="We are required by law to verify the identity of all investors. This process protects the platform and every investor on it."
            center
          />
          <div className="kyc-steps">
            {['Personal Info', 'Document Upload', 'Selfie Check', 'Approved'].map((s, i) => (
              <div key={i} className={`kyc-step${i === 3 ? ' done' : i === 0 ? ' active' : ''}`}>
                <div className="kyc-step-num">{i + 1}</div>
                <div className="kyc-step-label">{s}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-gold btn-lg" onClick={() => navigate('/signup')}>
              Begin Verification
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
