
## Safe Delete with Company Name Confirmation + 90-Day Recycle Bin

### What Changes

**1. Type-to-confirm delete dialog**
Replace the current simple "Confirm" dialog for deleting tenants with a stricter dialog that requires you to type the exact company name before the Delete button becomes active. This prevents accidental deletions of paying customers.

**2. Soft-delete with recycle bin**
Instead of permanently deleting tenant data, the system will soft-delete by marking records as deleted with a timestamp. A new "Recycle Bin" section appears in the Tenants tab showing recently deleted companies. You can restore them within 90 days. After 90 days they remain in the bin but are marked as expired (permanent cleanup can be added later if needed).

---

### Technical Details

**Database Migration -- add soft-delete columns:**
- Add `deleted_at` (timestamptz, nullable) to `company_profiles`
- Add `deleted_at` (timestamptz, nullable) to `subscriptions`
- Update RLS policies so deleted records are excluded from normal tenant queries

**File: `src/components/admin/TenantsTab.tsx`**
- Replace the simple `ConfirmDialog` with a new `TypeToConfirmDeleteDialog` component
- The dialog shows the company name and requires the user to type it exactly to enable the Delete button
- Change `deleteMutation` from hard-delete to soft-delete: `UPDATE company_profiles SET deleted_at = now()` and `UPDATE subscriptions SET deleted_at = now()`
- Add a "Recycle Bin" toggle/section at the bottom that shows soft-deleted tenants (where `deleted_at IS NOT NULL`)
- Each recycled item shows: company name, deleted date, days remaining until 90-day expiry, and a "Restore" button

**File: `src/hooks/useAdminTenants.tsx`**
- Add a `deleted_at` field to the `Tenant` interface
- Update the query to filter: `is('deleted_at', null)` for the main list
- Add a separate query key `admin-tenants-deleted` that fetches tenants where `deleted_at IS NOT NULL` for the recycle bin view

**File: `src/components/admin/TypeToConfirmDeleteDialog.tsx`** (new file)
- A dialog component with:
  - Warning text explaining the action
  - The company name displayed in bold
  - An input field where the admin must type the exact company name
  - The Delete button stays disabled until the typed text matches exactly (case-sensitive)
  - Red/destructive styling to make it feel serious

**File: `src/components/admin/RecycleBinSection.tsx`** (new file)
- A collapsible section showing soft-deleted tenants
- Each row displays: company name, deletion date, "X days remaining" badge
- Restore button triggers: `UPDATE company_profiles SET deleted_at = null` and same for subscriptions
- Items older than 90 days show an "Expired" badge instead of days remaining (data stays but is clearly marked)

**Restore logic:**
- Restoring sets `deleted_at = null` on both `company_profiles` and `subscriptions` for that `user_id`
- Invalidates both `admin-tenants` and `admin-tenants-deleted` query keys
