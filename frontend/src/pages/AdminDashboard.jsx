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
  getUserDetails,
  updateUserBalance,
  addUserEarning,
  updateUserKYC,
  getUserChatMessages,
  supabase
} from '@lib/supabase';
import { fmtCurrency } from '@utils/format';

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: '◉' },
  { key: 'users', label: 'Users', icon: '◈' },
  { key: 'investments', label: 'Investments', icon: '▦' },
  { key: 'properties', label: 'Properties', icon: '◈' },
  { key: 'transactions', label: 'Transactions', icon: '≡' },
  { key: 'settings', label: 'Settings', icon: '◬' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, addNotification } = useApp();
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User detail state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
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
  
  // Add funds/earnings modal
  const [fundsModal, setFundsModal] = useState({ show: false, type: '', userId: null });

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
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  // Load user details when a user is selected
  const loadUserDetails = useCallback(async (userId) => {
    setUserLoading(true);
    const details = await getUserDetails(userId);
    setUserDetails(details);
    
    // Load chat messages
    const { data: messages } = await getUserChatMessages(userId);
    setChatMessages(messages || []);
    setUserLoading(false);
  }, []);

  // Subscribe to real-time updates for selected user
  useEffect(() => {
    if (selectedUser) {
      loadUserDetails(selectedUser.id);
      
      // Subscribe to real-time changes
      const channel = supabase
        .channel(`admin-user:${selectedUser.id}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${selectedUser.id}` },
          () => loadUserDetails(selectedUser.id)
        )
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'investments', filter: `user_id=eq.${selectedUser.id}` },
          () => loadUserDetails(selectedUser.id)
        )
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'earnings', filter: `user_id=eq.${selectedUser.id}` },
          () => loadUserDetails(selectedUser.id)
        )
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${selectedUser.id}` },
          async () => {
            const { data } = await getUserChatMessages(selectedUser.id);
            setChatMessages(data || []);
          }
        )
        .subscribe();
        
      return () => supabase.removeChannel(channel);
    }
  }, [selectedUser, loadUserDetails]);

  // Handle sending admin message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedUser) return;
    await sendChatMessage({
      userId: selectedUser.id,
      content: chatInput,
      fromAdmin: true
    });
    setChatInput('');
    // Refresh messages
    const { data } = await getUserChatMessages(selectedUser.id);
    setChatMessages(data || []);
  };

  // Handle marking investment as paid
  const handleMarkAsPaid = async (investmentId) => {
    await markInvestmentAsPaid(investmentId);
    addNotification('Investment marked as paid');
    loadData();
    if (selectedUser) loadUserDetails(selectedUser.id);
  };

  // Handle creating property
  const handleCreateProperty = async (e) => {
    e.preventDefault();
    const { error } = await createProperty({
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
    if (selectedUser) loadUserDetails(selectedUser.id);
  };

  // Handle updating KYC
  const handleUpdateKYC = async (userId, status) => {
    await updateUserKYC(userId, status);
    addNotification('KYC status updated');
    if (selectedUser) loadUserDetails(selectedUser.id);
  };

  // Handle adding funds/earnings
  const handleAddFunds = async () => {
    const amount = parseFloat(document.getElementById('fund-amount').value);
    const description = document.getElementById('fund-desc').value;
    const type = fundsModal.type;
    
    if (!amount || amount <= 0) {
      addNotification('Please enter a valid amount');
      return;
    }

    if (type === 'earning') {
      const investmentId = document.getElementById('fund-investment').value;
      const earningType = document.getElementById('earning-type').value;
      const period = document.getElementById('earning-period').value || new Date().toISOString().slice(0, 7);
      
      await addUserEarning(fundsModal.userId, investmentId, amount, earningType, period);
      addNotification('Earning added to user');
    } else {
      await updateUserBalance(fundsModal.userId, amount, type, description);
      addNotification(type === 'credit' ? 'Funds added to user' : 'Funds deducted from user');
    }
    
    setFundsModal({ show: false, type: '', userId: null });
    if (selectedUser) loadUserDetails(selectedUser.id);
  };

  // Handle updating transaction
  const handleUpdateTransaction = async (id, updates) => {
    await updateTransaction(id, updates);
    addNotification('Transaction updated');
    loadData();
    if (selectedUser) loadUserDetails(selectedUser.id);
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
      {/* Mobile Header */}
      <div className="dash-mobile-header">
        <button className="dash-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span>{sidebarOpen ? '✕' : '☰'}</span>
          Menu
        </button>
        <span style={{ color: 'var(--ivory)', fontSize: 14 }}>Admin Panel</span>
      </div>
      
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="dash-user">
          <div className="dash-avatar" style={{ background: 'var(--black)' }}>{initial}</div>
          <div className="dash-user-name">{displayName}</div>
          <div className="dash-user-level" style={{ color: 'var(--gold)' }}>Administrator</div>
        </div>

        {NAV_ITEMS.map((item) => (
          <div
            key={item.key}
            className={`dash-nav-item${tab === item.key ? ' active' : ''}`}
onClick={() => { setTab(item.key); setSelectedUser(null); setSidebarOpen(false); }}
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

            {/* USERS with Detail View */}
            {tab === 'users' && !selectedUser && (
              <div>
                <div className="dash-header">
                  <h2 className="display display-sm">All Users</h2>
                  <p className="body-sm" style={{ color: 'var(--gray)', marginTop: 8 }}>
                    Click on a user to view details
                  </p>
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
                            style={{ padding: '6px 12px', fontSize: 11, marginRight: 4 }}
                            onClick={() => { setSelectedUser({ id: u.id, first_name: u.first_name, last_name: u.last_name }); }}
                          >
                            View
                          </button>
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

            {/* USER DETAIL VIEW */}
            {tab === 'users' && selectedUser && userDetails && (
              <div>
                <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <button 
                      className="btn btn-sm" 
                      style={{ marginBottom: 16 }}
                      onClick={() => { setSelectedUser(null); setChatMessages([]); }}
                    >
                      ← Back to Users
                    </button>
                    <h2 className="display display-sm">
                      {userDetails.profile?.first_name} {userDetails.profile?.last_name}
                    </h2>
                    <p className="body-sm" style={{ color: 'var(--gray)', marginTop: 8 }}>
                      User Details & Management
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="btn btn-gold btn-sm"
                      onClick={() => setFundsModal({ show: true, type: 'credit', userId: selectedUser.id })}
                    >
                      Add Funds
                    </button>
                    <button 
                      className="btn btn-sm"
                      onClick={() => setFundsModal({ show: true, type: 'earning', userId: selectedUser.id })}
                    >
                      Add Earning
                    </button>
                  </div>
                </div>

                {/* User Stats Cards */}
                <div className="dash-cards">
                  <div className="dash-card">
                    <div className="dash-card-label">Total Invested</div>
                    <div className="dash-card-val">{fmtCurrency(userDetails.stats.totalInvested)}</div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Total Earnings</div>
                    <div className="dash-card-val gold">{fmtCurrency(userDetails.stats.totalEarnings)}</div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Available Balance</div>
                    <div className="dash-card-val" style={{ color: userDetails.stats.balance >= 0 ? '#2E7D32' : '#C65D3B' }}>
                      {fmtCurrency(userDetails.stats.balance)}
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-label">Investments</div>
                    <div className="dash-card-val">{userDetails.stats.investmentCount}</div>
                  </div>
                </div>

                {/* User Info & Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                  {/* Profile Info */}
                  <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: 24 }}>
                    <h4 style={{ marginBottom: 16 }}>Profile Information</h4>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div><strong>Email:</strong> {userDetails.profile?.email || 'N/A'}</div>
                      <div><strong>Phone:</strong> {userDetails.profile?.phone || 'Not set'}</div>
                      <div><strong>Country:</strong> {userDetails.profile?.country || 'Not set'}</div>
                      <div><strong>Bank Account:</strong> {userDetails.profile?.bank_account || 'Not set'}</div>
                      <div><strong>Investor Level:</strong> 
                        <select 
                          className="form-select" 
                          style={{ marginLeft: 8, width: 'auto', display: 'inline-block', padding: '4px 8px' }}
                          defaultValue={userDetails.profile?.investor_level}
                          onChange={(e) => updateUserProfile(selectedUser.id, { investor_level: e.target.value })}
                        >
                          <option value="new">New</option>
                          <option value="active">Active</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                      <div><strong>KYC Status:</strong> 
                        <select 
                          className="form-select" 
                          style={{ marginLeft: 8, width: 'auto', display: 'inline-block', padding: '4px 8px' }}
                          defaultValue={userDetails.profile?.kyc_status}
                          onChange={(e) => handleUpdateKYC(selectedUser.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="submitted">Submitted</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div><strong>Admin:</strong> {userDetails.profile?.is_admin ? 'Yes' : 'No'}</div>
                      <div><strong>Joined:</strong> {new Date(userDetails.profile?.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Chat */}
                  <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', height: 300 }}>
                    <div style={{ padding: 16, borderBottom: '1px solid var(--border-subtle)', background: 'var(--black)', color: 'var(--ivory)' }}>
                      Chat with User
                    </div>
                    <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {chatMessages.map((msg) => (
                        <div key={msg.id} style={{ alignSelf: msg.from_admin ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                          <div style={{
                            padding: '8px 12px',
                            borderRadius: 12,
                            background: msg.from_admin ? 'var(--gold)' : 'var(--ivory-dark)',
                            fontSize: 13
                          }}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
                      <input
                        className="form-input"
                        placeholder="Type message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button className="btn btn-gold btn-sm" onClick={handleSendMessage}>Send</button>
                    </div>
                  </div>
                </div>

                {/* User Investments */}
                <div style={{ marginBottom: 32 }}>
                  <h4 style={{ marginBottom: 16 }}>Investments ({userDetails.investments?.length || 0})</h4>
                  {userDetails.investments?.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Payment</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDetails.investments.map((inv) => (
                          <tr key={inv.id}>
                            <td>{inv.properties?.name}</td>
                            <td style={{ fontWeight: 600 }}>{fmtCurrency(inv.amount_invested)}</td>
                            <td><span className={`tx-badge tx-badge-${inv.status === 'active' ? 'in' : 'out'}`}>{inv.status}</span></td>
                            <td style={{ color: inv.payment_status === 'paid' ? '#2E7D32' : '#C65D3B', fontWeight: 600 }}>{inv.payment_status}</td>
                            <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                            <td>
                              {inv.payment_status !== 'paid' && (
                                <button className="btn btn-sm btn-gold" onClick={() => handleMarkAsPaid(inv.id)}>
                                  Mark Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: 'var(--gray)' }}>No investments yet</p>
                  )}
                </div>

                {/* User Transactions */}
                <div style={{ marginBottom: 32 }}>
                  <h4 style={{ marginBottom: 16 }}>Transactions ({userDetails.transactions?.length || 0})</h4>
                  {userDetails.transactions?.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDetails.transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td><span className={`tx-badge tx-badge-${tx.type === 'deposit' || tx.type === 'income' || tx.type === 'credit' ? 'in' : 'out'}`}>{tx.type}</span></td>
                            <td style={{ fontWeight: 600, color: tx.amount > 0 ? '#2E7D32' : 'var(--charcoal)' }}>
                              {tx.amount > 0 ? '+' : ''}{fmtCurrency(tx.amount)}
                            </td>
                            <td>{tx.description}</td>
                            <td><span className={`tx-badge tx-badge-${tx.status === 'completed' ? 'in' : 'out'}`}>{tx.status}</span></td>
                            <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: 'var(--gray)' }}>No transactions yet</p>
                  )}
                </div>

                {/* User Earnings */}
                <div>
                  <h4 style={{ marginBottom: 16 }}>Earnings ({userDetails.earnings?.length || 0})</h4>
                  {userDetails.earnings?.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Period</th>
                          <th>Property</th>
                          <th>Rental Income</th>
                          <th>Appreciation</th>
                          <th>Total</th>
                          <th>Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDetails.earnings.map((e) => (
                          <tr key={e.id}>
                            <td>{e.period_month}</td>
                            <td>{e.investments?.properties?.name}</td>
                            <td style={{ color: '#2E7D32' }}>{fmtCurrency(e.rental_income)}</td>
                            <td style={{ color: '#2E7D32' }}>{fmtCurrency(e.appreciation)}</td>
                            <td style={{ fontWeight: 600 }}>{fmtCurrency((e.rental_income || 0) + (e.appreciation || 0))}</td>
                            <td>{e.paid_at ? new Date(e.paid_at).toLocaleDateString() : 'Pending'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: 'var(--gray)' }}>No earnings yet</p>
                  )}
                </div>
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
                          <span className={`tx-badge tx-badge-${tx.type === 'deposit' || tx.type === 'income' ? 'in' : 'out'}`}>
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
            <h3 style={{ marginBottom: 24 }}>Edit User: {editingUser.first_name} {editingUser.last_name}</h3>
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
            <div className="form-group">
              <label className="form-label">Country</label>
              <input className="form-input" id="edit-country" defaultValue={editingUser.country || ''} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-gold" onClick={() => {
                handleUpdateUser(editingUser.id, {
                  investor_level: document.getElementById('edit-level').value,
                  kyc_status: document.getElementById('edit-kyc').value,
                  phone: document.getElementById('edit-phone').value,
                  bank_account: document.getElementById('edit-bank').value,
                  country: document.getElementById('edit-country').value
                });
              }}>
                Save Changes
              </button>
              <button className="btn btn-outline-dark" onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds/Earnings Modal */}
      {fundsModal.show && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setFundsModal({ show: false, type: '', userId: null })}>
          <div style={{
            background: 'var(--white)', padding: 32, maxWidth: 400, width: '90%',
            borderRadius: 8
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 24 }}>
              {fundsModal.type === 'earning' ? 'Add Earning' : fundsModal.type === 'credit' ? 'Add Funds' : 'Deduct Funds'}
            </h3>
            
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input className="form-input" id="fund-amount" type="number" step="0.01" placeholder="0.00" />
            </div>
            
            {fundsModal.type === 'earning' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Earning Type</label>
                  <select className="form-select" id="earning-type">
                    <option value="rental">Rental Income</option>
                    <option value="appreciation">Appreciation</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Period (YYYY-MM)</label>
                  <input className="form-input" id="earning-period" type="text" placeholder="2024-01" />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" id="fund-desc" placeholder="Reason for funds" />
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-gold" onClick={handleAddFunds}>
                {fundsModal.type === 'earning' ? 'Add Earning' : 'Add Funds'}
              </button>
              <button className="btn btn-outline-dark" onClick={() => setFundsModal({ show: false, type: '', userId: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

