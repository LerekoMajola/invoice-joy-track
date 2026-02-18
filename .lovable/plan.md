
# Build Gym Attendance Module and Billing Subscribe Button

## 1. Gym Attendance Module

Replace the placeholder attendance page with a fully functional check-in/check-out tracking system.

### Database

Create a `gym_attendance` table to log every visit:

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| user_id | uuid | Owner (gym operator) |
| company_profile_id | uuid | Multi-company |
| member_id | uuid FK | Links to gym_members |
| check_in | timestamptz | When member arrived |
| check_out | timestamptz | When member left (nullable) |
| notes | text | Optional notes |
| created_at / updated_at | timestamp | Audit |

RLS policies follow the standard owner + staff pattern.

### Hook: `useGymAttendance.tsx`

- Fetch today's attendance log (default view) with member name joins
- `checkIn(memberId)` -- inserts a new row with `check_in = now()`
- `checkOut(id)` -- updates the row with `check_out = now()`
- Stats: total check-ins today, currently in gym (checked in but not out), weekly/monthly totals

### Page: `src/pages/GymAttendance.tsx`

- **Stats row**: Today's Check-ins, Currently In Gym, This Week, This Month
- **Quick Check-in**: Search box to find a member by name or member number, then one-tap check-in
- **Today's Log**: Table/cards showing who checked in, when, and whether they've checked out
- **Check-out button** on each active row
- **Date picker** to view historical attendance for any day

## 2. Billing Page -- Add "Subscribe Now" Button for Trial Users

### Change to `src/pages/Billing.tsx`

Inside the trial status hero card (lines 112-121), add a prominent "Subscribe Now" button that scrolls the user down to the payment section. This gives trial users a clear call-to-action to convert to paid without waiting for the trial to expire.

The button will:
- Only appear when user is on an active trial (not expired, not already active)
- Sit inside the trial progress section as a clear CTA
- Scroll smoothly to the payment section below

## Files to Create

| File | Purpose |
|------|---------|
| Database migration (SQL) | Create `gym_attendance` table with RLS |
| `src/hooks/useGymAttendance.tsx` | CRUD hook for attendance records |
| `src/pages/GymAttendance.tsx` | Full attendance page (replaces placeholder) |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Billing.tsx` | Add "Subscribe Now" CTA button in the trial card |

## Technical Notes

- Attendance queries default to today's date, with option to pick another date
- The quick check-in uses a search that filters active members only
- Check-out is optional (some gyms only track check-in)
- The billing "Subscribe Now" button uses `scrollIntoView` to jump to the payment section with a `ref`
