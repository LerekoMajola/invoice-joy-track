

# Fix Solutions Card Pricing

## Problem

All six industry cards on the landing page show "from R199/mo" instead of the correct starting prices. The currency should also be "M" (Maluti), not "R" (Rand).

## Fix

Update the `price` field in the `industries` array in `src/components/landing/Solutions.tsx`:

| Industry | Current | Correct |
|----------|---------|---------|
| Business | R199/mo | M350/mo |
| Workshop | R199/mo | M450/mo |
| School | R199/mo | M720/mo |
| Legal | R199/mo | M500/mo |
| Tool Hire | R199/mo | M400/mo |
| Guest House | M650/mo | M650/mo (already correct) |

## Files Changed

| File | Change |
|------|--------|
| `src/components/landing/Solutions.tsx` | Update `price` values in the `industries` array (lines 21, 29, 37, 45, 53) |

Single file, 5 line changes.

