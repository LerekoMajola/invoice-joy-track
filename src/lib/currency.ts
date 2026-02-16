/**
 * Currency configuration and formatting utilities.
 * Each company profile can have its own currency setting.
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'LSL', symbol: 'M', name: 'Lesotho Loti' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical' },
  { code: 'SZL', symbol: 'E', name: 'Eswatini Lilangeni' },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
];

const currencyMap = new Map(SUPPORTED_CURRENCIES.map(c => [c.code, c]));

/**
 * Get the symbol for a currency code. Falls back to the code itself if not found.
 */
export function getCurrencySymbol(code: string): string {
  return currencyMap.get(code)?.symbol ?? code;
}

/**
 * Format a number with currency symbol and proper thousand separators.
 * Example: formatCurrency(1234567.89, 'LSL') => "M1,234,567.89"
 * Example: formatCurrency(1234567.89, 'USD') => "$1,234,567.89"
 */
export function formatCurrency(amount: number, currencyCode: string = 'LSL'): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * @deprecated Use formatCurrency instead. Kept for backward compatibility during migration.
 */
export function formatMaluti(amount: number): string {
  return formatCurrency(amount, 'LSL');
}
