
## Auto-Detect Country and Show Local Currency on Pricing

### Overview
Detect the visitor's country using a free IP geolocation API, then display all pricing in their local currency. Since the base prices are in LSL (Lesotho Loti), which is pegged 1:1 to ZAR, the conversion is straightforward for most Southern African currencies.

### Currency Mapping

| Country | Currency | Symbol | Rate vs LSL/ZAR |
|---------|----------|--------|-----------------|
| Lesotho | LSL | M | 1:1 |
| South Africa | ZAR | R | 1:1 |
| eSwatini | SZL | E | 1:1 |
| Namibia | NAD | N$ | 1:1 |
| Botswana | BWP | P | ~0.73 (fetched live) |
| Rest of world | USD | $ | fetched live via ZAR/USD rate |

### Implementation

**1. New hook: `src/hooks/useGeoPricing.ts`**
- On mount, call a free geolocation API (e.g., `https://ipapi.co/json/`) to get the visitor's country code.
- Map country code to currency: LS->LSL, ZA->ZAR, BW->BWP, SZ->SZL, NA->NAD, else->USD.
- For LSL/ZAR/SZL/NAD: rate = 1 (all pegged).
- For BWP and USD: fetch a live exchange rate from a free API (e.g., `https://open.er-api.com/v6/latest/ZAR`) to get ZAR->BWP and ZAR->USD rates.
- Cache the result in `sessionStorage` so repeat visits don't re-fetch.
- Returns: `{ currency, symbol, rate, country, loading }`.

**2. Update `src/components/landing/PricingTable.tsx`**
- Import and use `useGeoPricing`.
- Replace `formatMaluti(tier.price)` with a local formatter that multiplies the base price by the exchange rate and prepends the detected currency symbol.
- Show a small note under the price like "Prices shown in ZAR" with a subtle country flag indicator.
- While loading, show a skeleton/spinner on the price area.

**3. Update `src/pages/About.tsx`**
- Same treatment for the pricing table in the About page (the `industries` array with hardcoded `price: 'M350'` etc.).
- Use the same `useGeoPricing` hook to convert and display local currency.

**4. Update `src/components/landing/Coverage.tsx`**
- No changes needed -- this is the country display section, not pricing.

### Technical Details

- The geolocation call is fire-and-forget with a fallback to LSL if it fails.
- Exchange rates are cached in `sessionStorage` for the browser session to avoid repeated API calls.
- The base prices remain in LSL in the source code; conversion is display-only.
- Pegged currencies (ZAR, SZL, NAD) use a hardcoded 1:1 rate -- no API call needed.
- Only BWP and USD (fallback for rest-of-world) need a live rate lookup.
