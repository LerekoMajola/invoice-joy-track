

## Premium Dark Gym Portal Redesign

Inspired by the reference image, the entire member portal will be transformed into a dark, immersive fitness experience with mint/cyan accents, bold typography, and an addictive mobile-native feel.

### Design Language

- **Dark Mode**: Deep charcoal-to-black backgrounds (not the main app's light theme -- scoped only to the portal)
- **Accent Colors**: Mint/cyan gradient (`#00E5A0` to `#00C4FF`) replacing the current indigo primary
- **Typography**: Extra-bold headings, tight tracking, uppercase micro-labels
- **Cards**: Frosted glass effect with subtle white/mint borders on dark backgrounds
- **Bottom Nav**: Glassmorphic dark bar with glowing active indicator (dot + color shift)
- **Animations**: Smooth fade-ins, scale-on-tap, pulse effects on key actions

---

### Screen-by-Screen Breakdown

**1. Portal Layout (shell)**
- Full dark background (`bg-gray-950`) scoped to the portal container
- Header: transparent/blur with mint accent icon
- Bottom nav: dark glass bar, active tab gets a glowing mint dot above the icon + mint icon color
- Haptic feedback on tab switches

**2. Home Tab (GymMemberPortal)**
- Dark gradient hero with member name in huge bold white text
- Greeting row with subtle animated emoji
- Status pill: frosted glass chip showing check-in status or membership status
- 3 stat cards in frosted dark glass: Monthly Visits (mint ring), Streak (orange glow), All-Time (gold glow)
- Each stat card uses a circular progress indicator instead of flat numbers
- Motivational quote section with large italic serif-style text on dark background
- Active plan strip at the bottom with days-left countdown and thin mint progress bar

**3. Plan Tab (GymPortalMembership)**
- Keep the existing dark hero card but enhance with mint gradient accents instead of primary
- Progress bar uses mint-to-cyan gradient
- Receipt chip gets a glowing mint border
- Past plans section uses frosted dark cards

**4. Classes Tab (GymPortalSchedule)**
- Day selector: horizontal pill strip with mint active state on dark background
- Class cards: dark frosted glass with mint accent borders
- Capacity indicator: thin mint progress bar
- Bottom sheet detail: dark glass panel with mint "Book Class" button
- My Bookings section: dark cards with subtle glow on booked items

**5. Check-In Tab (GymPortalAttendance)**
- Big circular check-in button with pulsing mint glow ring (instead of current primary)
- Post-check-in: large animated checkmark with particle burst effect (CSS only)
- Shareable workout card: dark gradient with mint accents, designed for screenshots
- Stats strip: 3 dark frosted glass cards matching home style

**6. Messages Tab (PortalMessaging)**
- Dark background chat interface
- Own messages: mint gradient bubble
- Received messages: dark frosted glass bubble
- Input bar: dark glass with mint send button

---

### Files to Change

| File | Change |
|------|--------|
| `src/components/portal/PortalLayout.tsx` | Dark theme shell, redesigned glassmorphic bottom nav with glow effects |
| `src/components/portal/gym/GymMemberPortal.tsx` | Complete visual overhaul -- dark hero, frosted stat cards, circular indicators |
| `src/components/portal/gym/GymPortalMembership.tsx` | Mint accent swap, enhanced frosted glass cards |
| `src/components/portal/gym/GymPortalSchedule.tsx` | Dark frosted class cards, mint day selector, dark bottom sheet |
| `src/components/portal/gym/GymPortalAttendance.tsx` | Mint glow check-in button, dark shareable card, frosted stats |
| `src/components/portal/shared/PortalMessaging.tsx` | Dark chat bubbles, mint own-message gradient |

### Technical Approach

- All dark styling is **scoped to the portal container** using Tailwind classes (no global CSS changes needed)
- The portal wrapper div gets `bg-gray-950 text-white` which cascades to all children
- Existing data fetching hooks and logic remain completely unchanged
- Only visual/JSX changes -- no database or backend modifications
- Uses existing Tailwind utilities plus inline styles for specific gradients

