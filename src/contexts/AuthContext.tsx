import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

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
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      // IMPORTANT: prevent premature redirects by ensuring role state is considered "loading"
      // as soon as we have a user (role effect runs after render).
      if (nextSession?.user) {
        setRoleLoading(true);
      } else {
        setRoleLoading(false);
        setIsAdmin(false);
      }

      setAuthLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!isMounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

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
