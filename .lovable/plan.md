
## Fix Module Card Contrast on Custom Package Builder

### Problem
The top two core/required module cards use `bg-primary/5` (translucent purple tint) when selected. On the gradient hero background, this makes all the dark text (module name, description, price) nearly invisible.

### Solution
**File: `src/components/auth/ModuleSelector.tsx`**

Change the selected card background from translucent to solid white so text remains readable:

- Line 140: Change `border-primary bg-primary/5 shadow-md` to `border-primary bg-card shadow-md`
- This gives selected cards the same solid white background as unselected cards, while still showing the primary border and lock/check indicator to distinguish them

### What stays the same
- The primary-colored border on selected cards (visual distinction)
- The lock/check icon indicator in the top-right corner
- The icon tint changing to primary color when selected
- All other styling and behavior
