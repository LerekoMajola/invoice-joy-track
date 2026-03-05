

## Fix Real-Time Updates + Add Customer/Member Counts for Admin

### Problem 1: Members don't appear until page refresh
The `gym_members` table (and `gym_membership_plans`) are **not added to the Supabase realtime publication**. The hooks subscribe to `postgres_changes` but since the tables aren't published, no events are ever emitted. The `createMember` function does call `fetchMembers()` after insert (which should work), but this is fragile -- the root fix is enabling realtime properly.

Additionally, as a safety net, I'll add an optimistic local state update so the new member appears instantly in the list before the refetch completes.

### Problem 2: Admin can't see customer/member counts per tenant
The Customers table currently shows a "Usage" column with Clients (C), Quotes (Q), Invoices (I) counts from `usage_tracking`. But for gym tenants, the relevant metric is **member count**, not client count. For school tenants, it's **student count**.

### Implementation

**1. Database migration -- enable realtime for gym tables**

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.gym_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gym_membership_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gym_member_subscriptions;
```

**2. Optimistic update in `useGymMembers.tsx`**

After successful insert in `createMember`, immediately add the new member to local state before calling `fetchMembers()`. This ensures the UI updates instantly even if realtime has a slight delay.

**3. Update `admin-get-tenant-data` edge function**

Add queries for `gym_members` and `students` tables (count by `user_id`), and include `gym_members_count` and `students_count` in the response summary.

**4. Update `useAdminTenants.tsx` -- fetch system-specific counts**

Enhance the tenant query to also fetch counts from `gym_members` and `students` tables grouped by `user_id`, so the Customers table can show the right metric per system type.

**5. Update `CustomersTab.tsx` -- show contextual usage column**

Change the Usage column to show system-appropriate counts:
- **Business/Workshop/Legal/Hire/Fleet/Guesthouse**: Clients (C), Quotes (Q), Invoices (I) -- same as now
- **Gym**: Members count
- **School**: Students count

**6. Update `TenantDetailDialog.tsx` -- show system-specific counts**

In the Usage section, show Members instead of Clients for gym tenants, Students for school tenants.

### Files changed
| File | Change |
|------|--------|
| New migration | Enable realtime for `gym_members`, `gym_membership_plans`, `gym_member_subscriptions` |
| `src/hooks/useGymMembers.tsx` | Add optimistic local state update in `createMember` |
| `supabase/functions/admin-get-tenant-data/index.ts` | Add gym_members + students count queries |
| `src/hooks/useAdminTenants.tsx` | Fetch gym_members and students counts per user |
| `src/components/admin/CustomersTab.tsx` | Show system-contextual usage (Members for gym, Students for school) |
| `src/components/admin/TenantDetailDialog.tsx` | Show Members/Students labels based on system type |

