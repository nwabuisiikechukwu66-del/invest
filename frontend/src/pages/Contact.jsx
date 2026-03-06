import React, { useState } from 'react';
import { useReveal } from '@hooks/useReveal';
import { useApp } from '@context/AppContext';
import PageHeader from '@components/PageHeader';

export default function Contact() {
  const { addNotification } = useApp();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  useReveal();

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      addNotification('Please fill in all required fields.');
      return;
    }
    addNotification('Message sent. We will respond within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <PageHeader
        tag="Get In Touch"
        title="Contact Us"
        subtitle="Our investor relations team is available Monday through Friday, 9am–6pm GMT."
      />

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="reveal">
              <h3 className="display display-sm" style={{ marginBottom: 40 }}>Send a Message</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-input" type="text" placeholder="How can we help?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-input" rows={6} placeholder="Write your message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button className="btn btn-gold btn-lg" onClick={handleSubmit}>Send Message</button>
            </div>

            <div className="reveal">
              <h3 className="display display-sm" style={{ marginBottom: 40 }}>Contact Information</h3>
              {[
                { icon: '◎', label: 'Email',   val: 'investors@realtyinvestors.com', sub: 'For general inquiries' },
                { icon: '◉', label: 'Support', val: 'support@realtyinvestors.com',   sub: 'Technical & account support' },
                { icon: '◈', label: 'Phone',   val: '+44 20 7946 0123',              sub: 'Mon–Fri, 9am–6pm GMT' },
                { icon: '◬', label: 'Office',  val: '30 St Mary Axe, London EC3A 8EP', sub: 'United Kingdom' },
              ].map((c, i) => (
                <div key={i} className="contact-info-item">
                  <div className="contact-icon">
                    <span style={{ color: 'var(--gold)', fontSize: 18 }}>{c.icon}</span>
                  </div>
                  <div>
                    <div className="contact-detail-label">{c.label}</div>
                    <div className="contact-detail-val">{c.val}</div>
                    <div className="contact-detail-sub">{c.sub}</div>
                  </div>
                </div>
              ))}

              <div style={{ padding: 32, background: 'var(--black)', marginTop: 16 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ivory)', fontWeight: 300, lineHeight: 1.6, marginBottom: 16 }}>
                  "Our investor relations team responds to all inquiries within one business day."
                </p>
                <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Investor Relations Team
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
