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
  const remainingRef = useRef(INACTIVITY_TIMEOUT);
  const lastActiveRef = useRef(Date.now());
  const loggingOutRef = useRef(false);

  useEffect(() => {
    if (!user) {
      loggingOutRef.current = false;
      return;
    }

    const logout = async () => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;
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

    const startTimer = (duration: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      lastActiveRef.current = Date.now();
      remainingRef.current = duration;
      timerRef.current = setTimeout(logout, duration);
    };

    const resetTimer = () => {
      startTimer(INACTIVITY_TIMEOUT);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        // Pause: save remaining time
        const elapsed = Date.now() - lastActiveRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        // Resume with remaining time
        if (remainingRef.current <= 0) {
          logout();
        } else {
          startTimer(remainingRef.current);
        }
      }
    };

    // Start initial timer
    resetTimer();

    // Listen for activity
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true }),
    );
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, resetTimer),
      );
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user, signOut]);
}
