

## Apply Gradient Stat Cards with White Text + User Name

### What Changes

Transform all stat cards across the entire platform from the current white/light card style to bold gradient-backed cards with white text and icons, plus display the logged-in user's name at the bottom left of each card.

### 1. Update the Core `StatCard` Component

**File: `src/components/dashboard/StatCard.tsx`**

- Change the card background from `bg-card` to the system's signature gradient (`bg-gradient-to-br from-indigo-500 to-purple-600`) with white text
- Make all text elements white: title (`text-white/80`), value (`text-white`), change badge text
- Icon container: use `bg-white/20` with white icon (remove the per-card `iconColor` overrides)
- Add the logged-in user's name at the bottom left using `useAuth()` to get `user.email` and `useCompanyProfile()` to get `contact_person` or `company_name`
- Display name in small white text: `text-xs text-white/60`
- Remove the hover gradient overlay (no longer needed since background is already gradient)
- Keep the animated number counter and hover lift effect

### 2. Update Custom Stat Card Components

These components don't use the shared `StatCard` and have their own card markup:

**File: `src/components/school/FeeStatCards.tsx`**
- Apply the same indigo-to-purple gradient background
- Change all text to white variants
- Icon: white on `bg-white/20` circle
- Add logged-in user's name at bottom left

**File: `src/components/profitability/ProfitabilityStats.tsx`**
- Apply the same gradient background to each stat card
- Change text and icon colors to white variants
- Add logged-in user's name at bottom left

**File: `src/components/admin/PlatformStatsCards.tsx`**
- These already use gradients but each card has a different color. Unify them to the system indigo-to-purple gradient
- Add logged-in user's name at bottom left

### 3. Clean Up Callers

Pages that pass custom `iconColor` props (like `bg-primary/10 text-primary`) to `StatCard` will continue to work since the component will now ignore that prop internally and use `bg-white/20 text-white` universally.

### Visual Result

Each stat card will look like:

```text
+------------------------------------------+
|  Title                        [icon]     |
|  1,234                                   |
|  +12% this month                         |
|                                          |
|  John Doe                                |
+------------------------------------------+
```

With a rich indigo-to-purple gradient background, all white text, and a frosted-glass icon container.

### Files Modified

1. `src/components/dashboard/StatCard.tsx` -- core gradient + white text + user name
2. `src/components/school/FeeStatCards.tsx` -- match gradient style + user name
3. `src/components/profitability/ProfitabilityStats.tsx` -- match gradient style + user name
4. `src/components/admin/PlatformStatsCards.tsx` -- unify gradient + user name
