

# Make Edit and Download Buttons Visible on Delivery Note Preview

## Problem

When viewing a delivery note, the action buttons (Edit, Template, Print, Download PDF, Close) are all in a single horizontal row in the header bar. On mobile or smaller screens, these buttons overflow and get cut off, making them invisible and inaccessible.

## Solution

Restructure the header actions to be responsive:
- On **mobile**: Show only icon buttons (no text labels) and use smaller sizing so all buttons fit in the available space. The Template button can be moved to a secondary row or kept as icon-only.
- On **desktop**: Keep the current layout with full text labels.

## Changes

### File: `src/components/delivery-notes/DeliveryNotePreview.tsx`

Update the header actions section (lines 144-170):

1. **Wrap the button row** with `flex-wrap` so buttons can flow to a second line if needed
2. **Use icon-only buttons on mobile** by hiding the text labels on small screens using `hidden sm:inline` on the button text spans
3. **Add responsive sizing**: Use smaller button variants on mobile
4. **Ensure the title row is responsive**: Make the title truncate if needed and give the buttons priority

The specific changes:
- Add `flex-wrap` to the actions container so buttons wrap instead of overflowing
- Wrap each button's text label (e.g., "Edit", "Download PDF") in a `<span className="hidden sm:inline">` so only the icon shows on mobile
- Keep all buttons accessible on every screen size -- just more compact on mobile

This is a simple CSS/layout adjustment with no logic changes.

