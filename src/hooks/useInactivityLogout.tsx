import { useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { hasActiveEditing, lastEditingPingAt } from "@/lib/editingActivity";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const MAX_EXTENDED_SESSION = 8 * 60 * 60 * 1000; // 8 hours safety cap

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  // `input` (capture) catches typing inside dialogs/components that
  // stopPropagation on keydown — critical for keeping the session alive
  // while filling out quote/invoice forms.
  "input" as keyof WindowEventMap,
  "change" as keyof WindowEventMap,
];

export function useInactivityLogout(
  user: User | null,
  signOut: () => Promise<void>,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(INACTIVITY_TIMEOUT);
  const lastActiveRef = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());
  const loggingOutRef = useRef(false);

  useEffect(() => {
    if (!user) {
      loggingOutRef.current = false;
      return;
    }

    sessionStartRef.current = Date.now();

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
      timerRef.current = setTimeout(handleTimeout, duration);
    };

    const handleTimeout = () => {
      // Guard: if the user is actively editing a document (or has pinged
      // editing activity within the last timeout window), extend the session
      // instead of logging out — up to the 8h safety cap.
      const sessionAge = Date.now() - sessionStartRef.current;
      const recentlyEditing =
        Date.now() - lastEditingPingAt() < INACTIVITY_TIMEOUT;

      if (
        (hasActiveEditing() || recentlyEditing) &&
        sessionAge < MAX_EXTENDED_SESSION
      ) {
        startTimer(INACTIVITY_TIMEOUT);
        return;
      }
      logout();
    };

    const resetTimer = () => {
      startTimer(INACTIVITY_TIMEOUT);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        const elapsed = Date.now() - lastActiveRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        if (remainingRef.current <= 0) {
          handleTimeout();
        } else {
          startTimer(remainingRef.current);
        }
      }
    };

    resetTimer();

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true, capture: true } as AddEventListenerOptions),
    );
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, resetTimer, { capture: true } as EventListenerOptions),
      );
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user, signOut]);
}
