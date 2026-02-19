
## Root Cause: Multiple Isolated Hook Instances

The bug is caused by **each component calling `useAdminProspects()` independently**, creating completely separate, isolated copies of the `prospects` state array. When one component updates its copy, the others know nothing about it.

Currently there are **4 separate instances** running simultaneously:
- `AdminCRMTab` — owns the `prospects` list displayed on screen
- `ProspectKanban` — calls its own `useAdminProspects()` just to get `moveProspect`
- `ProspectDetailSheet` — calls its own `useAdminProspects()` to get `updateProspect` / `deleteProspect`
- `AddProspectDialog` — calls its own `useAdminProspects()` to get `createProspect`

This is confirmed by the network logs showing **5 identical GET requests** to `admin_prospects` firing at the same time on page load.

When you add a prospect via `AddProspectDialog`, it inserts into the database and updates its own local state — but `AdminCRMTab`'s state is a completely separate variable and never receives the update. Switching tabs forces a full re-mount, which re-runs `fetchProspects()` from scratch in `AdminCRMTab`, which is why you see the data after tab-switching.

---

## The Fix: Lift State to the Top Level

The solution is the **single source of truth pattern**: call `useAdminProspects()` only once in `AdminCRMTab`, then pass the necessary functions down as props to child components. No child should call the hook directly.

### Component Hierarchy After Fix

```text
AdminCRMTab  (owns the single useAdminProspects() instance)
├── ProspectKanban     receives: prospects, moveProspect, onCardClick
│   └── AddProspectDialog  receives: createProspect
└── ProspectDetailSheet    receives: prospect, updateProspect, deleteProspect, fetchActivities, addActivity
```

### Files to Change

**1. `src/components/admin/crm/ProspectKanban.tsx`**
- Remove `const { moveProspect } = useAdminProspects()` call
- Add `moveProspect` to the `ProspectKanbanProps` interface
- Add `createProspect` to props and pass it into `AddProspectDialog`

**2. `src/components/admin/crm/AddProspectDialog.tsx`**
- Remove `const { createProspect } = useAdminProspects()` call
- Add `createProspect` to the `AddProspectDialogProps` interface and accept it as a prop

**3. `src/components/admin/crm/ProspectDetailSheet.tsx`**
- Remove `const { updateProspect, deleteProspect, fetchActivities, addActivity } = useAdminProspects()` call
- Add those 4 functions to the `ProspectDetailSheetProps` interface and accept them as props

**4. `src/components/admin/crm/AdminCRMTab.tsx`**
- This already calls `useAdminProspects()` — now also destructure `updateProspect`, `deleteProspect`, `fetchActivities`, `addActivity`, `moveProspect`, `createProspect`
- Pass them down to `ProspectKanban`, `ProspectDetailSheet`, and `AddProspectDialog`

No database changes, no new files — this is purely a React state architecture fix. After this change, all mutations will update the single `prospects` array in `AdminCRMTab` and the UI will reflect changes instantly.
