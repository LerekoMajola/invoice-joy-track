

## Body Stats & Vitals Tracker

A new "Progress" tab in the member portal where members obsessively track their body transformation journey. This is the feature that makes them open the app daily -- watching their numbers change over time.

### What Members See

A dark, immersive screen with:

**Body Stats Hero** -- Latest measurements displayed as glowing metric cards:
- Weight (kg/lbs)
- Height (cm)
- Body Fat % (with color-coded zones: green/amber/red)
- BMI (auto-calculated from height + weight)
- Muscle Mass (kg)
- Waist circumference (cm)

**Progress Charts** -- Mini sparkline graphs showing trends over time for weight and body fat %. Members can see their transformation visually -- this is the addictive part. Seeing the line go down (or up for muscle) triggers dopamine.

**Milestone Badges** -- Auto-awarded achievements:
- "First Log" -- logged your first measurement
- "7-Day Streak" -- logged 7 days in a row
- "5kg Down" -- lost 5kg from starting weight
- "Consistency King" -- 30+ logs total

**Log Entry** -- A sleek bottom-sheet with number inputs to quickly log today's stats. One tap, enter numbers, done. The ease of logging is what creates the habit.

**Before/After Comparison** -- Shows your first-ever log vs latest side by side with percentage changes highlighted in mint/red.

### How It Works

**New database table: `gym_member_vitals`**
- `id` (uuid, PK)
- `member_id` (FK to gym_members)
- `user_id` (text, the gym owner)
- `logged_at` (timestamp, defaults to now)
- `weight_kg` (numeric, nullable)
- `height_cm` (numeric, nullable)
- `body_fat_pct` (numeric, nullable)
- `muscle_mass_kg` (numeric, nullable)
- `waist_cm` (numeric, nullable)
- `chest_cm` (numeric, nullable)
- `arm_cm` (numeric, nullable)
- `hip_cm` (numeric, nullable)
- `thigh_cm` (numeric, nullable)
- `notes` (text, nullable)
- `created_at` (timestamp)

RLS policies: Members can read/insert their own vitals (matched via `member_id` to their `portal_user_id` in `gym_members`). Gym owners can read/write vitals for their members.

### Navigation Change

The bottom nav currently has 5 tabs (Home, Plan, Classes, Check In, Messages). We'll replace the nav structure to fit 5 tabs still but swap the layout to use a "More" pattern or reorder:

- Home
- Progress (NEW -- replaces the middle position)
- Check In
- Plan
- Messages

Classes moves into a sub-section accessible from Home or the Plan tab. This puts Progress front-and-center which drives daily engagement.

### File Changes

| File | Change |
|------|--------|
| **Migration** | Create `gym_member_vitals` table with RLS policies |
| `src/components/portal/gym/GymPortalProgress.tsx` | **New** -- the full Progress tab with stats, charts, milestones, and log sheet |
| `src/components/portal/PortalLayout.tsx` | Update gym nav to include "Progress" tab with Activity/chart icon |
| `src/pages/Portal.tsx` | Wire up the new `progress` tab to render `GymPortalProgress` |

### Technical Details

**Progress tab component structure:**
- Fetches all vitals for the member, ordered by `logged_at desc`
- Latest entry populates the hero stat cards
- Historical entries feed into Recharts sparkline/area charts (already installed)
- BMI is calculated client-side: `weight / (height/100)^2`
- Milestone badges are computed client-side from the vitals array (no separate table needed)
- "Log Stats" button opens a Sheet (vaul drawer) with numeric inputs
- The before/after comparison uses first and last entries from the array

**Addictive design elements:**
- Animated number counters when stats load
- Color-coded body fat zones (green < 20%, amber 20-30%, red > 30%)
- Streak counter for consecutive days with logs
- "Personal Best" highlights (lowest weight, highest muscle mass)
- Confetti-style animation when a new milestone is unlocked
- Trend arrows (up/down) next to each metric showing direction vs last log

