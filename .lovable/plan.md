
# Mobile App Optimization Plan

Transform the entire system into a native-feeling mobile application with enhanced touch interactions, optimized navigation patterns, and app-like behaviors.

---

## Current State Analysis

### What's Already Implemented
- PWA manifest with standalone display mode
- Service worker for push notifications
- Mobile sidebar (Sheet drawer)
- Responsive card layouts for Invoices, Quotes, Clients
- Touch-friendly utilities: `.pb-safe`, `.min-touch`, `.scrollbar-hide`
- Input zoom prevention (16px font)
- `useIsMobile()` hook for responsive logic

### Gaps Identified
1. **No bottom navigation** - Users must open hamburger menu for every navigation
2. **No swipe gestures** - No swipe-to-go-back or swipe actions on list items
3. **No pull-to-refresh** - Standard app behavior missing
4. **Dialogs not optimized** - Many dialogs don't use mobile bottom sheets
5. **No haptic feedback** - Touch feels less responsive
6. **No offline indicator** - Users unaware of connection status
7. **No app-like transitions** - Page changes feel web-like, not app-like
8. **Header takes space** - Could collapse on scroll for more content
9. **CRM Pipeline** - Horizontal scroll works but touch gestures could improve
10. **No install prompt** - PWA install not proactively prompted

---

## Implementation Architecture

```text
+-------------------+     +-------------------+     +-------------------+
|   Bottom Navbar   |     |  Swipe Gestures   |     |  Pull to Refresh  |
|   (Primary Nav)   |     |  (Touch Actions)  |     |  (Data Sync)      |
+-------------------+     +-------------------+     +-------------------+
         |                        |                        |
         v                        v                        v
+-------------------+     +-------------------+     +-------------------+
|  Bottom Sheet     |     |  Page Transitions |     |  Offline Mode     |
|  (Mobile Dialogs) |     |  (Animations)     |     |  (PWA Enhanced)   |
+-------------------+     +-------------------+     +-------------------+
```

---

## Phase 1: Bottom Navigation Bar

### Create Mobile Bottom Navigation
Replace hamburger menu with persistent bottom tabs for instant navigation.

**Primary tabs (5 max for thumb reach):**
| Icon | Label | Route |
|------|-------|-------|
| Home | Dashboard | /dashboard |
| Users | CRM | /crm |
| FileText | Quotes | /quotes |
| Receipt | Invoices | /invoices |
| MoreHorizontal | More | Opens bottom sheet menu |

**"More" sheet includes:**
- Delivery Notes, Tasks, Tenders, Profitability, Accounting, Staff, Settings, Billing

### Files to Create/Modify
- Create: `src/components/layout/BottomNav.tsx`
- Create: `src/components/layout/MoreMenuSheet.tsx`
- Modify: `src/components/layout/DashboardLayout.tsx` - Add bottom nav, hide sidebar trigger

---

## Phase 2: Bottom Sheet Dialogs

### Convert Dialogs to Drawer for Mobile
Use the existing `vaul` (Drawer) component on mobile for all dialogs.

**Create responsive dialog wrapper:**
```text
src/components/ui/responsive-dialog.tsx

- On desktop: Renders as Dialog (centered modal)
- On mobile: Renders as Drawer (bottom sheet)
- Automatic based on useIsMobile()
```

### Apply to existing dialogs:
- Add/Edit Client Dialog
- Add Lead/Deal Dialog
- Task Detail Panel
- Deal Detail Panel
- Quote/Invoice Preview
- Notification Panel (already Popover, consider Drawer on mobile)

---

## Phase 3: Swipe Gestures & Touch Actions

### Swipe-to-Action on List Items
Add swipe gestures for common actions on cards.

**Invoice/Quote/Client cards:**
- Swipe left: Delete (with confirmation)
- Swipe right: Quick action (Mark Paid, Send, etc.)

### Implementation
- Create: `src/components/ui/swipeable-card.tsx`
- Use CSS transforms with touch event handlers
- Haptic feedback on action trigger

### Swipe Navigation
- Swipe from left edge: Navigate back (optional, may conflict with browser)

---

## Phase 4: Pull-to-Refresh

### Add Pull-to-Refresh to Data Pages
Implement native-feeling pull-to-refresh.

**Create hook:**
```text
src/hooks/usePullToRefresh.tsx

- Attaches to scroll container
- Shows pull indicator
- Triggers refetch on release
- Haptic feedback on trigger
```

**Apply to pages:**
- Dashboard (refresh all stats)
- CRM (refresh deals)
- Tasks (refresh task list)
- Invoices/Quotes (refresh lists)

---

## Phase 5: Page Transitions

### Add App-like Transitions
Implement smooth transitions between pages.

**Options:**
1. **CSS-only** (simpler): Fade/slide using CSS animations
2. **Framer Motion** (richer): Would require adding dependency

**Recommended: CSS-based transitions**
- Add transition wrapper component
- Pages fade in/slide up on mount
- Respect `prefers-reduced-motion`

**Create:**
- `src/components/layout/PageTransition.tsx`
- Apply to all protected routes

---

## Phase 6: Collapsible Header

### Hide Header on Scroll Down
Save screen real estate by collapsing header.

**Behavior:**
- Scroll down: Header slides up and hides
- Scroll up (any amount): Header slides back
- Always show on page load

**Implementation:**
- Create: `src/hooks/useScrollDirection.tsx`
- Modify: `src/components/layout/Header.tsx` - Add conditional transform

