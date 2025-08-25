import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'moderator' | 'user';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: UserRole[];
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    roles: [],
  });

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data?.map(r => r.role as UserRole) || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({ ...prev, session, user: session?.user ?? null }));
        
        // Fetch roles for authenticated user
        if (session?.user) {
          setTimeout(async () => {
            const roles = await fetchUserRoles(session.user.id);
            setState(prev => ({ ...prev, roles, loading: false }));
          }, 0);
        } else {
          setState(prev => ({ ...prev, roles: [], loading: false }));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      
      if (session?.user) {
        const roles = await fetchUserRoles(session.user.id);
        setState(prev => ({ ...prev, roles, loading: false }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const hasRole = (role: UserRole): boolean => {
    return state.roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
  };
};