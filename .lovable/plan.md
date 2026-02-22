

## Admin Usage Analytics Tab

### What You'll Get

A new "Usage" tab in the Admin dashboard showing how tenants are actually using the platform -- which features they use most, activity trends over time, and per-tenant engagement scores. This helps you spot patterns like which modules drive retention, which tenants are at risk of churning, and what features are most popular.

### What It Shows

**Platform-Wide Activity Summary**
- Total records created across all tenants (invoices, quotes, clients, tasks, leads, job cards, etc.)
- Activity trend chart showing records created per month (last 6 months)
- Feature popularity breakdown: bar chart showing which modules are used most (e.g. "Invoices: 8, Quotes: 17, Leads: 9")

**Per-Tenant Usage Table**
- Sortable table of all tenants with columns: Tenant name, System type, Invoices, Quotes, Clients, Tasks, Leads, Staff, Last Active, Engagement Score
- Engagement score = weighted composite (clients + invoices + quotes + tasks + leads + staff)
- Color-coded engagement badges: High / Medium / Low / Inactive
- "Last Active" based on most recent record created across all tables

**Module Adoption Chart**
- Shows how many tenants have used each feature (e.g. "12 tenants created invoices, 8 created leads, 3 used job cards")
- Helps identify which add-on modules are worth promoting

---

### Technical Details

**New edge function: `admin-get-usage-analytics`**
- Requires super_admin role (same auth pattern as existing admin functions)
- Queries counts from: invoices, quotes, clients, tasks, leads, job_cards, legal_cases, gym_members, delivery_notes, staff_members, hire_orders, bookings, fleet_vehicles, students, expenses
- Groups by user_id to produce per-tenant usage stats
- Computes monthly activity trend by aggregating created_at across all tables
- Returns: `{ tenantUsage[], featurePopularity[], monthlyActivity[], summary }`

**New files:**
| File | Purpose |
|------|---------|
| `supabase/functions/admin-get-usage-analytics/index.ts` | Edge function aggregating usage data |
| `src/hooks/useAdminUsageAnalytics.tsx` | Hook to call the edge function |
| `src/components/admin/UsageAnalyticsTab.tsx` | Full tab UI with charts and table |

**Modified files:**
| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Add "Usage" tab trigger and content |
| `src/components/admin/index.ts` | Export new tab component |

**No database changes needed** -- all data is already in existing tables; the edge function just reads and aggregates it using the service role key.
