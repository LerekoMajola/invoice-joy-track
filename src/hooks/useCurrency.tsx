import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { formatCurrency as formatCurrencyBase } from '@/lib/currency';
import { useCallback } from 'react';

/**
 * Hook that returns a currency formatter bound to the active company's currency.
 * Usage: const { fc } = useCurrency();
 *        fc(1234.56) => "M1,234.56" (or whatever the active currency is)
 */
export function useCurrency() {
  const { currency } = useActiveCompany();

  const fc = useCallback(
    (amount: number) => formatCurrencyBase(amount, currency),
    [currency]
  );

  return { currency, fc, formatCurrency: fc };
}
