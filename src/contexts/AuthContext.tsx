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
  // Initialize from sessionStorage cache for instant rendering on reload
  const cachedRole = (() => {
    try {
      const cached = sessionStorage.getItem('admin_role_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.userId) return parsed;
      }
    } catch {}
    return null;
  })();

  const [isAdmin, setIsAdmin] = useState(cachedRole?.isAdmin ?? false);

  const [authLoading, setAuthLoading] = useState(true);
  // If we have a cached role, skip blocking on role loading
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
          // Only block on role loading if we don't have a cache for this user
          const hasCachedRole = (() => {
            try {
              const c = sessionStorage.getItem('admin_role_cache');
              if (c) { const p = JSON.parse(c); return p.userId === nextSession.user.id; }
            } catch {}
            return false;
          })();
          if (!hasCachedRole) setRoleLoading(true);
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
          // Only block on role loading if we don't have a cache for this user
          const hasCachedRole = (() => {
            try {
              const c = sessionStorage.getItem('admin_role_cache');
              if (c) { const p = JSON.parse(c); return p.userId === initialSession.user.id; }
            } catch {}
            return false;
          })();
          if (!hasCachedRole) setRoleLoading(true);
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

    // If we have a valid cache for this user, use it and skip the network call
    const cachedForUser = (() => {
      try {
        const c = sessionStorage.getItem('admin_role_cache');
        if (c) { const p = JSON.parse(c); if (p.userId === user.id) return p; }
      } catch {}
      return null;
    })();

    if (cachedForUser) {
      setIsAdmin(cachedForUser.isAdmin);
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
          sessionStorage.removeItem('admin_role_cache');
        } else {
          const adminVal = !!data;
          setIsAdmin(adminVal);
          try {
            sessionStorage.setItem('admin_role_cache', JSON.stringify({ userId: user.id, isAdmin: adminVal }));
          } catch {}
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
