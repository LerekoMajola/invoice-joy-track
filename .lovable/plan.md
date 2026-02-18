

# Add Spacing Between Sidebar and Content Area

## What changes

Add a visible gap between the purple sidebar and the white content area by introducing a left margin/padding on the main content area, and optionally rounding the right edge of the sidebar for a cleaner look.

## Changes

### File: `src/components/layout/DashboardLayout.tsx`
- Change `pl-64` on the main element to `pl-[17.5rem]` (or similar) to create a small gap between the sidebar edge and the content start

### File: `src/components/layout/Sidebar.tsx`
- Optionally add right-side border-radius or a subtle shadow to the sidebar to enhance the visual separation

## Technical details

- In `DashboardLayout.tsx` line 55, change `pl-64` (256px) to something like `pl-[17.5rem]` or `pl-72` to add ~16-32px of breathing room between the sidebar and content
- In `Sidebar.tsx` line 118, optionally add `shadow-xl` or a right border-radius to strengthen the visual boundary

