

## Fix: Add Permanent Delete for Companies

### Problem
When you try to delete a company from the Signups tab, the edge function detects existing `company_profiles` and falls back to a **soft-delete** (setting `deleted_at`). The record then reappears because it's never truly removed.

### Solution
Add a `permanent_delete` action to the edge function that deletes ALL tenant data across every table, then removes the auth user. Wire it up in both the **Signups tab** (for the existing delete button) and the **Recycle Bin** (as a new permanent delete button).

### Changes

**1. Edge Function (`supabase/functions/admin-get-signups/index.ts`)**
- Add a new `action: "permanent_delete"` handler
- Delete rows from all ~80 tables that have a `user_id` column, in dependency-safe order
- Finally call `adminClient.auth.admin.deleteUser()` to remove the auth account
- This action skips the soft-delete guard entirely

**2. Signups Tab (`src/components/admin/SignupsTab.tsx`)**
- Change the delete mutation to use `action: 'permanent_delete'` for onboarded users (those with company profiles), so clicking delete actually removes them
- Keep existing confirmation dialog

**3. Recycle Bin (`src/components/admin/RecycleBinSection.tsx`)**
- Add a red "Permanent Delete" button next to "Restore"
- Use `TypeToConfirmDeleteDialog` requiring the company name to be typed
- Call the same `permanent_delete` action on the edge function

### Tables to delete from (all have `user_id` column, no FK constraints):
All ~80 public tables with `user_id` will be cleaned in the edge function using a loop pattern to keep code maintainable:
```typescript
const tables = [
  'notifications', 'push_subscriptions', 'lead_activities', 'client_activities',
  'client_documents', 'deal_tasks', 'deal_stakeholders', /* ... all tables ... */
  'subscriptions', 'company_profiles', 'user_modules', 'user_roles',
  'user_preferences', 'notification_preferences'
];
for (const table of tables) {
  await adminClient.from(table).delete().eq('user_id', deleteUserId);
}
```

