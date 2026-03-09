import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@context/AppContext';
import { fmtCurrency } from '@utils/format';
import {
  getUserInvestments,
  getUserTransactions,
  getUserEarnings,
  getUserBalance,
  getChatMessages,
  sendChatMessage,
  subscribeToChat,
  subscribeToUserChanges,
  supabase
} from '@lib/supabase';

const NAV_ITEMS = [
  { key: 'portfolio',     label: 'Portfolio',       icon: '▦' },
  { key: 'investments',   label: 'My Investments',  icon: '◈' },
  { key: 'earnings',      label: 'Earnings',         icon: '◉' },
  { key: 'transactions',  label: 'Transactions',    icon: '≡' },
  { key: 'withdraw',      label: 'Withdraw Funds',  icon: '↑' },
  { key: 'chat',          label: 'Support Chat',    icon: '◎' },
  { key: 'account',       label: 'Account',         icon: '◬' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, addNotification } = useApp();
  const [tab, setTab]               = useState('portfolio');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Real data state
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [balance, setBalance] = useState({ balance: 0, totalInvested: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Check if user is admin
  const isAdmin = profile?.is_admin === true;

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Load investments
    const { data: invData } = await getUserInvestments(user.id);
    setInvestments(invData || []);
    
    // Load transactions
    const { data: txData } = await getUserTransactions(user.id);
    setTransactions(txData || []);
    
    // Load earnings
    const { data: earnData } = await getUserEarnings(user.id);
    setEarnings(earnData || []);
    
    // Load balance
    const balanceData = await getUserBalance(user.id);
    setBalance(balanceData);
    
    // Load chat messages
    const { data: msgData } = await getChatMessages(user.id);
    setChatMessages(msgData || []);
    
    setLoading(false);
  }, [user]);

  // Initial data load
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to user changes (transactions, investments, earnings)
    const unsubscribeUser = subscribeToUserChanges(user.id, (type, data) => {
      loadUserData();
    });

    // Subscribe to chat messages
    const unsubscribeChat = subscribeToChat(user.id, (newMessage) => {
      setChatMessages(prev => [...prev, newMessage]);
    });

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeChat) unsubscribeChat();
    };
  }, [user, loadUserData]);

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

  const displayName = profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Investor';
  const initial     = displayName[0].toUpperCase();

  // Calculate total earnings from loaded data
  const totalEarnings = earnings?.reduce((sum, e) => sum + ((e.rental_income || 0) + (e.appreciation || 0)), 0) || 0;
  const thisMonthEarnings = earnings?.[0]?.rental_income || 0;
  const pendingEarnings = earnings?.filter(e => !e.paid_at)?.reduce((sum, e) => sum + ((e.rental_income || 0) + (e.appreciation || 0)), 0) || 0;

  // Send chat message
  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    
    await sendChatMessage({
      userId: user.id,
      content: chatInput,
      fromAdmin: false
    });
    
    setChatInput('');
  };

  // Handle withdrawal request
  const handleWithdraw = async () => {
    const amt = Number(withdrawAmt);
    if (!amt || amt <= 0) { 
      addNotification('Please enter a valid withdrawal amount.'); 
      return; 
    }
    if (amt > balance.balance) { 
      addNotification('Insufficient balance.'); 
      return; 
    }
    
    // Create withdrawal transaction
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: -Math.abs(amt),
        status: 'pending',
        description: 'Withdrawal request'
      });
    
    if (error) {
      addNotification('Error: ' + error.message);
    } else {
      addNotification(`Withdrawal of ${fmtCurrency(amt)} initiated. Processing in 3–5 business days.`);
      setWithdrawAmt('');
      loadUserData();
    }
  };

  // Calculate average ROI
  const avgRoi = investments?.length > 0 
    ? investments.reduce((sum, inv) => sum + (inv.properties?.roi || 0), 0) / investments.length 
    : 0;

  return (
    <div className="dash-layout">
      {/* Mobile Header */}
      <div className="dash-mobile-header">
        <button className="dash-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span>{sidebarOpen ? '✕' : '☰'}</span>
          Menu
        </button>
        <span style={{ color: 'var(--ivory)', fontSize: 14 }}>{displayName}</span>
      </div>
      
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="dash-user">
          <div className="dash-avatar">{initial}</div>
          <div className="dash-user-name">{displayName}</div>
          <div className="dash-user-level">{profile?.investor_level || 'Investor'}</div>
        </div>

        {NAV_ITEMS.map((item) => (
          <div
            key={item.key}
            className={`dash-nav-item${tab === item.key ? ' active' : ''}`}
            onClick={() => { setTab(item.key); setSidebarOpen(false); }}
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
        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
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
                  <div className="dash-card">
                    <div className="dash-card-label">Total Invested</div>
                    <div className="dash-card-val">{fmtCurrency(balance.totalInvested)}</div>
                    <div className="dash-card-change">{investments.length} properties</div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Total Earnings</div>
                    <div className="dash-card-val gold">{fmtCurrency(balance.totalEarnings)}</div>
                    <div className="dash-card-change">+{fmtCurrency(thisMonthEarnings)} this month</div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Available Balance</div>
                    <div className="dash-card-val" style={{ color: balance.balance >= 0 ? '#2E7D32' : '#C65D3B' }}>
                      {fmtCurrency(balance.balance)}
                    </div>
                    <div className="dash-card-change">{pendingEarnings > 0 ? `${fmtCurrency(pendingEarnings)} pending` : 'Ready to withdraw'}</div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Portfolio ROI</div>
                    <div className="dash-card-val gold">{avgRoi.toFixed(1)}%</div>
                    <div className="dash-card-change">Annualized</div>
                  </div>
                </div>

                <div className="dash-section-title">Quick Actions</div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
                  <button className="btn btn-gold" onClick={() => navigate('/investments')}>Invest in Property</button>
                  <button className="btn btn-outline-dark" onClick={() => setTab('withdraw')}>Withdraw Earnings</button>
                  <button className="btn btn-outline-dark" onClick={() => setTab('chat')}>Contact Support</button>
                </div>

                <div className="dash-section-title">Recent Activity</div>
                {transactions.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th><th>Type</th><th>Description</th><th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ color: 'var(--gray)' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td><span className={`tx-badge tx-badge-${tx.type === 'deposit' || tx.type === 'income' || tx.type === 'earning' || tx.amount > 0 ? 'in' : 'out'}`}>{tx.type}</span></td>
                          <td>{tx.description || tx.type}</td>
                          <td style={{ fontWeight: 600, color: tx.amount > 0 ? '#2E7D32' : 'var(--charcoal)' }}>
                            {tx.amount > 0 ? '+' : ''}{fmtCurrency(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: 'var(--gray)', padding: 20 }}>No recent transactions</p>
                )}
              </div>
            )}

            {/* MY INVESTMENTS */}
            {tab === 'investments' && (
              <div>
                <div className="dash-header">
                  <h2 className="display display-sm">My Investments</h2>
                  <p className="body-sm" style={{ color: 'var(--gray)', marginTop: 8 }}>Properties currently in your portfolio.</p>
                </div>
                {investments.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr><th>Property</th><th>Location</th><th>Invested</th><th>ROI</th><th>Status</th><th>Payment</th></tr>
                    </thead>
                    <tbody>
                      {investments.map((inv) => (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 500 }}>{inv.properties?.name || 'Property'}</td>
                          <td style={{ color: 'var(--gray)' }}>{inv.properties?.location || 'N/A'}</td>
                          <td style={{ fontWeight: 600 }}>{fmtCurrency(inv.amount_invested)}</td>
                          <td style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>{inv.properties?.roi || 0}%</td>
                          <td><span className={`tx-badge tx-badge-${inv.status === 'active' ? 'in' : 'out'}`}>{inv.status}</span></td>
                          <td><span className={`tx-badge tx-badge-${inv.payment_status === 'paid' ? 'in' : 'out'}`}>{inv.payment_status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: 60 }}>
                    <p style={{ color: 'var(--gray)', marginBottom: 20 }}>No investments yet</p>
                    <button className="btn btn-gold" onClick={() => navigate('/investments')}>Browse Properties</button>
                  </div>
                )}
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
                  <div className="dash-card">
                    <div className="dash-card-label">Total Earnings</div>
                    <div className="dash-card-val gold">{fmtCurrency(balance.totalEarnings)}</div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">This Month</div>
                    <div className="dash-card-val">{fmtCurrency(thisMonthEarnings)}</div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Pending Payout</div>
                    <div className="dash-card-val">{fmtCurrency(pendingEarnings)}</div>
                  </div>
                </div>
                
                {earnings.length > 0 ? (
                  <>
                    <div className="dash-section-title">Monthly Breakdown</div>
                    <table className="data-table">
                      <thead>
                        <tr><th>Month</th><th>Property</th><th>Rental Income</th><th>Appreciation</th><th>Total</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {earnings.map((e) => (
                          <tr key={e.id}>
                            <td>{e.period_month}</td>
                            <td style={{ color: 'var(--gray)' }}>{e.investments?.properties?.name || 'N/A'}</td>
                            <td style={{ color: '#2E7D32' }}>{fmtCurrency(e.rental_income || 0)}</td>
                            <td style={{ color: '#2E7D32' }}>{fmtCurrency(e.appreciation || 0)}</td>
                            <td style={{ fontWeight: 700, color: '#2E7D32' }}>{fmtCurrency((e.rental_income || 0) + (e.appreciation || 0))}</td>
                            <td>
                              <span className={`tx-badge tx-badge-${e.paid_at ? 'in' : 'out'}`}>
                                {e.paid_at ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 40 }}>No earnings yet</p>
                )}
              </div>
            )}

            {/* TRANSACTIONS */}
            {tab === 'transactions' && (
              <div>
                <div className="dash-header">
                  <h2 className="display display-sm">Transaction History</h2>
                </div>
                {transactions.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ color: 'var(--gray)' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td><span className={`tx-badge tx-badge-${tx.type === 'deposit' || tx.type === 'income' || tx.amount > 0 ? 'in' : 'out'}`}>{tx.type}</span></td>
                          <td>{tx.description || tx.type}</td>
                          <td style={{ fontWeight: 600, color: tx.amount > 0 ? '#2E7D32' : 'var(--charcoal)' }}>
                            {tx.amount > 0 ? '+' : ''}{fmtCurrency(tx.amount)}
                          </td>
                          <td><span className={`tx-badge tx-badge-${tx.status === 'completed' ? 'in' : 'out'}`}>{tx.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 40 }}>No transactions yet</p>
                )}
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
                    {fmtCurrency(balance.balance)}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Withdrawal Amount ($)</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder={`Max: ${fmtCurrency(balance.balance)}`}
                    value={withdrawAmt}
                    onChange={(e) => setWithdrawAmt(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bank Account</label>
                  <select className="form-select">
                    <option>{profile?.bank_account || 'No bank account linked'}</option>
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
                    {chatMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--gray)', padding: 20 }}>
                        Start a conversation with our support team
                      </div>
                    ) : (
                      chatMessages.map((m) => (
                        <div key={m.id} className="chat-msg" style={{ alignSelf: m.from_admin ? 'flex-end' : 'flex-start' }}>
                          <div className={m.from_admin ? 'chat-msg-out' : 'chat-msg-in'}>
                            {m.content}
                          </div>
                        </div>
                      ))
                    )}
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
                      <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>{user?.email}</div>
                      <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 6 }}>
                        {profile?.kyc_status === 'verified' ? 'Verified Investor' : 'Pending Verification'}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" type="text" defaultValue={displayName} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" type="email" defaultValue={user?.email} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" type="tel" defaultValue={profile?.phone || ''} placeholder="+1 555 000 0000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" type="text" defaultValue={profile?.country || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bank Account</label>
                    <input className="form-input" type="text" defaultValue={profile?.bank_account || ''} placeholder="Account number" />
                  </div>
                  <button className="btn btn-dark" onClick={() => addNotification('Profile updated successfully.')}>
                    Save Changes
                  </button>
                </div>

                <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: 32, marginBottom: 24 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>KYC Verification</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ 
                      width: 24, height: 24, 
                      background: profile?.kyc_status === 'verified' ? '#2E7D32' : '#C65D3B', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', fontWeight: 800 
                    }}>
                      {profile?.kyc_status === 'verified' ? '✓' : '!'}
                    </div>
                    <span style={{ fontSize: 14, color: 'var(--charcoal)' }}>
                      {profile?.kyc_status === 'verified' ? 'Identity Verified' : 'Verification ' + (profile?.kyc_status || 'pending')}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray)' }}>
                    {profile?.kyc_status === 'verified' 
                      ? 'Your identity has been verified. You have full access to all investment opportunities.'
                      : 'Complete your verification to access all investment opportunities.'}
                  </p>
                </div>

                <button
                  className="btn btn-outline-dark"
                  onClick={() => { supabase.auth.signOut(); navigate('/'); }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

