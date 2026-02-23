

## Fix: Package Change Request Approval Failing

### Root Cause

The approval fails because the `subscriptions.plan` column uses a database enum (`subscription_plan`) that only allows these values: `free_trial`, `basic`, `standard`, `pro`, `custom`.

When the admin approves a request, the code sets `plan` to the tier's `name` field (e.g., "Professional"), which is not a valid enum value -- causing the database error.

### Solution

Update the `handleApprove` function in `PackageChangeRequests.tsx` to map tier names to valid enum values instead of using the raw tier name. Since all database-driven package tiers represent a "pro" level subscription, the plan field should be set to `"pro"` (or derive the correct enum value based on the tier). The `package_tier_id` column is what actually tracks which specific tier the user is on -- the `plan` enum is a legacy field.

### Technical Details

| File | Change |
|------|--------|
| `src/components/admin/PackageChangeRequests.tsx` | In `handleApprove`, change `plan: requestedTier.name as any` to `plan: 'pro'` (since all paid package tiers map to the "pro" enum level). The `package_tier_id` field already correctly identifies the specific tier. |

This is a one-line fix. The `package_tier_id` is the actual source of truth for which tier a user is on; the `plan` enum is only used for broad categorization (free trial vs paid).

