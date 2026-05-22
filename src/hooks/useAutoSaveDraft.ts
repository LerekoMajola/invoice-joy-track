import { useState, useEffect, useCallback, useRef } from 'react';

const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface DraftEnvelope<T> {
  data: T;
  savedAt: number;
}

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveDraftOptions<T> {
  /** Persist to the backend periodically. Return value ignored; throw to mark error. */
  onRemoteSave?: (data: T) => Promise<void>;
  /** Predicate to decide whether the current data is worth remote-saving. */
  shouldRemoteSave?: (data: T) => boolean;
  /** Status change reporter for UI indicators. */
  onStatusChange?: (status: AutoSaveStatus, lastSavedAt: Date | null) => void;
  /** Remote save interval in ms. Default 20s. */
  remoteIntervalMs?: number;
}

export function useAutoSaveDraft<T>(
  key: string,
  currentData: T,
  options: UseAutoSaveDraftOptions<T> = {}
) {
  const { onRemoteSave, shouldRemoteSave, onStatusChange, remoteIntervalMs = 20_000 } = options;

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

  const onRemoteSaveRef = useRef(onRemoteSave);
  onRemoteSaveRef.current = onRemoteSave;
  const shouldRemoteSaveRef = useRef(shouldRemoteSave);
  shouldRemoteSaveRef.current = shouldRemoteSave;
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  const lastRemoteHashRef = useRef<string>('');
  const inFlightRef = useRef<boolean>(false);

  // Local (fast) save — debounced on change + every 10s
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

    const debounceTimer = setTimeout(save, 1000);
    const intervalTimer = setInterval(save, 10_000);

    return () => {
      clearTimeout(debounceTimer);
      clearInterval(intervalTimer);
    };
  }, [key, currentData]);

  // Remote (durable) save — periodic, only on change, only when worth it
  useEffect(() => {
    if (!onRemoteSave) return;

    const tick = async () => {
      if (inFlightRef.current) return;
      const data = dataRef.current;
      const shouldSave = shouldRemoteSaveRef.current;
      if (shouldSave && !shouldSave(data)) return;

      let hash: string;
      try {
        hash = JSON.stringify(data);
      } catch {
        return;
      }
      if (hash === lastRemoteHashRef.current) return;

      inFlightRef.current = true;
      onStatusChangeRef.current?.('saving', null);
      try {
        await onRemoteSaveRef.current!(data);
        lastRemoteHashRef.current = hash;
        onStatusChangeRef.current?.('saved', new Date());
      } catch (err) {
        console.error('[useAutoSaveDraft] remote save failed', err);
        onStatusChangeRef.current?.('error', null);
      } finally {
        inFlightRef.current = false;
      }
    };

    const timer = setInterval(tick, remoteIntervalMs);
    return () => clearInterval(timer);
  }, [key, onRemoteSave, remoteIntervalMs]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setRestoredDraft(null);
    lastRemoteHashRef.current = '';
  }, [key]);

  const dismissDraft = useCallback(() => {
    setRestoredDraft(null);
  }, []);

  return { restoredDraft, clearDraft, dismissDraft };
}
