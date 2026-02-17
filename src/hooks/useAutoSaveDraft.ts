import { useState, useEffect, useCallback, useRef } from 'react';

const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface DraftEnvelope<T> {
  data: T;
  savedAt: number;
}

export function useAutoSaveDraft<T>(key: string, currentData: T) {
  const [restoredDraft, setRestoredDraft] = useState<{ data: T; savedAt: Date } | null>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const envelope: DraftEnvelope<T> = JSON.parse(raw);
      if (Date.now() - envelope.savedAt > DRAFT_EXPIRY_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return { data: envelope.data, savedAt: new Date(envelope.savedAt) };
    } catch {
      return null;
    }
  });

  const dataRef = useRef(currentData);
  dataRef.current = currentData;

  // Save on every change (debounced) and every 10 seconds
  useEffect(() => {
    const save = () => {
      try {
        const envelope: DraftEnvelope<T> = {
          data: dataRef.current,
          savedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(envelope));
      } catch {
        // localStorage full or unavailable — silently ignore
      }
    };

    // Debounced save on data change
    const debounceTimer = setTimeout(save, 1000);

    // Periodic save every 10 seconds
    const intervalTimer = setInterval(save, 10_000);

    return () => {
      clearTimeout(debounceTimer);
      clearInterval(intervalTimer);
    };
  }, [key, currentData]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setRestoredDraft(null);
  }, [key]);

  const dismissDraft = useCallback(() => {
    setRestoredDraft(null);
  }, []);

  return { restoredDraft, clearDraft, dismissDraft };
}
