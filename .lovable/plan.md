
## Soft-Delete Customers into Recycle Bin with Instant UI Updates

### What Changes

Currently, deleting a customer permanently removes their data (hard delete). The RecycleBin component already exists but is never used, and the delete logic bypasses it entirely.

This fix will:

1. **Change the delete action to a soft delete** -- instead of permanently removing records, it sets `deleted_at = now()` on `company_profiles` and `subscriptions`. For non-onboarded users (no company profile), the auth user is still hard-deleted since there's no profile to soft-delete.

2. **Wire up the Recycle Bin** -- render the existing `RecycleBinSection` component inside the Customers tab so you can see and restore soft-deleted tenants.

3. **Optimistic UI updates** -- immediately remove the customer from the list when you click Delete, without waiting for a server round-trip. If the server call fails, it rolls back.

### Technical Details

| File | Change |
|------|--------|
| `src/components/admin/CustomersTab.tsx` | Replace the hard-delete mutation with a soft-delete (update `deleted_at = now()` on `company_profiles` and `subscriptions`). Add optimistic cache removal from `admin-tenants` and `admin-signups` queries. Import and render `RecycleBinSection` at the bottom of the tab. |
| `src/components/admin/RecycleBinSection.tsx` | Add optimistic cache updates to the restore mutation so restored tenants appear instantly. |

**Delete mutation changes (CustomersTab):**
- For onboarded customers (have a tenant/profile): soft-delete by setting `deleted_at = now()` on both `company_profiles` and `subscriptions` for that `user_id`
- For non-onboarded customers (auth-only, no profile): continue using the edge function hard-delete since there is no profile row to soft-delete
- Add `onMutate` to optimistically remove the customer from cached query data
- Add `onError` to roll back the optimistic update if the mutation fails
- Invalidate `admin-tenants-deleted` on success so the recycle bin updates

**Restore mutation changes (RecycleBinSection):**
- Add `onMutate` to optimistically remove the tenant from the deleted list and add it back to the active tenants cache
- Add `onError` rollback
