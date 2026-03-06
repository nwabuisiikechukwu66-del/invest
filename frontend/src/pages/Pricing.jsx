import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal } from '@hooks/useReveal';
import PageHeader from '@components/PageHeader';

const PLANS = [
  {
    name: 'Account',
    price: '0%',
    sub: 'Signup & account fee',
    desc: 'Getting started on RealtyInvestors is completely free. No credit card required.',
    featured: false,
    features: ['Free account creation', 'Browse all properties', 'Full property documentation', 'KYC verification included', 'Dashboard access'],
    cta: 'Create Free Account', ctaKey: '/signup',
  },
  {
    name: 'Management Fee',
    price: '2%',
    sub: 'Annual on invested capital',
    desc: 'Covers property management, legal compliance, reporting, and platform operations.',
    featured: true,
    features: ['Professional property management', 'Full regulatory compliance', 'Monthly income distribution', 'Real-time portfolio tracking', 'Investor support team'],
    cta: 'Start Investing', ctaKey: '/investments',
  },
  {
    name: 'Performance Fee',
    price: '10%',
    sub: 'On profits above projections',
    desc: 'Only charged on returns that exceed our projected figures. We earn more only when you earn more.',
    featured: false,
    features: ['Only on outperformance', 'Aligned incentives', 'Full transparency', 'Detailed fee reporting', 'No minimum threshold'],
    cta: 'Learn More', ctaKey: '/how-it-works',
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  useReveal();

  return (
    <>
      <PageHeader
        tag="Transparent Fees"
        title="Simple, Honest Pricing"
        subtitle="No hidden charges. We earn when you earn — our success is aligned with yours."
      />
      <section className="section">
        <div className="container">
          <div className="pricing-grid reveal">
            {PLANS.map((plan, i) => (
              <div key={i} className={`pricing-card${plan.featured ? ' featured' : ''}`}>
                <div style={{ marginBottom: 32 }}>
                  <div className="label-md" style={{ color: plan.featured ? 'var(--gold)' : 'var(--gray)', marginBottom: 8 }}>{plan.name}</div>
                  <div className="pricing-price" style={{ color: plan.featured ? 'var(--ivory)' : 'var(--black)' }}>{plan.price}</div>
                  <div style={{ fontSize: 13, color: plan.featured ? 'rgba(248,246,241,0.5)' : 'var(--gray)', marginBottom: 20 }}>{plan.sub}</div>
                  <p style={{ fontSize: 14, color: plan.featured ? 'rgba(248,246,241,0.6)' : 'var(--gray)', lineHeight: 1.7 }}>{plan.desc}</p>
                </div>
                <div style={{ borderTop: `1px solid ${plan.featured ? 'rgba(255,255,255,0.08)' : 'var(--border-subtle)'}`, paddingTop: 24, marginBottom: 32 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} className="pricing-feature" style={{ borderColor: plan.featured ? 'rgba(255,255,255,0.06)' : 'var(--border-subtle)', color: plan.featured ? 'rgba(248,246,241,0.7)' : 'var(--charcoal)' }}>
                      <div className="check-mark">✓</div>
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  className={`btn ${plan.featured ? 'btn-gold' : 'btn-outline-dark'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate(plan.ctaKey)}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 60, padding: 40, background: 'var(--ivory-dark)' }}>
            <h3 className="display display-sm" style={{ marginBottom: 16 }}>Complete Fee Transparency</h3>
            <p className="body-md" style={{ color: 'var(--gray)', maxWidth: 600, margin: '0 auto' }}>
              Before you invest in any property, we provide a full fee breakdown specific to that
              investment. You will see exactly what you pay, when you pay it, and why. No surprises, ever.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
