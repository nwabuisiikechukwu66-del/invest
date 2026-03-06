import React, { useState } from 'react';
import { useReveal } from '@hooks/useReveal';
import PageHeader from '@components/PageHeader';
import { FAQS } from '@data/constants';

export default function FAQ() {
  const [open, setOpen] = useState(null);
  useReveal();

  return (
    <>
      <PageHeader
        tag="Help"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about investing on RealtyInvestors."
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          {FAQS.map((f, i) => (
            <div key={i} className="faq-item reveal">
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
                <span className="faq-icon">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
