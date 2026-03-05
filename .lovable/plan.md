

## Fix Status Inconsistencies + Redesign Admin Dashboard

### Bug: Active tenants misclassified

**Root cause 1**: In `useAdminStats.tsx` (line 119), the system breakdown only checks `sub.status === 'active'` -- it misses `active_awaiting_pop`, which falls into the `else` branch and gets counted as "expired". MISFIT (status: active) should be fine, but any tenant with `active_awaiting_pop` is silently miscounted.

**Root cause 2**: `adminConstants.ts` only defines `SYSTEM_ICONS`, `SYSTEM_LABELS`, and `SYSTEM_COLORS` for 4 systems (business, legal, gym, school), but the platform has 8 systems (missing workshop, hire, guesthouse, fleet). This causes fallback rendering issues across CustomersTab, BillingTab, and TenantDetailDialog.

**Root cause 3**: The `PLAN_LABELS` map shows "Free Trial" for the legacy `free_trial` plan value even when the subscription status is `active`. The Subscription column in CustomersTab displays both status badge AND plan label underneath, so active tenants whose `plan` field was never updated from `free_trial` show a confusing "Free Trial" subtitle beneath their "active" badge.

### Changes

**1. Fix `adminConstants.ts`** -- Add all 8 systems to SYSTEM_ICONS, SYSTEM_LABELS, SYSTEM_COLORS (add Wrench/workshop, Hammer/hire, Hotel/guesthouse, Car/fleet). Add `STATUS_LABELS` map for human-readable status names (e.g., `active_awaiting_pop` -> "Awaiting POP").

**2. Fix `useAdminStats.tsx`** -- In the system breakdown loop, count `active_awaiting_pop` as active (line 119). Same pattern already used on line 73.

**3. Redesign `AdminOverviewTab.tsx`** -- Clean, professional layout following SaaS admin standards:
- Welcome banner stays but becomes cleaner
- KPI cards: Total Tenants, Active Subscriptions, MRR (collected), Trial Conversion Rate -- using clean card design instead of all-purple gradient
- Customer lifecycle funnel: Trial -> Active -> Past Due -> Churned (horizontal bar/counts)
- System breakdown cards remain but with cleaner presentation
- Charts row stays (signups + revenue)

**4. Redesign `PlatformStatsCards.tsx`** -- Remove redundant display name, use distinct card colors per metric (green for revenue, blue for tenants, amber for trials, etc.) instead of uniform purple gradient.

**5. Fix `CustomersTab.tsx`** -- In the Subscription column, show the status badge with a human-readable label (from STATUS_LABELS). Remove the confusing plan label subtitle that shows "Free Trial" for active tenants. The plan info is already visible via the Price/mo column.

**6. Fix status display in `BillingTab.tsx`** -- Use STATUS_LABELS for consistent human-readable status names instead of raw `.replace('_', ' ')`.

### Files changed
| File | Change |
|------|--------|
| `src/components/admin/adminConstants.ts` | Add all 8 systems, add STATUS_LABELS map |
| `src/hooks/useAdminStats.tsx` | Fix `active_awaiting_pop` counting in system breakdown |
| `src/components/admin/AdminOverviewTab.tsx` | Redesign with lifecycle funnel + cleaner KPIs |
| `src/components/admin/PlatformStatsCards.tsx` | Distinct card colors, remove redundant info |
| `src/components/admin/CustomersTab.tsx` | Fix subscription column to use STATUS_LABELS, remove misleading plan label |
| `src/components/admin/BillingTab.tsx` | Use STATUS_LABELS for consistent display |

No database changes needed. No data loss.

