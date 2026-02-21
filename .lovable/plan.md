

## Portal UI Cleanup & Gym Name in Header

### Changes

**1. Home tab -- remove "All Time" stat, make the two key stats bigger**

In `GymMemberPortal.tsx`:
- Remove the third stat card (All Time / Trophy)
- Switch from `grid-cols-3` to `grid-cols-2`
- Make the two remaining cards (Monthly Visits + Day Streak) larger with bigger progress rings (size 96 instead of 72) and bolder numbers
- Remove the `allTimeCount` query and data field since it's no longer needed
- Remove the `Trophy` import

**2. Check-in tab -- remove shareable card and share button**

In `GymPortalAttendance.tsx`:
- Remove the entire "Shareable Workout Card" section (the gradient card with screenshot prompt, lines 149-198)
- Remove the "Check in first" placeholder card for the share section (lines 201-207)
- Remove the `Share2`, `Camera` imports and the `cardRef` ref
- Remove the `handleShare` function and `gymInfo` state/fetch
- Keep the check-in button, confirmation, and the 3-stat strip (visits, streak, rank)

**3. Add gym name to the portal header**

In `PortalLayout.tsx`:
- Accept a new optional `gymName` prop
- Display it in the header next to "Member Portal" (or replace "Member Portal" with the gym name)

In `Portal.tsx`:
- Fetch the gym's company name using the `owner_user_id` from `company_profiles`
- Pass it down to `PortalLayout` as the `gymName` prop

### Files to Change

| File | Change |
|------|--------|
| `src/components/portal/gym/GymMemberPortal.tsx` | Remove all-time stat, switch to 2-col grid, enlarge remaining stat cards |
| `src/components/portal/gym/GymPortalAttendance.tsx` | Remove shareable workout card, share button, screenshot placeholder |
| `src/components/portal/PortalLayout.tsx` | Add optional `gymName` prop, display gym name in the header |
| `src/pages/Portal.tsx` | Fetch gym name from `company_profiles` and pass to `PortalLayout` |

