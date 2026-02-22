

## Fix Phone Input Country Selection

### Problem
When selecting a country code in the phone input (e.g., South Africa +27), if no phone number has been typed yet, the selection immediately reverts back to Lesotho. This happens because the component sends an empty string `''` when there are no digits, and on re-render it falls back to the default country (Lesotho).

### Root Cause
In `src/components/ui/phone-input.tsx`, the `handleCountrySelect` function (line 105) only stores the dial code when digits exist:
```
onChange(digits ? `${country.dial}${digits}` : '');
```
When `digits` is empty, it sends `''`, which causes the component to fall back to `defaultCountry` (Lesotho).

The same issue exists in `handleLocalChange` (line 96) -- clearing the input resets the country.

### Fix
**File: `src/components/ui/phone-input.tsx`**

1. In `handleCountrySelect`: Always store the dial code, even with no digits typed:
   - Change to: `onChange(country.dial + digits)`
   - This keeps the selected country code in the value at all times

2. In `handleLocalChange`: Preserve the dial code when clearing digits:
   - Change to: `onChange(selectedCountry.dial + digits)` instead of `onChange('')`

These two small changes ensure the country selection persists regardless of whether a phone number has been entered.

### Technical Details

| Location | Current | Fixed |
|----------|---------|-------|
| `handleCountrySelect` (line 105) | `onChange(digits ? ... : '')` | `onChange(country.dial + digits)` |
| `handleLocalChange` (line 96) | `onChange(digits ? ... : '')` | `onChange(selectedCountry.dial + digits)` |

