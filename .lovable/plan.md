

## Center Quote & Power-Up Check-In Animation

### 1. Center the "Today's Motivation" section (GymMemberPortal.tsx)

- Add `text-center items-center` to the quote container
- Center the label, blockquote, and author text

### 2. Epic Check-In Animation (GymPortalAttendance.tsx)

Transform the check-in experience into a "power-up" moment:

**Before check-in:**
- Pulsing outer ring with a breathing glow effect
- Rotating energy ring around the button (CSS keyframe)

**On tap (during check-in):**
- Button scales down then bursts outward
- Spinner with energy effect

**After check-in (the dopamine hit):**
- Expanding shockwave ring that fades out
- The checkmark icon scales up with a bounce
- Radial burst lines (8 energy rays) that shoot outward and fade
- Stats below get a staggered fade-in
- Green glow pulse behind the confirmed state

**CSS additions to index.css:**
- `@keyframes power-ring-spin` -- rotating dashed ring around the button
- `@keyframes shockwave` -- expanding ring on successful check-in
- `@keyframes burst-ray` -- energy lines shooting outward
- `@keyframes bounce-in` -- bouncy scale for the checkmark
- `@keyframes glow-pulse` -- breathing glow behind confirmed state

### 3. Stats strip cleanup (GymPortalAttendance.tsx)

- Remove the "rank" stat (3rd column) to match home tab
- Switch to `grid-cols-2` for consistency

### Files to Change

| File | Change |
|------|--------|
| `src/index.css` | Add power-up animation keyframes |
| `src/components/portal/gym/GymMemberPortal.tsx` | Center the quote section |
| `src/components/portal/gym/GymPortalAttendance.tsx` | Power-up check-in animation with shockwave, burst rays, bounce-in checkmark, and staggered stat reveals |

### Technical Details

The animations are pure CSS (no JS animation libraries needed). State-driven: a `justCheckedIn` boolean triggers the burst animations for 1.5 seconds after successful check-in, then settles into the calm confirmed state. The rotating energy ring uses a dashed SVG circle with CSS animation for the pre-check-in idle state.

