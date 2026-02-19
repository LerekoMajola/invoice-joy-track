import { useState, useEffect } from 'react';

interface GeoPricing {
  currency: string;
  symbol: string;
  rate: number;
  country: string;
  loading: boolean;
}

const COUNTRY_CURRENCY_MAP: Record<string, { currency: string; symbol: string; pegged: boolean }> = {
  LS: { currency: 'LSL', symbol: 'M', pegged: true },
  ZA: { currency: 'ZAR', symbol: 'R', pegged: true },
  SZ: { currency: 'SZL', symbol: 'E', pegged: true },
  NA: { currency: 'NAD', symbol: 'N$', pegged: true },
  BW: { currency: 'BWP', symbol: 'P', pegged: false },
};

const CACHE_KEY = 'geo_pricing_cache';

interface CachedData {
  currency: string;
  symbol: string;
  rate: number;
  country: string;
}

export function useGeoPricing(): GeoPricing {
  const [state, setState] = useState<GeoPricing>(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedData = JSON.parse(cached);
        return { ...parsed, loading: false };
      }
    } catch {}
    return { currency: 'LSL', symbol: 'M', rate: 1, country: '', loading: true };
  });

  useEffect(() => {
    // Already resolved from cache
    if (!state.loading) return;

    let cancelled = false;

    async function detect() {
      try {
        // 1. Detect country
        const geoRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
        if (!geoRes.ok) throw new Error('geo failed');
        const geo = await geoRes.json();
        const countryCode: string = geo.country_code ?? '';

        const mapped = COUNTRY_CURRENCY_MAP[countryCode];

        if (mapped && mapped.pegged) {
          // Pegged 1:1 to LSL — no rate fetch needed
          const result: CachedData = { currency: mapped.currency, symbol: mapped.symbol, rate: 1, country: countryCode };
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
          if (!cancelled) setState({ ...result, loading: false });
          return;
        }

        // 2. Need exchange rate (BWP or USD for rest-of-world)
        const rateRes = await fetch('https://open.er-api.com/v6/latest/ZAR', { signal: AbortSignal.timeout(5000) });
        if (!rateRes.ok) throw new Error('rate failed');
        const rateData = await rateRes.json();
        const rates: Record<string, number> = rateData.rates ?? {};

        if (mapped) {
          // Botswana
          const bwpRate = rates['BWP'] ?? 0.73;
          const result: CachedData = { currency: 'BWP', symbol: 'P', rate: bwpRate, country: countryCode };
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
          if (!cancelled) setState({ ...result, loading: false });
        } else {
          // Rest of world → USD
          const usdRate = rates['USD'] ?? 0.055;
          const result: CachedData = { currency: 'USD', symbol: '$', rate: usdRate, country: countryCode };
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
          if (!cancelled) setState({ ...result, loading: false });
        }
      } catch {
        // Fallback to LSL
        if (!cancelled) setState({ currency: 'LSL', symbol: 'M', rate: 1, country: '', loading: false });
      }
    }

    detect();
    return () => { cancelled = true; };
  }, [state.loading]);

  return state;
}

/**
 * Format a base LSL price into the visitor's local currency.
 */
export function formatGeoPrice(baseLSL: number, symbol: string, rate: number): string {
  const converted = baseLSL * rate;
  return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
