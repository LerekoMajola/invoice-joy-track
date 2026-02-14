

# Convert Admin Dialogs to Full-Page Panels

## Overview
Replace the scrollable popup dialogs in the admin panel with full-page sliding panels. This eliminates scrolling within small modals and gives you a spacious, clean workspace for viewing and managing tenant details.

## What Changes

The following dialogs will be converted from small centered popups to full-screen slide-over panels:

1. **Tenant Detail Dialog** -- the main one you mentioned
2. **Edit Subscription Dialog** -- also a popup today

Each will slide in from the right as a full-height panel, using the existing `Sheet` component (already installed). The content will have room to breathe with no cramped scrolling.

## Visual Behavior
- Panel slides in from the right, covering the full viewport height
- A close button (X) in the top-right corner
- Content laid out spaciously with sections clearly separated
- On mobile, it takes the full screen; on desktop, it takes a wide side panel

---

## Technical Details

### Modified: `src/components/admin/TenantDetailDialog.tsx`
- Replace `Dialog`/`DialogContent` with `Sheet`/`SheetContent` from `@/components/ui/sheet`
- Use `side="right"` with `className="w-full sm:max-w-xl"` for a wide right-side panel
- Replace `DialogHeader`/`DialogTitle` with `SheetHeader`/`SheetTitle`
- Content stays the same but now has full-page height to display without scrolling

### Modified: `src/components/admin/EditSubscriptionDialog.tsx`
- Same conversion: `Dialog` to `Sheet` with right-side full-height panel
- `DialogFooter` becomes `SheetFooter`

### No changes needed to `TenantsTab.tsx`
- The props (`open`, `onOpenChange`, `tenant`) remain identical, so the parent component works as-is

