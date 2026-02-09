

# Fix Multi-System Pricing: Add Business and Workshop Tiers

## Problem
The landing page pricing table and the signup flow's package selector are hardcoded with only **School** tiers (Starter M720, Professional M950, Enterprise M1200). When users click "Start Free Trial" from the landing page, they go to `/auth` and see the system selector, but after choosing Business or Workshop, they still see School-labeled packages.

## Root Cause
Two files have hardcoded School-only data:
- `src/components/landing/PricingTable.tsx` -- only School tiers
- `src/components/auth/PackageTierSelector.tsx` -- only `schoolTiers` array, no Business or Workshop tiers

## Changes

### 1. Add Business and Workshop tiers to `PackageTierSelector.tsx`
Add tier arrays for all three system types with appropriate modules and pricing:

| System | Starter | Professional | Enterprise |
|--------|---------|-------------|------------|
| Business | M350/mo | M550/mo | M800/mo |
| Workshop | M450/mo | M650/mo | M900/mo |
| School | M720/mo | M950/mo | M1,200/mo |

**Business modules:** quotes, invoices, crm, tasks, staff, accounting, tenders, delivery_notes
**Workshop modules:** workshop, invoices, tasks, staff, accounting, fleet
**School modules:** school_admin, students, school_fees, invoices, tasks, staff, accounting

The component will dynamically select the correct tier array, heading, and gradient based on the `systemType` prop (which is already passed in).

### 2. Update Landing Page `PricingTable.tsx`
Replace the single School pricing grid with a tabbed/segmented view showing all three system types. Each tab will display the relevant tiers with correct pricing, features, and "Start Free Trial" links.

### 3. Pass system context from Landing to Auth (optional enhancement)
Update "Start Free Trial" links to include `?system=business` (etc.) so the auth page can skip directly to the package step when the user already chose a system from the landing page. This improves the flow but is not strictly required.

## Technical Details

### Files to modify:
- **`src/components/auth/PackageTierSelector.tsx`** -- Add `businessTiers` and `workshopTiers` arrays; dynamically select tier array and UI metadata (title, gradient) based on `systemType` prop
- **`src/components/landing/PricingTable.tsx`** -- Add all three system types with a tab selector; update tier data to match the auth flow tiers

### No database or backend changes needed.

