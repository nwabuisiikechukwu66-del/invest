import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@context/AppContext';
import { fmtCurrency } from '@utils/format';
import { PROPERTIES, MOCK_TRANSACTIONS, MOCK_EARNINGS } from '@data/constants';

const NAV_ITEMS = [
  { key: 'portfolio',     label: 'Portfolio',       icon: '▦' },
  { key: 'investments',   label: 'My Investments',  icon: '◈' },
  { key: 'earnings',      label: 'Earnings',         icon: '◉' },
  { key: 'transactions',  label: 'Transactions',    icon: '≡' },
  { key: 'withdraw',      label: 'Withdraw Funds',  icon: '↑' },
  { key: 'chat',          label: 'Support Chat',    icon: '◎' },
  { key: 'account',       label: 'Account',         icon: '◬' },
];

const DEMO_INVESTMENTS = PROPERTIES.slice(0, 3);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, addNotification, logoutDemo } = useApp();
  const [tab, setTab]               = useState('portfolio');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [chatInput, setChatInput]   = useState('');
  const [messages, setMessages]     = useState([
    { from: 'support', text: 'Hello! Welcome to RealtyInvestors. How can I assist you today?' },
    { from: 'support', text: 'You can ask about your investments, withdrawals, or anything else.' },
  ]);

  // Check if user is admin
  const isAdmin = profile?.is_admin === true;

  if (!user) {
    return (
      <div className="page-loading" style={{ paddingTop: 'var(--nav-h)' }}>
        <div style={{ textAlign: 'center' }}>
          <p className="body-md" style={{ color: 'var(--gray)', marginBottom: 24 }}>
            Please sign in to access your dashboard.
          </p>
          <button className="btn btn-gold" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Investor';
  const initial     = displayName[0].toUpperCase();

  const demoData = {
    invested: 22500,
    earnings: 2890,
    roi: 12.8,
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setMessages((m) => [...m, { from: 'user', text: msg }]);
    setChatInput('');
    const responses = [
      'Thank you for your message. Our team will review your inquiry and respond within 24 hours.',
      'I can see your account is in good standing. Is there anything specific about your investments you would like to know?',
      'For withdrawal requests, please use the Withdraw Funds tab. Funds are processed within 3–5 business days.',
    ];
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'support', text: responses[Math.floor(Math.random() * responses.length)] }]);
    }, 1200);
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmt);
    if (!amt || amt <= 0) { addNotification('Please enter a valid withdrawal amount.'); return; }
    if (amt > demoData.earnings) { addNotification('Insufficient earnings balance.'); return; }
    addNotification(`Withdrawal of ${fmtCurrency(amt)} initiated. Processing in 3–5 business days.`);
    setWithdrawAmt('');
  };

  return (
    <div className="dash-layout">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="dash-sidebar">
        <div className="dash-user">
          <div className="dash-avatar">{initial}</div>
          <div className="dash-user-name">{displayName}</div>
          <div className="dash-user-level">Verified Investor</div>
        </div>

        {NAV_ITEMS.map((item) => (
          <div
            key={item.key}
            className={`dash-nav-item${tab === item.key ? ' active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        {/* Admin Link - only shows for admins */}
        {isAdmin && (
          <div
            className="dash-nav-item"
            onClick={() => navigate('/admin')}
            style={{ background: 'var(--gold)', color: 'var(--black)', marginTop: 8 }}
          >
            <span style={{ fontSize: 14 }}>⚙</span>
            Admin Panel
          </div>
        )}

        <div style={{ padding: '24px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            className="btn btn-gold btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/investments')}
          >
            Browse Properties
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="dash-main">

        {/* PORTFOLIO */}
        {tab === 'portfolio' && (
          <div>
            <div className="dash-header">
              <div className="section-tag" style={{ marginBottom: 8 }}>
                <div className="section-tag-line" />
                <span className="section-tag-text">Overview</span>
              </div>
              <h2 className="display display-sm">Welcome back, {displayName.split(' ')[0]}.</h2>
            </div>
            <div className="dash-cards">
              {[
                { label: 'Total Invested',      val: fmtCurrency(demoData.invested), change: '+2 properties', gold: false },
                { label: 'Total Earnings',       val: fmtCurrency(demoData.earnings), change: '+$312 this month', gold: true },
                { label: 'Active Investments',   val: '3',                           change: 'Properties',       gold: false },
                { label: 'Portfolio ROI',        val: `${demoData.roi}%`,            change: 'Annualized',       gold: true },
              ].map((c, i) => (
                <div key={i} className="dash-card">
                  <div className="dash-card-label">{c.label}</div>
                  <div className={`dash-card-val${c.gold ? ' gold' : ''}`}>{c.val}</div>
                  <div className="dash-card-change">{c.change}</div>
                </div>
              ))}
            </div>

            <div className="dash-section-title">Quick Actions</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={() => navigate('/investments')}>Invest in Property</button>
              <button className="btn btn-outline-dark" onClick={() => setTab('withdraw')}>Withdraw Earnings</button>
              <button className="btn btn-outline-dark" onClick={() => setTab('chat')}>Contact Support</button>
            </div>

            <div className="dash-section-title">Recent Activity</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th><th>Type</th><th>Description</th><th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.slice(0, 3).map((tx, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--gray)' }}>{tx.date}</td>
                    <td><span className={`tx-badge tx-badge-${tx.badge}`}>{tx.type}</span></td>
                    <td>{tx.desc}</td>
                    <td style={{ fontWeight: 600 }}>{tx.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MY INVESTMENTS */}
        {tab === 'investments' && (
          <div>
            <div className="dash-header">
              <h2 className="display display-sm">My Investments</h2>
              <p className="body-sm" style={{ color: 'var(--gray)', marginTop: 8 }}>Properties currently in your portfolio.</p>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Property</th><th>Location</th><th>Invested</th><th>ROI</th><th>Earnings</th><th>Status</th></tr>
              </thead>
              <tbody>
                {DEMO_INVESTMENTS.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ color: 'var(--gray)' }}>{p.location}</td>
                    <td style={{ fontWeight: 600 }}>{fmtCurrency(3000 + i * 2500)}</td>
                    <td style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>{p.roi}%</td>
                    <td style={{ color: '#2E7D32', fontWeight: 600 }}>+{fmtCurrency(120 + i * 80)}</td>
                    <td><span className="tx-badge tx-badge-in">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EARNINGS */}
        {tab === 'earnings' && (
          <div>
            <div className="dash-header">
              <h2 className="display display-sm">Earnings</h2>
              <p className="body-sm" style={{ color: 'var(--gray)', marginTop: 8 }}>Your rental income and appreciation gains.</p>
            </div>
            <div className="dash-cards" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 40 }}>
              {[
                { label: 'Total Earnings', val: fmtCurrency(demoData.earnings), gold: true },
                { label: 'This Month',     val: '$312',  gold: false },
                { label: 'Pending Payout', val: '$894',  gold: false },
              ].map((c, i) => (
                <div key={i} className="dash-card">
                  <div className="dash-card-label">{c.label}</div>
                  <div className={`dash-card-val${c.gold ? ' gold' : ''}`}>{c.val}</div>
                </div>
              ))}
            </div>
            <div className="dash-section-title">Monthly Breakdown</div>
            <table className="data-table">
              <thead>
                <tr><th>Month</th><th>Property</th><th>Rental Income</th><th>Appreciation</th><th>Total</th></tr>
              </thead>
              <tbody>
                {MOCK_EARNINGS.map((row, i) => (
                  <tr key={i}>
                    <td>{row.month}</td>
                    <td style={{ color: 'var(--gray)' }}>{row.property}</td>
                    <td>{row.rental}</td>
                    <td>{row.appreciation}</td>
                    <td style={{ fontWeight: 700, color: '#2E7D32' }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab === 'transactions' && (
          <div>
            <div className="dash-header">
              <h2 className="display display-sm">Transaction History</h2>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map((tx, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--gray)' }}>{tx.date}</td>
                    <td><span className={`tx-badge tx-badge-${tx.badge}`}>{tx.type}</span></td>
                    <td>{tx.desc}</td>
                    <td style={{ fontWeight: 600, color: tx.badge === 'in' ? '#2E7D32' : 'var(--charcoal)' }}>{tx.amount}</td>
                    <td style={{ fontSize: 11, color: 'var(--gray)', fontWeight: 600 }}>Completed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* WITHDRAW */}
        {tab === 'withdraw' && (
          <div style={{ maxWidth: 560 }}>
            <div className="dash-header">
              <h2 className="display display-sm">Withdraw Funds</h2>
              <p className="body-sm" style={{ color: 'var(--gray)', marginTop: 8 }}>
                Withdraw available earnings to your linked bank account.
              </p>
            </div>
            <div className="dash-card" style={{ padding: 32, marginBottom: 32 }}>
              <div className="dash-card-label">Available for Withdrawal</div>
              <div className="dash-card-val gold" style={{ fontSize: 40, marginBottom: 0 }}>
                {fmtCurrency(demoData.earnings)}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Withdrawal Amount ($)</label>
              <input
                className="form-input"
                type="number"
                placeholder={`Max: ${fmtCurrency(demoData.earnings)}`}
                value={withdrawAmt}
                onChange={(e) => setWithdrawAmt(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Account</label>
              <select className="form-select">
                <option>**** **** **** 4821 (Primary)</option>
              </select>
            </div>
            <div style={{ background: 'var(--ivory-dark)', padding: 16, marginBottom: 24, fontSize: 13, color: 'var(--gray)' }}>
              Processing time: 3–5 business days. A confirmation email will be sent upon request.
            </div>
            <button className="btn btn-gold btn-lg" onClick={handleWithdraw}>
              Request Withdrawal
            </button>
          </div>
        )}

        {/* CHAT */}
        {tab === 'chat' && (
          <div>
            <div className="dash-header">
              <h2 className="display display-sm">Support Chat</h2>
              <p className="body-sm" style={{ color: 'var(--gray)', marginTop: 8 }}>
                Chat with our investor support team. We typically respond within minutes during business hours.
              </p>
            </div>
            <div className="chat-wrap">
              <div className="chat-head">
                <div className="chat-status" />
                <span style={{ fontSize: 13, color: 'var(--ivory)', fontWeight: 500 }}>Investor Support</span>
                <span style={{ fontSize: 11, color: 'rgba(248,246,241,0.4)', marginLeft: 8 }}>Online</span>
              </div>
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div key={i} className="chat-msg" style={{ alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div className={m.from === 'user' ? 'chat-msg-out' : 'chat-msg-in'}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input
                  className="chat-input"
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="btn btn-gold btn-sm" onClick={sendMessage}>Send</button>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT */}
        {tab === 'account' && (
          <div style={{ maxWidth: 560 }}>
            <div className="dash-header">
              <h2 className="display display-sm">Account Settings</h2>
            </div>
            <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: 32, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="dash-avatar" style={{ width: 64, height: 64, fontSize: 24 }}>{initial}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{displayName}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>{user?.email || 'demo@realtyinvestors.com'}</div>
                  <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 6 }}>Verified Investor</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" defaultValue={displayName} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" defaultValue={user?.email || 'demo@realtyinvestors.com'} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" type="tel" placeholder="+1 555 000 0000" />
              </div>
              <button className="btn btn-dark" onClick={() => addNotification('Profile updated successfully.')}>
                Save Changes
              </button>
            </div>

            <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: 32, marginBottom: 24 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>KYC Verification</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', fontWeight: 800 }}>✓</div>
                <span style={{ fontSize: 14, color: 'var(--charcoal)' }}>Identity Verified</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--gray)' }}>
                Your identity has been verified. You have full access to all investment opportunities.
              </p>
            </div>

            <button
              className="btn btn-outline-dark"
              onClick={() => { logoutDemo(); navigate('/'); }}
            >
              Sign Out
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
