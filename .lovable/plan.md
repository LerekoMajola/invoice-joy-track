

# Assign Tasks to Staff Members

## What Changes

You'll be able to assign any task to a staff member from your team. The task list and detail panel will show who a task is assigned to, and you can filter by assignee.

## Database Change

Add two new columns to the `tasks` table:
- `assigned_to` (UUID, nullable) -- references the staff member's ID
- `assigned_to_name` (text, nullable) -- stores the staff member's name for quick display (avoids extra joins)

## UI Changes

### Add Task Dialog
- New "Assign To" dropdown showing your staff members (optional field)

### Task List Item
- Show a small avatar/initials badge with the assigned person's name next to the priority badge

### Task Detail Panel
- "Assigned To" section with a staff member selector
- Ability to change or remove assignment

### Filters
- New "Assignee" filter dropdown on the Tasks page (All / Unassigned / specific staff member)

## Files

| File | Action |
|------|--------|
| Database migration | Add `assigned_to` and `assigned_to_name` columns to `tasks` table |
| `src/hooks/useTasks.tsx` | Update `Task` interface and `CreateTaskInput`/`UpdateTaskInput` to include assignment fields |
| `src/pages/Tasks.tsx` | Add assignee dropdown to Add Task dialog, add assignee filter |
| `src/components/tasks/TaskListItem.tsx` | Show assigned staff name/initials |
| `src/components/tasks/TaskDetailPanel.tsx` | Add assignee selector section |

## Technical Details

### Migration SQL

```sql
ALTER TABLE public.tasks
  ADD COLUMN assigned_to uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  ADD COLUMN assigned_to_name text;
```

### useTasks.tsx Changes
- Add `assigned_to` and `assigned_to_name` to the `Task`, `CreateTaskInput`, and `UpdateTaskInput` interfaces
- Pass the new fields through in `createTask` and `updateTask` mutations

### Tasks.tsx Changes
- Import `useStaff` hook to get the staff list
- Add `assigneeFilter` state (default `'all'`)
- Add a `Select` dropdown for assignee filtering alongside the priority filter
- Add an "Assign To" `Select` in the Add Task dialog with staff members listed
- When a staff member is selected, store both `assigned_to` (ID) and `assigned_to_name` (name)

### TaskListItem.tsx Changes
- If `assigned_to_name` exists, render a small initials circle and truncated name between the due date and priority badge

### TaskDetailPanel.tsx Changes
- Add an "Assigned To" section below Due Date
- Render a `Select` dropdown populated from `useStaff()` with an "Unassigned" option
- On change, call `onUpdate({ assigned_to, assigned_to_name })`

