import { useState, useCallback } from 'react';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';

export type OptionalFeatureKey = 'invoices' | 'drafts';

const STORAGE_KEY = 'optional_features';

function getStoredFeatures(companyId: string): Record<OptionalFeatureKey, boolean> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${companyId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Defaults: both off
  return { invoices: false, drafts: false };
}

function setStoredFeatures(companyId: string, features: Record<OptionalFeatureKey, boolean>) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${companyId}`, JSON.stringify(features));
  } catch {}
}

export function useOptionalFeatures() {
  const { activeCompanyId } = useActiveCompany();
  const key = activeCompanyId ?? 'default';

  const [features, setFeatures] = useState<Record<OptionalFeatureKey, boolean>>(
    () => getStoredFeatures(key)
  );

  const toggle = useCallback((feature: OptionalFeatureKey, value: boolean) => {
    setFeatures(prev => {
      const next = { ...prev, [feature]: value };
      setStoredFeatures(key, next);
      return next;
    });
  }, [key]);

  const isEnabled = useCallback(
    (feature: OptionalFeatureKey) => features[feature],
    [features]
  );

  return { features, toggle, isEnabled };
}
