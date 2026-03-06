import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@context/AppContext';
import {
  getAdminStats,
  getAllUsers,
  getAllInvestments,
  getAllTransactions,
  getAllChatThreads,
  updateUserProfile,
  markInvestmentAsPaid,
  updateInvestment,
  updateProperty,
  createProperty,
  deleteProperty,
  updateTransaction,
  sendChatMessage,
  getProperties,
  supabase
} from '@lib/supabase';
import { fmtCurrency } from '@utils/format';

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: '◉' },
  { key: 'users', label: 'Users', icon: '◈' },
  { key: 'investments', label: 'Investments', icon: '▦' },
  { key: 'properties', label: 'Properties', icon: '◈' },
  { key: 'transactions', label: 'Transactions', icon: '≡' },
  { key: 'chat', label: 'Support Chat', icon: '◎' },
  { key: 'settings', label: 'Settings', icon: '◬' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, addNotification } = useApp();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [chatThreads, setChatThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  // Property form state
  const [propertyForm, setPropertyForm] = useState({
    name: '', location: '', country: '', type: '', description: '',
    roi: '', min_investment: '', target_amount: '', rental_yield: '',
    bedrooms: '', sqft: '', status: 'active'
  });
  
  // Edit user state
  const [editingUser, setEditingUser] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (user && profile && !profile.is_admin) {
      addNotification('Access denied. Admin only.');
      navigate('/dashboard');
    }
  }, [user, profile]);

  // Load data based on tab
  const loadData = useCallback(async () => {
    if (tab === 'overview') {
      const data = await getAdminStats();
      setStats(data);
    } else if (tab === 'users') {
      const { data } = await getAllUsers();
      setUsers(data || []);
    } else if (tab === 'investments') {
      const { data } = await getAllInvestments();
      setInvestments(data || []);
    } else if (tab === 'properties') {
      const { data } = await getProperties({});
      setProperties(data || []);
    } else if (tab === 'transactions') {
      const { data } = await getAllTransactions();
      setTransactions(data || []);
    } else if (tab === 'chat') {
      const { data } = await getAllChatThreads();
      setChatThreads(data || []);
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  // Load chat messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      const loadMessages = async () => {
        const { data } = await getAllChatThreads();
        const userMessages = data?.filter(m => m.user_id === selectedUser.id) || [];
        setChatMessages(userMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
      };
      loadMessages();
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`admin-chat:${selectedUser.id}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${selectedUser.id}` },
          (payload) => {
            setChatMessages(prev => [...prev, payload.new]);
          }
        )
        .subscribe();
        
      return () => supabase.removeChannel(channel);
    }
  }, [selectedUser]);

  // Handle sending admin message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedUser) return;
    await sendChatMessage({
      userId: selectedUser.id,
      content: chatInput,
      fromAdmin: true
    });
    setChatInput('');
  };

  // Handle marking investment as paid
  const handleMarkAsPaid = async (investmentId) => {
    await markInvestmentAsPaid(investmentId);
    addNotification('Investment marked as paid');
    loadData();
  };

  // Handle updating investment
  const handleUpdateInvestment = async (id, updates) => {
    await updateInvestment(id, updates);
    addNotification('Investment updated');
    loadData();
  };

  // Handle creating property
  const handleCreateProperty = async (e) => {
    e.preventDefault();
    const { data, error } = await createProperty({
      name: propertyForm.name,
      location: propertyForm.location,
      country: propertyForm.country,
      type: propertyForm.type,
      description: propertyForm.description,
      roi: parseFloat(propertyForm.roi),
      min_investment: parseFloat(propertyForm.min_investment),
      target_amount: parseFloat(propertyForm.target_amount),
      rental_yield: propertyForm.rental_yield ? parseFloat(propertyForm.rental_yield) : null,
      bedrooms: propertyForm.bedrooms ? parseInt(propertyForm.bedrooms) : 0,
      sqft: propertyForm.sqft ? parseInt(propertyForm.sqft) : null,
      status: propertyForm.status
    });
    
    if (error) {
      addNotification('Error creating property: ' + error.message);
    } else {
      addNotification('Property created successfully');
      setPropertyForm({
        name: '', location: '', country: '', type: '', description: '',
        roi: '', min_investment: '', target_amount: '', rental_yield: '',
        bedrooms: '', sqft: '', status: 'active'
      });
      loadData();
    }
  };

  // Handle updating user
  const handleUpdateUser = async (userId, updates) => {
    await updateUserProfile(userId, updates);
    addNotification('User updated successfully');
    setEditingUser(null);
    loadData();
  };

  // Handle updating transaction
  const handleUpdateTransaction = async (id, updates) => {
    await updateTransaction(id, updates);
    addNotification('Transaction updated');
    loadData();
  };

  // Handle deleting property
  const handleDeleteProperty = async (id) => {
    if (confirm('Are you sure you want to delete this property?')) {
      await deleteProperty(id);
      addNotification('Property deleted');
      loadData();
    }
  };

  if (!user || (profile && !profile.is_admin)) {
    return (
      <div className="page-loading" style={{ paddingTop: 'var(--nav-h)' }}>
        <div style={{ textAlign: 'center' }}>
          <p className="body-md" style={{ color: 'var(--gray)', marginBottom: 24 }}>
            Admin access required.
          </p>
          <button className="btn btn-gold" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const displayName = profile?.first_name || 'Admin';
  const initial = displayName[0].toUpperCase();

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-user">
          <div className="dash-avatar" style={{ background: 'var(--black)' }}>{initial}</div>
          <div className="dash-user-name">{displayName}</div>
          <div className="dash-user-level" style={{ color: 'var(--gold)' }}>Administrator</div>
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

        <div style={{ padding: '24px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            className="btn btn-outline btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/dashboard')}
          >
            User Dashboard
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && stats && (
              <div>
                <div className="dash-header">
                  <h2 className="display display-sm">Admin Dashboard</h2>
                  <p className="body-sm" style={{ color: 'var(--gray)', marginTop: 8 }}>
                    Overview of your platform
                  </p>
                </div>
                <div className="dash-cards">
                  <div className="dash-card">
                    <div className="dash-card-label">Total Users</div>
                    <div className="dash-card-val">{stats.totalUsers}</div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Total Investments</div>
                    <div className="dash-card-val">{stats.totalInvestments}</div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Properties</div>
                    <div className="dash-card-val">{stats.totalProperties}</div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Total Invested</div>
                    <div className="dash-card-val gold">{fmtCurrency(stats.totalInvested)}</div>
                  </div>
                </div>
                <div className="dash-cards" style={{ marginTop: 16 }}>
                  <div className="dash-card">
                    <div className="dash-card-label">Pending Payouts</div>
                    <div className="dash-card-val" style={{ color: '#C65D3B' }}>
                      {fmtCurrency(stats.pendingPayouts)}
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Transactions</div>
                    <div className="dash-card-val">{stats.totalTransactions}</div>
                  </div>
                </div>
              </div>
            )}

            {/* USERS */}
            {tab === 'users' && (
              <div>
                <div className="dash-header">
                  <h2 className="display display-sm">All Users</h2>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Level</th>
                      <th>KYC</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>
                          {u.first_name} {u.last_name}
                        </td>
                        <td style={{ color: 'var(--gray)' }}>{u.email || 'N/A'}</td>
                        <td>
                          <span className="tx-badge" style={{
                            background: u.investor_level === 'premium' ? 'var(--gold)' : 'var(--ivory-dark)',
                            color: u.investor_level === 'premium' ? 'var(--black)' : 'var(--charcoal)'
                          }}>
                            {u.investor_level}
                          </span>
                        </td>
                        <td>
                          <span className={`tx-badge tx-badge-${u.kyc_status === 'verified' ? 'in' : 'out'}`}>
                            {u.kyc_status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--gray)' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm"
                            style={{ padding: '6px 12px', fontSize: 11 }}
                            onClick={() => setEditingUser(u)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* INVESTMENTS */}
            {tab === 'investments' && (
              <div>
                <div className="dash-header">
                  <h2 className="display display-sm">All Investments</h2>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Property</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 500 }}>
                          {inv.profiles?.first_name} {inv.profiles?.last_name}
                        </td>
                        <td style={{ color: 'var(--gray)' }}>{inv.properties?.name}</td>
                        <td style={{ fontWeight: 600 }}>{fmtCurrency(inv.amount_invested)}</td>
                        <td>
                          <span className={`tx-badge tx-badge-${inv.status === 'active' ? 'in' : 'out'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            color: inv.payment_status === 'paid' ? '#2E7D32' : '#C65D3B',
                            fontWeight: 600,
                            fontSize: 12
                          }}>
                            {inv.payment_status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--gray)' }}>
                          {new Date(inv.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          {inv.payment_status === 'unpaid' && (
                            <button
                              className="btn btn-sm btn-gold"
                              style={{ padding: '6px 12px', fontSize: 11 }}
                              onClick={() => handleMarkAsPaid(inv.id)}
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PROPERTIES */}
            {tab === 'properties' && (
              <div>
                <div className="dash-header">
                  <h2 className="display display-sm">Properties</h2>
                </div>
                
                {/* Create Property Form */}
                <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: 24, marginBottom: 32 }}>
                  <h4 style={{ marginBottom: 16 }}>Add New Property</h4>
                  <form onSubmit={handleCreateProperty} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <input className="form-input" placeholder="Property Name" required
                      value={propertyForm.name} onChange={e => setPropertyForm({...propertyForm, name: e.target.value})} />
                    <input className="form-input" placeholder="Location" required
                      value={propertyForm.location} onChange={e => setPropertyForm({...propertyForm, location: e.target.value})} />
                    <input className="form-input" placeholder="Country" required
                      value={propertyForm.country} onChange={e => setPropertyForm({...propertyForm, country: e.target.value})} />
                    <select className="form-select" required
                      value={propertyForm.type} onChange={e => setPropertyForm({...propertyForm, type: e.target.value})}>
                      <option value="">Select Type</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="commercial">Commercial</option>
                      <option value="condo">Condo</option>
                    </select>
                    <input className="form-input" type="number" step="0.01" placeholder="ROI %" required
                      value={propertyForm.roi} onChange={e => setPropertyForm({...propertyForm, roi: e.target.value})} />
                    <input className="form-input" type="number" placeholder="Min Investment" required
                      value={propertyForm.min_investment} onChange={e => setPropertyForm({...propertyForm, min_investment: e.target.value})} />
                    <input className="form-input" type="number" placeholder="Target Amount" required
                      value={propertyForm.target_amount} onChange={e => setPropertyForm({...propertyForm, target_amount: e.target.value})} />
                    <input className="form-input" type="number" step="0.01" placeholder="Rental Yield %"
                      value={propertyForm.rental_yield} onChange={e => setPropertyForm({...propertyForm, rental_yield: e.target.value})} />
                    <select className="form-select"
                      value={propertyForm.status} onChange={e => setPropertyForm({...propertyForm, status: e.target.value})}>
                      <option value="active">Active</option>
                      <option value="closing">Closing</option>
                      <option value="funded">Funded</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button type="submit" className="btn btn-gold" style={{ gridColumn: '1 / -1' }}>
                      Create Property
                    </button>
                  </form>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>ROI</th>
                      <th>Raised</th>
                      <th>Target</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td style={{ color: 'var(--gray)' }}>{p.location}</td>
                        <td>{p.type}</td>
                        <td style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>{p.roi}%</td>
                        <td>{fmtCurrency(p.raised_amount)}</td>
                        <td>{fmtCurrency(p.target_amount)}</td>
                        <td>
                          <span className={`tx-badge tx-badge-${p.status === 'active' ? 'in' : 'out'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm"
                            style={{ padding: '4px 8px', fontSize: 10, marginRight: 4 }}
                            onClick={() => handleDeleteProperty(p.id)}
                          >
                            Delete
                          </button>
                        </td>
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
                  <h2 className="display display-sm">All Transactions</h2>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ fontWeight: 500 }}>
                          {tx.profiles?.first_name} {tx.profiles?.last_name}
                        </td>
                        <td>
                          <span className="tx-badge tx-badge-{tx.type === 'deposit' || tx.type === 'income' ? 'in' : 'out'}">
                            {tx.type}
                          </span>
                        </td>
                        <td style={{ 
                          fontWeight: 600,
                          color: tx.amount > 0 ? '#2E7D32' : 'var(--charcoal)'
                        }}>
                          {tx.amount > 0 ? '+' : ''}{fmtCurrency(tx.amount)}
                        </td>
                        <td style={{ color: 'var(--gray)' }}>{tx.description}</td>
                        <td>
                          <span className={`tx-badge tx-badge-${tx.status === 'completed' ? 'in' : 'out'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--gray)' }}>
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          {tx.status === 'pending' && (
                            <button
                              className="btn btn-sm"
                              style={{ padding: '4px 8px', fontSize: 10 }}
                              onClick={() => handleUpdateTransaction(tx.id, { status: 'completed' })}
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CHAT */}
            {tab === 'chat' && (
              <div>
                <div className="dash-header">
                  <h2 className="display display-sm">Support Chat</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, height: 'calc(100vh - 250px)' }}>
                  {/* User List */}
                  <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', overflow: 'auto' }}>
                    {chatThreads.filter((m, i, arr) => arr.findIndex(t => t.user_id === m.user_id) === i).map((thread) => (
                      <div
                        key={thread.user_id}
                        onClick={() => {
                          const userData = { id: thread.user_id, first_name: thread.profiles?.first_name, last_name: thread.profiles?.last_name };
                          setSelectedUser(userData);
                        }}
                        style={{
                          padding: 16,
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          background: selectedUser?.id === thread.user_id ? 'var(--ivory-dark)' : 'transparent'
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>
                          {thread.profiles?.first_name} {thread.profiles?.last_name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--gray)' }}>
                          {thread.content.substring(0, 40)}...
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chat Area */}
                  <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
                    {selectedUser ? (
                      <>
                        <div style={{ padding: 16, borderBottom: '1px solid var(--border-subtle)', background: 'var(--black)', color: 'var(--ivory)' }}>
                          Chatting with: {selectedUser.first_name} {selectedUser.last_name}
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {chatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              style={{
                                alignSelf: msg.from_admin ? 'flex-end' : 'flex-start',
                                maxWidth: '70%'
                              }}
                            >
                              <div style={{
                                padding: '10px 16px',
                                borderRadius: 12,
                                background: msg.from_admin ? 'var(--gold)' : 'var(--ivory-dark)',
                                color: msg.from_admin ? 'var(--black)' : 'var(--charcoal)'
                              }}>
                                {msg.content}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--gray)', marginTop: 4 }}>
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
                          <input
                            className="form-input"
                            placeholder="Type your reply..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <button className="btn btn-gold" onClick={handleSendMessage}>Send</button>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray)' }}>
                        Select a user to start chatting
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {tab === 'settings' && (
              <div>
                <div className="dash-header">
                  <h2 className="display display-sm">Admin Settings</h2>
                </div>
                <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: 32 }}>
                  <h4 style={{ marginBottom: 20 }}>Platform Settings</h4>
                  <p style={{ color: 'var(--gray)' }}>
                    Configure your platform settings here. More options coming soon.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setEditingUser(null)}>
          <div style={{
            background: 'var(--white)', padding: 32, maxWidth: 500, width: '90%',
            borderRadius: 8
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 24 }}>Edit User: {editingUser.first_name}</h3>
            <div className="form-group">
              <label className="form-label">Investor Level</label>
              <select className="form-select" id="edit-level" defaultValue={editingUser.investor_level}>
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">KYC Status</label>
              <select className="form-select" id="edit-kyc" defaultValue={editingUser.kyc_status}>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" id="edit-phone" defaultValue={editingUser.phone || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Account</label>
              <input className="form-input" id="edit-bank" defaultValue={editingUser.bank_account || ''} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-gold" onClick={() => {
                handleUpdateUser(editingUser.id, {
                  investor_level: document.getElementById('edit-level').value,
                  kyc_status: document.getElementById('edit-kyc').value,
                  phone: document.getElementById('edit-phone').value,
                  bank_account: document.getElementById('edit-bank').value
                });
              }}>
                Save Changes
              </button>
              <button className="btn btn-outline-dark" onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

