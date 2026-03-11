import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signOut as authSignOut } from '../lib/auth';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signUpWithEmail(email, password);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signInWithEmail(email, password);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign in failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await authSignOut();
    } catch (err: unknown) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    clearError,
    supabase,
  };
}
