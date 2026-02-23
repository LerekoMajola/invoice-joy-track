

## Enhance Package Switcher Modal on Billing Page

### What Changes

Three improvements to the Switch Package dialog in `src/pages/Billing.tsx`:

1. **Gradient color on the current package card** -- The tier matching the user's current subscription gets a gradient border/background treatment (using `var(--gradient-primary)`) instead of a plain primary border.

2. **Confirmation step before sending** -- Clicking a tier no longer immediately sends the request. Instead, it selects the tier and shows an inline confirmation panel at the bottom of the dialog: "Switch to [Tier Name] at [price]/mo?" with "Confirm" and "Cancel" buttons. Only clicking "Confirm" triggers the notification to admin.

3. **Match landing page card design** -- Redesign each tier card in the dialog to match the `PricingCard` layout from `PricingTable.tsx`:
   - Centered tier name and description at the top
   - Large bold price in the middle
   - Feature list with check/minus icons (all included features shown, not just first 5)
   - "Popular" badge positioned at the top center like the landing page
   - `is_popular` tier gets `shadow-glow-md` and a slight scale-up

### Technical Details

**File: `src/pages/Billing.tsx`**

- Add new state: `confirmTier` (the tier the user clicked, or null)
- On tier card click: set `confirmTier` to that tier (don't send request yet)
- Show a sticky confirmation bar at the bottom of the dialog when `confirmTier` is set
- On "Confirm": call existing `handleSwitchRequest(confirmTier)`, then clear `confirmTier`
- On "Cancel": clear `confirmTier`
- Restyle each tier card to mirror `PricingCard`:
  - Centered layout with `text-center`
  - Price displayed as large text with currency formatting
  - Full feature list with `Check`/`Minus` icons
  - Popular badge absolutely positioned at top
- Current package card: add gradient background overlay and gradient border styling
- Widen dialog to `max-w-4xl` with a responsive grid (`grid-cols-1 md:grid-cols-3`)

### Single File Changed

| File | Change |
|------|--------|
| `src/pages/Billing.tsx` | Add `confirmTier` state, confirmation step, redesign tier cards to match landing page pricing layout, gradient on current package |

