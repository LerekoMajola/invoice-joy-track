
## Redesign: Gym Portal "Plan" Tab — Minimalist & Pride-Inducing

### Goal

Replace the current cluttered "Billing & Payment" layout (which prominently shows a large proof-of-payment image thumbnail that takes up significant screen space) with a clean, minimalist design that makes the member feel proud and confident about their health investment.

### Design Philosophy

- **Hero membership card**: Bold, full-width card with the plan name in large type — the member's plan name front and center like a badge of honor.
- **Clean status ring / countdown**: A simple circular or strip progress showing days remaining — not percentage elapsed which feels negative.
- **Proof of Payment**: Collapsed by default into a single small "Receipt" chip/button — no image preview visible until tapped. This reclaims the entire lower half of the screen.
- **Motivational tone**: Replace "Amount Paid" with "Invested in your health" framing. Replace dry labels with confidence-building copy.
- **History**: Keep the history section but make it ultra-compact — a simple timeline of past plans, no cards.

### Layout (top to bottom)

```text
┌─────────────────────────────────┐
│  [Active badge]                 │
│  Ball Breaker              ✓    │  ← Large plan name, bold
│  19 Feb – 21 Mar 2026           │
│                                 │
│  28 days left  ══════╌╌╌╌  7%   │  ← Slim progress strip
│                                 │
│  Invested in your health        │
│  M 1,000.00                     │  ← Big green number
└─────────────────────────────────┘

  [📎 Receipt attached ✓]         ← Compact chip, tap to view full-screen modal
  [+ Attach Receipt]              ← Only if no POP yet

  ── Past Plans ──────────────────
  Ball Breaker  Jan–Feb 2026  Expired
```

### What Changes

| Element | Before | After |
|---|---|---|
| POP image thumbnail | Always shown, aspect-video height | Hidden — single small chip button |
| "Billing & Payment" header | Plain h2 | Removed — the card IS the header |
| Amount label | "Amount Paid" | "Invested in your health" |
| Progress bar | Shows % elapsed (negative framing) | Shows days remaining prominently |
| Background | White cards | Dark gradient hero card for active plan (premium feel) |
| History | Card per item | Single-line timeline rows |

### Technical Changes

**File:** `src/components/portal/gym/GymPortalMembership.tsx`

- Replace the active subscription `Card` with a dark-gradient hero card (`bg-gradient-to-br from-gray-900 to-primary/80`) that uses white text.
- Collapse the POP section: if `pop_url` exists, show a small green badge/button "Receipt attached ✓". Tapping it opens the existing full-screen proof modal — the image stays hidden otherwise.
- If no POP: show a minimal ghost button "Attach Receipt" (no explanatory paragraph, just the button).
- Remove the image thumbnail entirely from the main view.
- Rename the "Billing & Payment" title to nothing (remove it — the hero card communicates everything).
- Update "Amount Paid" to "Invested in your health".
- Make history a compact list without card wrappers — just separator-divided rows.

No database changes, no backend changes. UI only.
