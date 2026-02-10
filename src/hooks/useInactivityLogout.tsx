import { useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

export function useInactivityLogout(
  user: User | null,
  signOut: () => Promise<void>,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    const logout = async () => {
      try {
        await signOut();
      } catch {
        // ignore – we're force-navigating anyway
      }
      toast({
        title: "Session expired",
        description: "You were logged out due to inactivity.",
      });
      window.location.href = "/auth";
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, INACTIVITY_TIMEOUT);
    };

    // Start initial timer
    resetTimer();

    // Listen for activity
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true }),
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, resetTimer),
      );
    };
  }, [user, signOut]);
}
