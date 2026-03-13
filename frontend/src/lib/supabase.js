import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[RealtyInvestors] Supabase environment variables are not set. ' +
    'Copy frontend/.env.example to frontend/.env and fill in your credentials.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// ── Auth helpers ──────────────────────────────────────────────────────────────

export const signUp = async ({ email, password, firstName, lastName, country }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, country },
    },
  });
  return { data, error };
};

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// ── Database helpers ──────────────────────────────────────────────────────────────

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const getProperties = async (filters = {}) => {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filters.type) query = query.ilike('type', `%${filters.type}%`);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.roiMin) query = query.gte('roi', filters.roiMin);
  if (filters.roiMax) query = query.lte('roi', filters.roiMax);

  const { data, error } = await query;
  return { data, error };
};

export const getProperty = async (id) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*, documents(*)')
    .eq('id', id)
    .single();
  return { data, error };
};

export const getUserInvestments = async (userId) => {
  const { data, error } = await supabase
    .from('investments')
    .select('*, properties(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getUserTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getUserEarnings = async (userId) => {
  const { data, error } = await supabase
    .from('earnings')
    .select('*, investments(*, properties(name))')
    .eq('user_id', userId)
    .order('period_month', { ascending: false });
  return { data, error };
};

export const createInvestment = async ({ userId, propertyId, amount }) => {
  const { data, error } = await supabase
    .from('investments')
    .insert({ user_id: userId, property_id: propertyId, amount_invested: amount })
    .select()
    .single();
  return { data, error };
};

export const requestWithdrawal = async ({ userId, amount }) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'withdrawal',
      amount: -Math.abs(amount),
      status: 'pending',
      description: 'Withdrawal request',
    })
    .select()
    .single();
  return { data, error };
};

export const getChatMessages = async (userId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return { data, error };
};

export const sendChatMessage = async ({ userId, content, fromAdmin = false }) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ user_id: userId, content, from_admin: fromAdmin })
    .select()
    .single();
  return { data, error };
};

export const subscribeToMessages = (userId, callback) => {
  return supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

// Check if current user is admin
export const checkIsAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  return data?.is_admin || false;
};

// Get all users (admin only)
export const getAllUsers = async (filters = {}) => {
  let query = supabase
    .from('profiles')
    .select('*, auth.users!inner(email, created_at)')
    .order('created_at', { ascending: false });

  if (filters.kyc_status) query = query.eq('kyc_status', filters.kyc_status);
  if (filters.investor_level) query = query.eq('investor_level', filters.investor_level);

  const { data, error } = await query;
  return { data, error };
};

// Get all investments (admin)
export const getAllInvestments = async (filters = {}) => {
  let query = supabase
    .from('investments')
    .select('*, profiles(*), properties(*)')
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.payment_status) query = query.eq('payment_status', filters.payment_status);
  if (filters.user_id) query = query.eq('user_id', filters.user_id);

  const { data, error } = await query;
  return { data, error };
};

// Update investment (admin can update payment status)
export const updateInvestment = async (id, updates) => {
  const { data, error } = await supabase
    .from('investments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// Delete investment (admin)
export const deleteInvestment = async (id) => {
  const { error } = await supabase
    .from('investments')
    .delete()
    .eq('id', id);
  return { error };
};

// Mark investment as paid
export const markInvestmentAsPaid = async (investmentId) => {
  const { data, error } = await supabase
    .from('investments')
    .update({ 
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      status: 'active'
    })
    .eq('id', investmentId)
    .select()
    .single();
  return { data, error };
};

// Update property (admin)
export const updateProperty = async (id, updates) => {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// Create property (admin)
export const createProperty = async (propertyData) => {
  const { data, error } = await supabase
    .from('properties')
    .insert(propertyData)
    .select()
    .single();
  return { data, error };
};

// Delete property (admin)
export const deleteProperty = async (id) => {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);
  return { error };
};

// Update user profile (admin)
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Get all transactions (admin)
export const getAllTransactions = async (filters = {}) => {
  let query = supabase
    .from('transactions')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false });

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.user_id) query = query.eq('user_id', filters.user_id);

  const { data, error } = await query;
  return { data, error };
};

// Update transaction status (admin)
export const updateTransaction = async (id, updates) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// Delete transaction (admin)
export const deleteTransaction = async (id) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  return { error };
};

// Get all messages for admin (grouped by user)
export const getAllChatThreads = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false });
  return { data, error };
};

// Get user's unread message count
export const getUnreadMessageCount = async (userId) => {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
    .eq('from_admin', true);
  return { count, error };
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId)
    .select()
    .single();
  return { data, error };
};

// Create admin activity log
export const logAdminActivity = async ({ action, targetType, targetId, details }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('admin_activity_log')
    .insert({
      admin_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      details
    })
    .select()
    .single();
  return { data, error };
};