---

## Phase 7: Enhanced PWA Features

### Offline Mode Indicator
Show banner when offline.

**Create:**
- `src/components/layout/OfflineIndicator.tsx`
- Fixed position, shows when `navigator.onLine` is false
- Animate in/out smoothly

### PWA Install Prompt
Proactively prompt users to install.

**Create:**
- `src/components/pwa/InstallPrompt.tsx`
- Capture `beforeinstallprompt` event
- Show install button in Settings or as dismissible banner
- Track if user dismissed

### Splash Screen Enhancement
Already configured in manifest, ensure proper icons and colors.

---

## Phase 8: Touch Optimizations

### Haptic Feedback
Add vibration on key interactions.

**Create utility:**
```text
src/lib/haptics.ts

export const haptics = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(20),
  heavy: () => navigator.vibrate?.(30),
  success: () => navigator.vibrate?.([10, 50, 30]),
  error: () => navigator.vibrate?.([30, 50, 30, 50, 30]),
};
```

**Apply to:**
- Button presses
- Swipe action triggers
- Pull-to-refresh release
- Navigation tab changes
- Toast notifications

### Touch Feedback CSS
Add active states with transform/opacity.

```css
.touch-active:active {
  transform: scale(0.97);
  opacity: 0.8;
  transition: transform 0.1s, opacity 0.1s;
}
```

---

## Phase 9: Notification Panel Mobile Optimization

### Convert to Full-Height Drawer on Mobile
Currently a Popover - on mobile, should be a full bottom drawer.

**Modify:**
- `src/components/notifications/NotificationPanel.tsx`
- Use Drawer instead of Popover on mobile
- Full height with swipe-to-dismiss
- Add swipe-to-delete on items

---

## Phase 10: CRM Pipeline Mobile Gestures

### Enhanced Touch for Kanban
Improve deal card interactions.

**Add:**
- Long-press to pick up card (vs drag)
- Visual feedback when hovering over drop zones
- Snap-to-stage on release
- Haptic feedback on drop

**Consider:**
- Vertical scrolling within columns
- Horizontal swipe between stages (alternative to scroll)

---

## Files Summary

### New Files to Create
| File | Purpose |
|------|---------|
| `src/components/layout/BottomNav.tsx` | Bottom navigation bar |
| `src/components/layout/MoreMenuSheet.tsx` | "More" items bottom sheet |
| `src/components/layout/PageTransition.tsx` | Page transition wrapper |
| `src/components/layout/OfflineIndicator.tsx` | Offline status banner |
| `src/components/ui/responsive-dialog.tsx` | Dialog/Drawer responsive wrapper |
| `src/components/ui/swipeable-card.tsx` | Swipe gesture card wrapper |
| `src/components/pwa/InstallPrompt.tsx` | PWA install prompt UI |
| `src/hooks/usePullToRefresh.tsx` | Pull-to-refresh hook |
| `src/hooks/useScrollDirection.tsx` | Scroll direction detection |
| `src/lib/haptics.ts` | Haptic feedback utilities |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/layout/DashboardLayout.tsx` | Add BottomNav, OfflineIndicator, modify mobile layout |
| `src/components/layout/Header.tsx` | Add scroll-hide behavior |
| `src/components/notifications/NotificationPanel.tsx` | Use Drawer on mobile |
| `src/pages/Dashboard.tsx` | Add pull-to-refresh |
| `src/pages/Tasks.tsx` | Add pull-to-refresh |
| `src/pages/CRM.tsx` | Add pull-to-refresh, enhanced touch |
| `src/pages/Invoices.tsx` | Add swipeable cards |
| `src/pages/Quotes.tsx` | Add swipeable cards |
| `src/index.css` | Add touch-active styles, transitions |
| `index.html` | Ensure all mobile meta tags present |

---

## CSS Updates

### Add to index.css
```css
/* Touch feedback */
.touch-active:active {
  transform: scale(0.97);
  opacity: 0.9;
}

/* Bottom nav safe area */
.pb-nav-safe {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 64px);
}

/* Page transitions */
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.2s, transform 0.2s;
}

/* Header hide animation */
.header-hidden {
  transform: translateY(-100%);
  transition: transform 0.3s ease-out;
}
.header-visible {
  transform: translateY(0);
  transition: transform 0.2s ease-out;
}
```

---

## Expected Mobile UX After Implementation

1. **Instant navigation** via bottom tabs (no more hamburger hunting)
2. **Native-feeling sheets** slide up for dialogs
3. **Swipe actions** on cards for quick operations
4. **Pull down** to refresh data anywhere
5. **Smooth transitions** between pages
6. **Auto-hiding header** for more content space
7. **Haptic feedback** on interactions
8. **Offline awareness** with clear indicator
9. **Install prompt** for home screen access
10. **Gesture-rich pipeline** for CRM deal management

---

## Implementation Priority

1. **High Impact**: Bottom Navigation (Phase 1) - biggest UX improvement
2. **High Impact**: Responsive Dialogs (Phase 2) - many dialogs need this
3. **Medium Impact**: Pull-to-Refresh (Phase 4) - expected mobile behavior
4. **Medium Impact**: Collapsible Header (Phase 6) - more content space
5. **Polish**: Swipe Gestures (Phase 3) - nice to have
6. **Polish**: Page Transitions (Phase 5) - refined feel
7. **Utility**: PWA Enhancements (Phase 7) - install & offline
8. **Utility**: Haptics (Phase 8) - subtle improvement
