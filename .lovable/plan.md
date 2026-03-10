

## Create Edge Function + Update Hook to Fix Usage Counts

### Problem
Direct client-side queries to `gym_members`, `students`, and `usage_tracking` return 0 rows for other tenants because RLS restricts access to `user_id = auth.uid()`. The admin sees empty usage for everyone.

### Solution

**1. New edge function: `supabase/functions/admin-get-tenant-counts/index.ts`**

- Verifies caller is `super_admin` (same pattern as `admin-get-tenant-data`)
- Uses service role client to query 5 tables: `clients`, `quotes`, `invoices`, `gym_members`, `students`
- For each table, selects `user_id` rows, aggregates counts per `user_id` in JS
- Returns `{ [user_id]: { clients: N, quotes: N, invoices: N, gym_members: N, students: N } }`

**2. Add to `supabase/config.toml`:**
```toml
[functions.admin-get-tenant-counts]
verify_jwt = false
```

**3. Update `src/hooks/useAdminTenants.tsx`:**

Replace lines 60-80 (the three parallel queries for `usage_tracking`, `gym_members`, `students` + the counting loops) with a single call:
```typescript
const { data: countsData } = await supabase.functions.invoke('admin-get-tenant-counts');
const tenantCounts = countsData || {};
```

Then in the tenant mapping (lines 161-173), use:
```typescript
usage: {
  clients_count: tenantCounts[userId]?.clients || 0,
  quotes_count: tenantCounts[userId]?.quotes || 0,
  invoices_count: tenantCounts[userId]?.invoices || 0,
  gym_members_count: tenantCounts[userId]?.gym_members || 0,
  students_count: tenantCounts[userId]?.students || 0,
}
```

### Files changed
| File | Change |
|------|--------|
| `supabase/functions/admin-get-tenant-counts/index.ts` | New edge function |
| `supabase/config.toml` | Add `verify_jwt = false` entry |
| `src/hooks/useAdminTenants.tsx` | Replace direct queries with edge function call |

