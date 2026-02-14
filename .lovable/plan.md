
# Full-Page Tenant Detail View

## What Changes
Replace the current side-panel Sheet with a full-page overlay using a React Portal. When you click the eye icon on a tenant, the detail view will take over the entire screen instead of sliding in from the right as a narrow panel.

## Design
- Full-screen white overlay rendered via React Portal (same pattern used for document previews)
- Fixed header bar with the tenant name, a back/close button, and key action buttons
- Content area uses a two-column layout on desktop for better use of space:
  - Left column: Company info, Subscription details, Usage stats
  - Right column: Modules manager, Business Insights
- On mobile, it stacks into a single scrollable column
- Smooth entry with a simple fade-in

## Technical Details

### File Modified: `src/components/admin/TenantDetailDialog.tsx`
- Remove the Sheet/SheetContent wrapper
- Replace with a full-screen fixed-position div rendered via `ReactDOM.createPortal`
- Add a top header bar with close (X) button and tenant company name
- Reorganize content into a responsive two-column grid (`grid-cols-1 lg:grid-cols-2`)
- All existing sections (Company Info, Subscription, Usage, Modules, Business Insights) remain unchanged in content, just laid out with more space

### No other files need changes
- `TenantsTab.tsx` already passes `open`, `onOpenChange`, and `tenant` props -- no changes needed there
