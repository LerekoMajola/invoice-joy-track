

# Admin Preview: Payment Required Page

## What This Does
Adds a "Preview Payment Page" button to the Admin panel that opens the Payment Required screen in a full-page overlay. This lets you see exactly what a tenant experiences when their trial expires, without needing to actually have an expired trial.

## What You Will See
- A new button in the Admin Subscriptions tab (or a global admin action) labeled "Preview Payment Page"
- Clicking it opens a full-screen overlay showing the Payment Required page design
- The overlay renders a demo version of the page with sample data (sample module badges, sample amount, sample reference)
- A close button in the top corner to dismiss the preview

## Technical Details

### 1. New Component: `src/components/admin/PaymentPagePreview.tsx`
- A full-screen overlay (using React Portal to render into document.body, following the project's existing overlay pattern)
- Renders the same UI as `PaymentRequired.tsx` but with mock/demo data instead of live subscription data
- Uses sample values: a demo reference number, sample module list, sample monthly total
- All interactive elements (copy buttons, tabs) work normally for realistic preview
- "I've Made Payment" button is disabled with a "(Preview only)" label
- Close button (X) in the top-right corner to dismiss

### 2. Modified: `src/components/admin/SubscriptionsTab.tsx`
- Add a "Preview Payment Page" button near the top of the tab
- Opens the `PaymentPagePreview` overlay when clicked

### Files to Create
- `src/components/admin/PaymentPagePreview.tsx`

### Files to Modify
- `src/components/admin/SubscriptionsTab.tsx` -- add preview button

