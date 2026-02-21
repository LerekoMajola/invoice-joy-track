

## Fix: Multiple Daily Check-ins and Accurate Stats

### Problem

Two core bugs prevent the check-in system from working correctly:

1. Both the Home tab and Check-In tab use `.maybeSingle()` to query today's attendance. Since you can check in multiple times per day, this query fails when there is more than one record, returning null -- making the Home page say "Not checked in yet" even after checking in.

2. After one check-in, the Check-In tab hides the button entirely for the rest of the day. There is no way to check in again for a second session.

### Solution

**GymMemberPortal.tsx (Home tab):**
- Change the today query from `.maybeSingle()` to `.select().order('check_in', desc).limit(1)` to fetch the latest check-in of the day (works with 1 or many records)
- Display the latest check-in time in the status pill

**GymPortalAttendance.tsx (Check-In tab):**
- Change the today query from `.maybeSingle()` to fetch ALL of today's records as an array
- Replace the single `todayRecord` state with a `todayRecords` array
- Always show the check-in button, even after checking in
- Below the button (or below the confirmed state), list all of today's check-ins with their timestamps
- After checking in, show the power-up animation, then return to the "ready" state so the member can check in again later
- Keep the "LET'S GO" confirmation visible for a few seconds, then reset to idle with the check-in button showing again

**Stats accuracy:**
- `monthlyCount` already uses `count: 'exact'` with `head: true`, which correctly counts all records -- no change needed
- `streak` already uses unique days from the last 30 days -- no change needed
- The only issue was `.maybeSingle()` crashing when multiple rows exist

### Files to Change

| File | Change |
|------|--------|
| `src/components/portal/gym/GymMemberPortal.tsx` | Fix today query to handle multiple check-ins; show latest check-in time |
| `src/components/portal/gym/GymPortalAttendance.tsx` | Track array of today's records; always show check-in button after animation resets; list today's check-in times below stats |

### Technical Details

**Home tab today query fix:**
```typescript
// Before (breaks with >1 record):
supabase.from('gym_attendance').select('id, check_in').eq('member_id', member.id).gte('check_in', todayStart).maybeSingle()

// After (always works):
supabase.from('gym_attendance').select('id, check_in').eq('member_id', member.id).gte('check_in', todayStart).order('check_in', { ascending: false }).limit(1)
```

**Check-in tab flow after fix:**
1. Page loads -- fetches all today's records into an array
2. If no records exist, show idle check-in button
3. If records exist, show check-in button (still available) plus a list of today's sessions below
4. On check-in: charge animation, explosion, "LET'S GO" confirmation for 3 seconds, then auto-reset to show the button again with updated session list
5. Stats (monthly visits, streak) update accurately from the real data

**Today's sessions list** (shown below stats when there are check-ins):
- Simple list showing each check-in time (e.g., "Session 1 -- 8:40 PM", "Session 2 -- 10:05 PM")
- Styled consistently with the dark portal theme
