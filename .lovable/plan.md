

## Add Time and Notification Reminder to Tasks

### What Changes

1. **Due Time field** -- Tasks currently only have a date. A time picker will be added so you can set a specific time (e.g., "2:30 PM").

2. **Reminder setting** -- A dropdown to choose when to be notified before the task time: "At the time", "5 min before", "15 min before", "30 min before", "1 hour before", or "No reminder".

3. **Notification at the chosen time** -- The background reminder job will check task times and send notifications based on your chosen reminder offset.

### Where You'll See It

- **Add Task dialog**: New "Due Time" input and "Reminder" dropdown below the date picker
- **Task Detail Panel**: Same time and reminder fields in the edit side-sheet
- **Task List**: Time shown next to the date badge (e.g., "Mar 5 at 2:30 PM")

### Technical Details

**Database migration** -- Add two columns to `tasks` table:
- `due_time` (time without time zone, nullable) -- the time of day for the task
- `reminder_minutes_before` (integer, nullable, default 15) -- minutes before due time to send the notification (0 = at time, null = no reminder)

**Files to modify:**

| File | Change |
|------|--------|
| `src/hooks/useTasks.tsx` | Add `due_time` and `reminder_minutes_before` to Task interface, CreateTaskInput, UpdateTaskInput, and insert/update calls |
| `src/pages/Tasks.tsx` | Add time input and reminder select to the Add Task dialog |
| `src/components/tasks/TaskDetailPanel.tsx` | Add time picker and reminder select to the detail/edit panel |
| `src/components/tasks/TaskListItem.tsx` | Display time alongside the due date |
| `supabase/functions/check-task-reminders/index.ts` | Update to check current time against `due_date + due_time - reminder_minutes_before` and only send notifications for tasks whose reminder window has been reached |

**Reminder options available:**
- No reminder
- At the time (0 min)
- 5 minutes before
- 15 minutes before (default)
- 30 minutes before
- 1 hour before

