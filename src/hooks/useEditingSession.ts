import { useEffect, useId } from "react";
import {
  registerEditing,
  unregisterEditing,
  pingEditingActivity,
} from "@/lib/editingActivity";

/**
 * Register that the user is actively editing a document while `active` is true.
 * Prevents the inactivity auto-logout from kicking in mid-entry.
 */
export function useEditingSession(active: boolean, id?: string) {
  const fallbackId = useId();
  const editorId = id ?? fallbackId;

  useEffect(() => {
    if (!active) return;
    registerEditing(editorId);
    return () => unregisterEditing(editorId);
  }, [active, editorId]);

  return pingEditingActivity;
}
