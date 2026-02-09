
# Add "Workshop" Department and "Technician" Job Title Defaults

## What Changes

### File: `src/components/staff/AddStaffDialog.tsx`

1. **Add "Workshop" to the departments list** so technicians have a proper department:
   ```
   { value: 'workshop', label: 'Workshop' }
   ```

2. **Add a "Technician" preset to the job title field** -- either as a suggestion placeholder or as a quick-select. Since the job title is a free-text field, the simplest approach is to change the placeholder to reflect the workshop use case and add common workshop job titles as quick-select chips (e.g., "Technician", "Senior Technician", "Workshop Foreman").

### Updated departments array:
```
operations, sales, finance, admin, workshop, other
```

### Job title enhancement:
Add clickable suggestion chips below the job title input for common roles like "Technician", "Senior Technician", "Workshop Foreman" -- these populate the input when clicked but still allow free text entry.

## Technical Details

**Single file change:** `src/components/staff/AddStaffDialog.tsx`

- Add `{ value: 'workshop', label: 'Workshop' }` to the `departments` array (before "Other")
- Add a small row of clickable suggestion badges below the Job Title input that set the field value when clicked (e.g., "Technician", "Senior Technician", "Foreman")
- When "Workshop" department is selected, the suggestions could prioritize workshop-relevant titles

This keeps things simple -- no database changes needed since `department` and `job_title` are plain text fields on `staff_members`.
