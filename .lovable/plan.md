

## Fix: Trigger Tender Link Alerts on Day 2 (Not Day 3)

### Problem
The current UI shows "Recently checked" (green) for days 0, 1, and 2 (`<= 2`). This means the status only turns orange on day 3, not day 2 as agreed.

### Changes

**1. `src/components/dashboard/TenderSourceLinks.tsx`** -- Adjust thresholds so day 2 triggers the orange "Check soon" status:

| Current | New |
|---------|-----|
| `daysSinceVisit <= 2` -> green | `daysSinceVisit <= 1` -> green (day 0-1 only) |
| `daysSinceVisit <= 5` -> orange | `daysSinceVisit <= 4` -> orange (day 2-4) |
| `> 5` -> red | `> 4` -> red (day 5+) |

This means:
- **Day 0-1**: Green ("Recently checked")
- **Day 2-4**: Orange ("Check soon") -- notification triggers here
- **Day 5+**: Red ("Needs attention")

The edge function (`check-tender-links`) already correctly uses a 2-day threshold for generating notifications, so no backend changes needed.
