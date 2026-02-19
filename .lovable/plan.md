
## Gym Portal: Self-Enrollment in Classes

### What's Broken / Missing Today

The Classes tab (`GymPortalSchedule.tsx`) is read-only. Members can view the schedule but there is no "Book" button. Gym owners currently have to manually add members to classes from the admin side.

### What's Being Built

A full self-booking flow for gym members in the portal:

- **Book a class** — tap a class card, see spots remaining, tap "Book Class" to reserve a spot
- **My Bookings** — a dedicated section or tab showing upcoming bookings with the option to cancel
- **Spot tracking** — live count of how many spots are filled vs. capacity so you know if a class is full before booking
- **Prevent double-booking** — if you're already booked into a class on that schedule slot, the button shows "Booked ✓" instead

### Database Changes

**New table: `gym_class_bookings`**

Stores each member's booking per schedule slot:

```sql
CREATE TABLE public.gym_class_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,           -- gym owner's user_id (for RLS scoping)
  schedule_id uuid NOT NULL REFERENCES public.gym_class_schedules(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  booked_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'booked', -- 'booked' | 'cancelled'
  UNIQUE(schedule_id, member_id)
);
```

**RLS Policies:**

- Portal member can INSERT a booking where `member_id` links back to their `gym_members.portal_user_id = auth.uid()`
- Portal member can SELECT their own bookings (same pattern)
- Portal member can UPDATE (cancel) their own bookings
- Gym owner can SELECT all bookings under their `user_id`

### UI Changes

#### `GymPortalSchedule.tsx` — Add booking capability

- Each class card shows a **spot counter**: "8 / 12 spots filled" (queried from `gym_class_bookings` count)
- When you tap a class, the bottom sheet detail panel gains a **"Book Class"** button
- If already booked: shows "Booked ✓" badge (green) + "Cancel Booking" link
- If class is full: shows "Class Full" disabled state
- On book: inserts into `gym_class_bookings`, spot count updates instantly

#### New "My Bookings" section inside the Classes tab

Below the schedule grid, a collapsible section shows:
- All upcoming bookings (booked status, not cancelled)
- Each card: class name, day + time, instructor
- "Cancel" button with confirm prompt

### Files to Change

| File | Change |
|---|---|
| Database migration | Create `gym_class_bookings` table + RLS policies |
| `src/components/portal/gym/GymPortalSchedule.tsx` | Add booking button in detail sheet; live spot count; "My Bookings" section |

No new nav tabs needed — everything lives within the existing Classes tab for a clean experience.

### Flow

```text
Member opens Classes tab
  → Sees schedule with spots remaining per class
  → Taps a class card → bottom sheet opens
  → Taps "Book Class" → booking inserted
  → Button changes to "Booked ✓"
  → Spot count updates

"My Bookings" section below schedule:
  → Lists all upcoming bookings
  → Member can cancel a booking (status → 'cancelled')

Gym owner admin side:
  → Can see bookings count per class in their schedule view
```

No new packages needed.
