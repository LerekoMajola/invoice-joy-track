

## Fix: Workout Display and "AI" Label

### Root Cause

Two issues found:

1. **Workouts exist but are invisible**: The member's `fitness_goal` never saves because the portal user only has a SELECT policy on `gym_members` -- no UPDATE. So after generating a workout, the goal reverts to empty on reload, which disables the workout query entirely. The plans are in the database but the UI never fetches them.

2. **"AI is crafting your workout..." label**: The loading text explicitly says "AI" which the user wants removed.

### Fix 1: RLS policy for portal member to update their own fitness_goal

Add an UPDATE policy on `gym_members` so portal users can update their own `fitness_goal` column:

```sql
CREATE POLICY "Portal: member updates own fitness_goal"
  ON public.gym_members
  FOR UPDATE
  USING (portal_user_id = auth.uid())
  WITH CHECK (portal_user_id = auth.uid());
```

### Fix 2: Remove "AI" from loading text

Change line 459:
- From: `'AI is crafting your workout...'`
- To: `'Generating your workout...'`

### Fix 3: Show workout even without goal selected

If there are existing plans in the database for today, show them regardless of whether a goal is currently selected. Change the query's `enabled` condition to always fetch, and if a plan exists, auto-set the selected goal from the plan's goal field.

### Files to Change

| File | Change |
|------|--------|
| **Migration** | Add UPDATE RLS policy on `gym_members` for portal users |
| `src/components/portal/gym/GymPortalProgress.tsx` | Remove "AI" from loading text; always enable plan query; auto-populate goal from existing plan |