// Get dashboard stats (admin)
export const getAdminStats = async () => {
  // Get counts
  const [usersRes, investmentsRes, propertiesRes, transactionsRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('investments').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('transactions').select('*', { count: 'exact', head: true }),
  ]);

  // Get total investment amount
  const { data: investmentData } = await supabase
    .from('investments')
    .select('amount_invested');

  const totalInvested = investmentData?.reduce((sum, inv) => sum + (inv.amount_invested || 0), 0) || 0;

  // Get pending payouts
  const { data: pendingData } = await supabase
    .from('investments')
    .select('amount_invested')
    .eq('payment_status', 'unpaid');

  const pendingPayouts = pendingData?.reduce((sum, inv) => sum + (inv.amount_invested || 0), 0) || 0;

  return {
    totalUsers: usersRes.count || 0,
    totalInvestments: investmentsRes.count || 0,
    totalProperties: propertiesRes.count || 0,
    totalTransactions: transactionsRes.count || 0,
    totalInvested,
    pendingPayouts
  };
};

// Subscribe to new investments (admin)
export const subscribeToInvestments = (callback) => {
  return supabase
    .channel('admin:investments')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'investments' },
      (payload) => callback(payload.new)
    )
    .subscribe();
};

// Subscribe to new messages (admin)
export const subscribeToNewMessages = (callback) => {
  return supabase
    .channel('admin:messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => callback(payload.new)
    )
    .subscribe();
};

// Subscribe to profile changes (admin - for realtime users tab)
export const subscribeToProfiles = (callback) => {
  return supabase
    .channel('admin:profiles')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles' },
      (payload) => callback(payload)
    )
    .subscribe();
};

// ─────────────────────────────────────────────────────────────────────────────
// USER DETAIL FUNCTIONS (ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

// Get full user details including all related data
export const getUserDetails = async (userId) => {
  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Get investments with property details
  const { data: investments } = await supabase
    .from('investments')
    .select('*, properties(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get earnings
  const { data: earnings } = await supabase
    .from('earnings')
    .select('*, investments(*, properties(name))')
    .eq('user_id', userId)
    .order('period_month', { ascending: false });

  // Get messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  // Calculate totals
  const totalInvested = investments?.reduce((sum, inv) => sum + (inv.amount_invested || 0), 0) || 0;
  const totalEarnings = earnings?.reduce((sum, e) => sum + ((e.rental_income || 0) + (e.appreciation || 0)), 0) || 0;
  const totalWithdrawn = transactions
    ?.filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
  
  const balance = totalEarnings - totalWithdrawn;

  return {
    profile,
    investments,
    transactions,
    earnings,
    messages,
    stats: {
      totalInvested,
      totalEarnings,
      totalWithdrawn,
      balance,
      investmentCount: investments?.length || 0,
      transactionCount: transactions?.length || 0
    }
  };
};

// Update user balance (admin)
export const updateUserBalance = async (userId, amount, type, description) => {
  // Create a transaction record
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      amount: type === 'credit' ? Math.abs(amount) : -Math.abs(amount),
      status: 'completed',
      description
    })
    .select()
    .single();
  return { data, error };
};

// Add earning to user (admin)
export const addUserEarning = async (userId, investmentId, amount, type, period) => {
  const { data, error } = await supabase
    .from('earnings')
    .insert({
      user_id: userId,
      investment_id: investmentId,
      rental_income: type === 'rental' ? amount : 0,
      appreciation: type === 'appreciation' ? amount : 0,
      period_month: period,
      paid_at: new Date().toISOString()
    })
    .select()
    .single();
  return { data, error };
};

// Update earning (admin)
export const updateEarning = async (id, updates) => {
  const { data, error } = await supabase
    .from('earnings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// Delete earning (admin)
export const deleteEarning = async (id) => {
  const { error } = await supabase
    .from('earnings')
    .delete()
    .eq('id', id);
  return { error };
};

// Update user KYC status
export const updateUserKYC = async (userId, status, notes = '') => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      kyc_status: status,
      kyc_notes: notes,
      kyc_verified_at: status === 'verified' ? new Date().toISOString() : null
    })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Update user investor level
export const updateUserLevel = async (userId, level) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ investor_level: level })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Get user balance (real-time)
export const getUserBalance = async (userId) => {
  // Get all transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'completed');

  // Get all earnings
  const { data: earnings } = await supabase
    .from('earnings')
    .select('rental_income, appreciation')
    .eq('user_id', userId);

  const totalFromTransactions = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const totalEarnings = earnings?.reduce((sum, e) => sum + ((e.rental_income || 0) + (e.appreciation || 0)), 0) || 0;

  return {
    balance: totalFromTransactions + totalEarnings,
    totalInvested: Math.abs(totalFromTransactions < 0 ? totalFromTransactions : 0),
    totalEarnings
  };
};

// Subscribe to user-specific changes
export const subscribeToUserChanges = (userId, callback) => {
  const channel = supabase
    .channel(`user:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
      (payload) => callback('profile', payload.new)
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, 
      (payload) => callback('transaction', payload.new)
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'investments', filter: `user_id=eq.${userId}` }, 
      (payload) => callback('investment', payload.new)
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'earnings', filter: `user_id=eq.${userId}` }, 
      (payload) => callback('earning', payload.new)
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `user_id=eq.${userId}` }, 
      (payload) => callback('message', payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};

// Get chat messages for a specific user
export const getUserChatMessages = async (userId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return { data, error };
};

// Subscribe to chat messages for a user
export const subscribeToChat = (userId, callback) => {
  const channel = supabase
    .channel(`chat:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
};

