import { useApp } from '@context/AppContext';
import { signIn, signUp, signOut } from '@lib/supabase';

/**
 * Convenience hook exposing auth actions + state.
 * Falls back to demo mode when Supabase is not configured.
 */
export function useAuth() {
  const { user, profile, authLoading, loginDemo, logoutDemo, addNotification } = useApp();

  const login = async ({ email, password }) => {
    const { error } = await signIn({ email, password });
    if (error) {
      // Fallback: demo login for development
      loginDemo({ name: 'Demo Investor', email });
      return { error: null };
    }
    return { error };
  };

  const register = async ({ email, password, firstName, lastName, country }) => {
    const { error } = await signUp({ email, password, firstName, lastName, country });
    if (error) {
      // Fallback: demo signup
      loginDemo({ name: `${firstName} ${lastName}`, email });
      return { error: null };
    }
    return { error };
  };

  const logout = async () => {
    await signOut();
    logoutDemo();
  };

  return {
    user,
    profile,
    authLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    addNotification,
  };
}
