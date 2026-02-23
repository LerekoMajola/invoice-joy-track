

## Auto Check-Out After 1 Hour and 1-Hour Check-In Cooldown

### What Changes

Two attendance rules will be enforced for gym members:

1. **Auto check-out after 1 hour** -- Any active session (no check-out) that is older than 1 hour will be automatically checked out (check_out set to check_in + 1 hour).
2. **1-hour cooldown between check-ins** -- A member cannot check in again until at least 1 hour has passed since their last check-in.

### Implementation

#### 1. Database: Auto Check-Out Function + Trigger

Create a scheduled database function that auto-closes stale sessions, and a trigger-based validation on insert to enforce the cooldown.

**Migration SQL:**

- **`auto_checkout_gym_attendance()`** -- A database function that updates all `gym_attendance` rows where `check_out IS NULL` and `check_in` is older than 1 hour, setting `check_out = check_in + interval '1 hour'`.
- **`enforce_gym_checkin_cooldown()`** -- A trigger function on `gym_attendance` INSERT that checks if the same `member_id` has a `check_in` within the last hour. If so, it raises an exception.
- A `pg_cron` schedule (or call from the frontend polling) to run the auto-checkout periodically.

Since `pg_cron` may not be available, the auto-checkout will run from the frontend side on each data fetch instead.

#### 2. Frontend: `useGymAttendance.tsx`

- **Auto-checkout on fetch**: After fetching attendance records, identify any active sessions older than 1 hour and batch-update their `check_out` to `check_in + 1 hour` automatically.
- **Cooldown enforcement in `checkIn` mutation**: Before inserting, query the member's latest `check_in`. If it is less than 1 hour ago, show a toast error ("Please wait -- members can only check in once per hour") and abort.
- **UI updates**: Hide the "Check Out" button for sessions that are auto-checked-out. Show cooldown remaining time or a disabled state for the check-in button.

#### 3. Frontend: `GymPortalAttendance.tsx` (Member Self-Service)

- Same cooldown check before `handleCheckIn` -- query the member's latest check-in and block if less than 1 hour ago.
- Show a message like "You can check in again at [time]" instead of the button when on cooldown.
- Auto-checkout logic runs on component mount as well.

#### 4. Admin Attendance Page: `GymAttendance.tsx`

- Update `isMemberCheckedIn` logic to also account for auto-checked-out sessions (session older than 1 hour = treated as checked out).
- Show "Auto" badge on check-outs that were system-generated (check_out equals check_in + exactly 1 hour).

### Technical Details

**Files changed:**

| File | Change |
|------|--------|
| `src/hooks/useGymAttendance.tsx` | Add auto-checkout on fetch, add cooldown check in checkIn mutation |
| `src/components/portal/gym/GymPortalAttendance.tsx` | Add cooldown check before check-in, show cooldown timer, auto-checkout on load |
| `src/pages/GymAttendance.tsx` | Update "Already In" logic for cooldown, show "Auto" badge on auto-checkouts |

No database migration needed -- the logic will be handled entirely in the frontend to keep it simple and avoid `pg_cron` dependency. The auto-checkout runs as a side effect when attendance data is fetched (any active session older than 1 hour gets its `check_out` set to `check_in + 1 hour`).

