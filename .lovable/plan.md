
## Portal Redesign: Modern UI + Logout Button

### What's Being Built

A complete visual refresh of the member portal — covering the layout shell, the bottom navigation, the gym home screen, the school home screen, and the login page. A logout button will be added to the portal header. The data-fetching logic stays 100% untouched.

### Current Problems

- No way to sign out — members are trapped in the portal
- Bottom nav has no header/top bar — no branding or context
- The home cards look like basic admin UI, not a polished member-facing app
- Login page is plain and minimal
- No visual hierarchy or personality

### What Changes

#### 1. `src/components/portal/PortalLayout.tsx` — Header + Logout + Redesigned Bottom Nav

Add a sticky top header bar that shows:
- The portal type icon + name (e.g. "Member Portal" / "Student Portal")
- A logout button (LogOut icon, top right)

The bottom nav gets an active pill indicator (a solid rounded background under the active tab) and larger tap targets.

The sign-out logic: `supabase.auth.signOut()` + `localStorage.removeItem('portal_type')` + `window.location.reload()`.

The layout accepts an `onSignOut` prop passed from `Portal.tsx` — same pattern used everywhere else.

#### 2. `src/pages/Portal.tsx` — Pass sign-out handler down

Create a `handleSignOut` function at the page level and pass it to `PortalLayout`.

#### 3. `src/components/portal/gym/GymMemberPortal.tsx` — Modern Home Screen

Replace the plain card list with:
- A vibrant gradient hero section: avatar initials circle, large greeting, status badge
- A bold "Membership Card" with a shiny gradient, plan name, expiry progress bar
- A quick-actions row: 3 icon buttons (Classes, Messages, Membership) with colored icons
- Profile section as a clean list with icons — no change to data, just styling

#### 4. `src/components/portal/school/SchoolParentPortal.tsx` — Modern Home Screen

Same design language for school:
- Hero section with student name and admission number
- Class + Term info as icon cards in a 2-column grid
- Fee summary as a visual progress bar card (paid vs outstanding)
- Guardian section as clean icon list

#### 5. `src/components/portal/PortalLogin.tsx` — Polished Login Page

- Full-height gradient background (subtle, behind content)
- Larger icon with animated ring effect
- Card-based form container with shadow
- Better typography hierarchy

### Files to Change

| File | Change |
|---|---|
| `src/components/portal/PortalLayout.tsx` | Add top header with portal name + logout button; redesign bottom nav active states |
| `src/pages/Portal.tsx` | Create `handleSignOut` and pass to `PortalLayout` |
| `src/components/portal/gym/GymMemberPortal.tsx` | Modern hero + membership card + quick-actions redesign |
| `src/components/portal/school/SchoolParentPortal.tsx` | Modern hero + class/term cards + fee bar redesign |
| `src/components/portal/PortalLogin.tsx` | Polished login with gradient background and card form |

No database changes. No edge function changes. No new dependencies.

### Visual Direction

```text
┌─────────────────────────────────────┐
│  🏋️ Member Portal          [←Exit] │  ← New sticky header
├─────────────────────────────────────┤
│                                     │
│   ┌─ Hero ─────────────────────┐    │
│   │  [JD]  Hi, John! 👋        │    │
│   │        Member #GYM-001     │    │
│   │        ● Active            │    │
│   └────────────────────────────┘    │
│                                     │
│   ┌─ Membership Card ──────────┐    │
│   │  Current Plan              │    │
│   │  Premium Monthly           │    │
│   │  Expires: 30 Mar 2026      │    │
│   │  ████████████░░░  82%      │    │
│   └────────────────────────────┘    │
│                                     │
│   [📅 Classes] [💬 Chat] [💳 Plan]  │
│                                     │
├─────────────────────────────────────┤
│  [Home]  [Plan]  [Classes]  [Chat]  │  ← Redesigned bottom nav
└─────────────────────────────────────┘
```
