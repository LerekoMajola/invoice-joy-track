import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  // 1) Auth state (MUST be sync inside onAuthStateChange callback)
  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;
      setSession(prev => {
        if (prev?.access_token === nextSession?.access_token) return prev;
        return nextSession ?? null;
      });
      setUser(prev => {
        const nextUser = nextSession?.user ?? null;
        if (prev?.id === nextUser?.id) return prev;
        return nextUser;
      });

      // Only re-check role for identity-changing events, NOT background token refreshes
      if (event !== 'TOKEN_REFRESHED') {
        if (nextSession?.user) {
          setRoleLoading(true);
        } else {
          setRoleLoading(false);
          setIsAdmin(false);
        }
      }

      setAuthLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!isMounted) return;
        setSession(prev => {
          if (prev?.access_token === initialSession?.access_token) return prev;
          return initialSession ?? null;
        });
        setUser(prev => {
          const nextUser = initialSession?.user ?? null;
          if (prev?.id === nextUser?.id) return prev;
          return nextUser;
        });

        if (initialSession?.user) {
          setRoleLoading(true);
        } else {
          setRoleLoading(false);
          setIsAdmin(false);
        }

        setAuthLoading(false);
      })
      .catch((err) => {
        console.error("Error getting session:", err);
        if (isMounted) setAuthLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2) Role loading (kept OUTSIDE auth callback to avoid deadlocks)
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setIsAdmin(false);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "super_admin")
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Exception checking admin role:", err);
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      // Make sure we never leave the app stuck "loading" during fast user changes.
      setRoleLoading(false);
    };
  }, [user?.id]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Auto-logout after 5 minutes of inactivity
  useInactivityLogout(user, signOut);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      session,
      isAdmin,
      loading: authLoading || roleLoading,
      signOut,
    };
  }, [user, session, isAdmin, authLoading, roleLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
