import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getProfile } from '@lib/supabase';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);           // Supabase auth user
  const [profile, setProfile] = useState(null);     // profiles table row
  const [authLoading, setAuthLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // ── Notifications ──────────────────────────────────────────────────────────
  const addNotification = useCallback((msg, duration = 4000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await getProfile(userId);
    if (data) setProfile(data);
  };

  // ── Demo/fallback user (when Supabase is not configured) ───────────────────
  // This lets the UI work without a live Supabase connection.
  const [demoUser, setDemoUser] = useState(null);

  const loginDemo = (userData) => {
    setDemoUser({
      name: userData.name || 'Demo Investor',
      email: userData.email || 'demo@realtyinvestors.com',
      level: 'Verified Investor',
      invested: 22500,
      earnings: 2890,
      roi: 12.8,
    });
  };

  const logoutDemo = () => setDemoUser(null);

  const activeUser = user || demoUser;
  const activeProfile = profile || demoUser;

  return (
    <AppContext.Provider
      value={{
        // Auth state
        user: activeUser,
        profile: activeProfile,
        authLoading,
        // Demo helpers (no Supabase)
        loginDemo,
        logoutDemo,
        // Supabase setters
        setUser,
        setProfile,
        // Notifications
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
