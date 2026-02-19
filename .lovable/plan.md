

## Fix: Tasks Not Appearing After Creation

### Problem
When you create a task while using a specific company profile (like "Lawpro"), the task is saved to the database **without** linking it to that company. However, the task list filters by your active company -- so the new task doesn't show up because it has no company attached.

### Solution
Update the task creation logic to include the active company ID when saving a new task. This is a one-line fix in the `useTasks` hook.

---

### Technical Details

**File:** `src/hooks/useTasks.tsx`

In the `createTask` mutation, add `company_profile_id: activeCompanyId` to the insert object (around line 85-95). This ensures new tasks are associated with the currently active company, so they appear in the filtered task list.

The `activeCompanyId` is already available in the hook (imported and used for the query on line 49), so no additional imports or context changes are needed.
