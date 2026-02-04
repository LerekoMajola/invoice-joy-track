import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'super_admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error('Exception checking admin role:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (!isMounted) return;

      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        
        // Check admin role before setting loading to false
        const adminStatus = await checkAdminRole(initialSession.user.id);
        if (isMounted) {
          setIsAdmin(adminStatus);
          setLoading(false);
        }
      } else {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          
          // Check admin role on auth state change
          const adminStatus = await checkAdminRole(newSession.user.id);
          if (isMounted) {
            setIsAdmin(adminStatus);
            setLoading(false);
          }
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, isAdmin, loading, signOut };
}
