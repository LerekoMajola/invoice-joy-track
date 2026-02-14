

# Fix Admin Revenue: Show Platform Revenue, Not Tenant Revenue

## The Problem
The "Total Revenue" card and "Revenue Trend" chart on the admin Overview are currently pulling from the `invoices` table -- which contains tenants' business invoices to their own clients. This is misleading because it shows what tenants earned, not what the platform (Orion) earned from subscription fees.

## The Fix
Calculate platform revenue from **subscription data** instead of tenant invoices. Since subscriptions have plan types with known prices and period dates, we can derive:
- **Total Platform Revenue**: Sum of subscription plan prices for all active/past-active billing periods
- **Revenue Trend**: Monthly platform income based on subscriptions that were active in each month

## What Changes

### Stats Card Updates
- **"Total Revenue"** becomes **"Platform Revenue"** -- calculated from subscription plan prices multiplied by the number of billing months each active subscription has been running
- **Description** changes from "From X invoices" to "From X subscriptions" 
- **Remove** the `invoices` query entirely from admin stats (it was fetching ALL tenant invoices across the platform which is also a performance concern)

### Revenue Chart Update
- **"Revenue Trend"** recalculated using subscription data: for each month, sum the plan prices of all subscriptions that were active during that month
- Same visual chart, just sourced from the correct data

## Technical Details

### File: `src/hooks/useAdminStats.tsx`
- Remove the `invoices` query (no longer needed)
- Replace `totalRevenue` calculation: iterate subscriptions, for each active/cancelled subscription calculate months active multiplied by plan price
- Replace `totalInvoices` with `totalSubscriptions` (count of non-trial subscriptions)
- Update `revenueByMonth`: for each of the last 6 months, sum plan prices of subscriptions that were active in that month
- Update the `AdminStats` interface: rename `totalInvoices` to `totalSubscriptions`

### File: `src/components/admin/PlatformStatsCards.tsx`
- Rename the card from "Total Revenue" to "Platform Revenue"
- Update description from "From X invoices" to "From X subscriptions"

### File: `src/components/admin/RevenueChart.tsx`
- Update subtitle from "Monthly paid invoice totals" to "Monthly subscription revenue"

### File: `src/components/admin/AdminOverviewTab.tsx`
- No changes needed (passes data through)

