/**
 * Format a number as Maluti currency (M) with proper thousand separators and decimals
 * Example: formatMaluti(1234567.89) => "M1,234,567.89"
 */
export function formatMaluti(amount: number): string {
  return `M${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}
