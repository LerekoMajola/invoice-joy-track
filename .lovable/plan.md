
# Fix Close Button Overlapping Dialog Header Content

## The Problem
The dialog close button (X) is absolutely positioned at `right-3 top-3` inside `DialogContent`. When dialog headers contain extra elements like badges (e.g., "Active", "Staff" in the Staff Detail dialog), they extend into the close button's space, causing overlap.

## The Fix

### File: `src/components/ui/dialog.tsx`

Add right padding to `DialogHeader` so its content never reaches under the close button:

**Current:**
```tsx
<div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} />
```

**New:**
```tsx
<div className={cn("flex flex-col space-y-1.5 text-center sm:text-left pr-8", className)} />
```

Adding `pr-8` (2rem / 32px) provides enough clearance for the close button (which sits at `right-3` with a ~20px icon), preventing overlap in all dialogs system-wide.

### Why this is the right approach
- Fixes all 19+ dialog files at once with a single line change
- No need to modify individual dialog components
- Follows the existing pattern where `DialogContent` already accounts for the close button positioning
- Safe default -- dialogs without extra header content simply get harmless extra padding

### Files changed
- `src/components/ui/dialog.tsx` -- one line change to `DialogHeader`
