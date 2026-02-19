
## Two Features: Self Check-In from Portal + Shareable Workout Card

### What's Being Built

**Feature 1 — Portal Self Check-In:**
A gym member opens the portal on their phone, taps "Check In", and their attendance is recorded instantly. They can also see their visit stats (today, weekly, monthly streak). The gym owner's admin view already shows this in the Attendance page.

**Feature 2 — Shareable Workout Card ("Share Your Visit"):**
After checking in, a visually stunning digital "gym card" appears that members can screenshot and post on social media. It shows their name, gym, today's check-in time, monthly visit count, and a motivational streak badge — styled like a fitness app's achievement card.

---

### Technical Reality Check

The `gym_attendance` table currently only allows the **gym owner** or **staff** to insert records (via `user_id = auth.uid()` RLS). A portal user trying to insert an attendance row would fail because their `auth.uid()` is their own portal user ID, not the gym owner's `user_id`.

Two things need to change:

1. **New RLS policies on `gym_attendance`** — portal members can INSERT their own check-in (where `member_id` links back to their gym_members record), and SELECT their own attendance history.

2. **The `user_id` column problem** — When a portal user checks in, we need to set `user_id` to the gym owner's user ID (so the owner can see it in their attendance page). The portal member object already has `user_id` and `owner_user_id` available from the `gymMember` object in `usePortalSession`.

---

### Part 1: Database — New RLS Policies

```sql
-- Portal member can check themselves in
CREATE POLICY "Portal: gym member can check in"
  ON public.gym_attendance FOR INSERT TO authenticated
  WITH CHECK (
    member_id IN (
      SELECT id FROM public.gym_members
      WHERE portal_user_id = auth.uid()
    )
  );

-- Portal member can read their own attendance history
CREATE POLICY "Portal: gym member can view own attendance"
  ON public.gym_attendance FOR SELECT TO authenticated
  USING (
    member_id IN (
      SELECT id FROM public.gym_members
      WHERE portal_user_id = auth.uid()
    )
  );
```

When the portal member inserts the attendance row, we set `user_id` to `gymMember.user_id` (the gym owner's ID) — this means the gym owner sees it in their admin attendance view correctly.

---

### Part 2: New Component — `GymPortalAttendance.tsx`

A new portal tab component replacing the Home tab or adding as new "Check In" tab.

**Check-In Flow:**
- Detects if member is **already checked in today** (attendance row exists with no `check_out` today)
- If not: shows a large animated "Check In" button
- On press: inserts attendance row → instant confirmation animation
- Shows today's check-in time

**Stats Strip (below button):**
- Total visits this month
- Current streak (consecutive days visited)
- Last visit date

**Shareable Card (appears after check-in):**
A beautifully designed card with:
- Gradient background (gym primary colour)
- "🏋️ I just worked out!" headline
- Member name + member number
- Gym name (from company profile)
- Today's date + check-in time
- Monthly visit count badge ("Visit #12 this month")
- Small watermark logo at bottom
- "Screenshot & share on socials! 📸" prompt text
- A button that triggers the native share sheet (`navigator.share()`) or just prompts the user to screenshot

**Design — the card looks like an achievement unlock:**

```text
┌──────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  🔥 WORKOUT UNLOCKED!            │
│                                  │
│  [JD]                            │
│  John Doe  •  MEM-0042           │
│  Fit Zone Gym                    │
│                                  │
│  TODAY                           │
│  Thursday, 20 Feb 2026           │
│  Checked in at 07:34 AM          │
│                                  │
│  ⚡ Visit #12 this month          │
│  🔥 3-day streak                  │
│                                  │
│  ░░░░ powered by OrionBiz ░░░░   │
└──────────────────────────────────┘
```

---

### Part 3: Add "Check In" Tab to Gym Portal Navigation

Add a 5th nav tab: `check-in` with a `Zap` or `ScanLine` icon (the classic gym check-in icon).

The gym nav goes from 4 to 5 items:
- Home · Plan · Classes · Check In · Messages

---

### Files to Change

| File | Change |
|---|---|
| Database migration | Add 2 RLS policies on `gym_attendance` for portal SELECT + INSERT |
| `src/components/portal/PortalLayout.tsx` | Add `check-in` to gym nav; update `PortalTab` type |
| `src/pages/Portal.tsx` | Wire `check-in` tab to new `GymPortalAttendance` component |
| `src/components/portal/gym/GymPortalAttendance.tsx` | New component: check-in button, stats, shareable card |

No new npm packages needed. The share card is pure CSS/HTML — no canvas library needed, just a styled `div` with a screenshot prompt. `navigator.share()` is used for mobile native share where available, with a fallback "long-press to save" tip.

---

### Data Flow

```text
Member opens Check In tab
  → Query: gym_attendance WHERE member_id = gymMember.id AND check_in >= today
  → If no active check-in: show big "Check In Now" button
  → On tap: INSERT { member_id, user_id: gymMember.user_id (owner), check_in: now }
  → Animation + shareable card appears
  → Member screenshots card and posts on Instagram/WhatsApp

Gym owner:
  → Opens Attendance page
  → Sees the self check-in in their log (it shows under their user_id)
```

### Why `navigator.share()` Instead of Canvas Rendering

The card is rendered as a DOM element. On mobile (where this portal is used), members can:
1. Tap "Share" → `navigator.share()` API opens native sheet on iOS/Android
2. Or simply long-press/screenshot the card — it's designed to look great as a screenshot

No `html2canvas` complexity needed since the card is a styled component, not a PDF.
