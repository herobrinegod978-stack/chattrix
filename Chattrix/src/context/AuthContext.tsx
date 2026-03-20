import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      
      if (data) {
        setUser(data as User);
      } else {
        // user profile doesn't exist yet, it's a new login
        setUser(null);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  }

  async function refreshUser() {
    if (session?.user?.id) {
      await fetchUserProfile(session.user.id);
    }
  }

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        localStorage.setItem('chattrix_session', 'true');
        fetchUserProfile(s.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        localStorage.removeItem('chattrix_session');
        setLoading(false);
      }
    }).catch(err => {
      console.error('Session retrieval failed:', err);
      if (mounted) setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!mounted) return;
        setSession(s);
        if (s?.user) {
          localStorage.setItem('chattrix_session', 'true');
          setLoading(true);
          await fetchUserProfile(s.user.id);
          // Update last_login
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', s.user.id);
          if (mounted) setLoading(false);
        } else {
          setUser(null);
          localStorage.removeItem('chattrix_session');
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
}
