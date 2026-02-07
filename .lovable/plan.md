

# Add School Timetable Feature

## Overview

Add a timetable management system that lets schools define subjects, create time periods (period slots), and assign subjects to specific class/day/period combinations. The timetable will be viewable as a weekly grid per class.

## New Database Tables

### 1. `school_subjects`
Stores the subjects offered by the school (e.g., Mathematics, English, Science).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | Tenant owner |
| name | text | e.g. "Mathematics" |
| short_code | text | e.g. "MATH" (optional, for compact grid display) |
| color | text | Hex color for visual differentiation on the grid |
| is_active | boolean | Default true |
| created_at | timestamptz | Default now() |

### 2. `school_periods`
Defines the daily time slots (e.g., Period 1: 08:00-08:45, Break: 10:30-11:00).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | Tenant owner |
| name | text | e.g. "Period 1", "Break" |
| start_time | time | e.g. 08:00 |
| end_time | time | e.g. 08:45 |
| is_break | boolean | Default false (marks break/lunch slots) |
| sort_order | integer | For display ordering |
| created_at | timestamptz | Default now() |

### 3. `timetable_entries`
The actual timetable slots -- links a class + day + period to a subject and optionally a teacher.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | Tenant owner |
| class_id | uuid | FK to school_classes |
| subject_id | uuid | FK to school_subjects |
| period_id | uuid | FK to school_periods |
| teacher_id | uuid | FK to staff_members (optional) |
| day_of_week | integer | 1=Monday ... 5=Friday |
| room | text | Optional room/venue |
| created_at | timestamptz | Default now() |
| Unique constraint | | (class_id, period_id, day_of_week) -- one subject per slot |

All three tables will have standard RLS policies: users can only CRUD their own records (`auth.uid() = user_id`).

## New Files

### Hook: `src/hooks/useTimetable.tsx`
- CRUD for subjects, periods, and timetable entries
- Fetches all three tables in parallel
- Provides helper functions: `createSubject`, `updateSubject`, `deleteSubject`, `createPeriod`, `updatePeriod`, `deletePeriod`, `createEntry`, `updateEntry`, `deleteEntry`

### Page: `src/pages/Timetable.tsx`
Main timetable page with three tabs:

**Tab 1 -- Timetable View (default)**
- Class selector dropdown at the top
- Weekly grid: days as columns (Mon-Fri), periods as rows
- Each cell shows subject name (color-coded), teacher name, and room
- Empty cells show a "+" button to quickly add an entry
- Click an entry to edit or delete it

**Tab 2 -- Subjects**
- List of all subjects with name, short code, and color swatch
- Add/Edit/Delete subjects via a dialog
- Shows how many timetable slots use each subject

**Tab 3 -- Periods**
- List of all time periods in order
- Add/Edit/Delete periods via a dialog
- Mark slots as "Break" (these render differently on the grid -- greyed out, spanning all columns)

### Components

| File | Purpose |
|------|---------|
| `src/components/timetable/TimetableGrid.tsx` | The weekly grid view component |
| `src/components/timetable/SubjectManagement.tsx` | Subject CRUD list + dialog |
| `src/components/timetable/PeriodManagement.tsx` | Period CRUD list + dialog |
| `src/components/timetable/TimetableEntryDialog.tsx` | Dialog to add/edit a timetable entry (select subject, teacher, room) |

## Navigation Integration

- Add a "Timetable" entry to the Sidebar with a `Clock` icon and module key `'school_admin'` (reusing the school_admin module so no new module is needed)
- Add it to the MoreMenuSheet for mobile
- Add `/timetable` route to App.tsx
- Add the route to the `moreRoutes` array in BottomNav.tsx

## Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/timetable` route |
| `src/components/layout/Sidebar.tsx` | Add Timetable nav item |
| `src/components/layout/BottomNav.tsx` | Add `/timetable` to moreRoutes |
| `src/components/layout/MoreMenuSheet.tsx` | Add Timetable menu item |

## UI Design

The timetable grid will follow the existing card-based design system:

```text
+----------+----------+----------+----------+----------+
|          |  Monday  | Tuesday  |Wednesday | Thursday |  Friday  |
+----------+----------+----------+----------+----------+
| 08:00    | Math     | English  | Science  | Math     | Art      |
| 08:45    | Mr. K    | Ms. T    | Mr. L    | Mr. K    | Ms. R    |
+----------+----------+----------+----------+----------+
| 08:50    | English  | Math     | History  | Science  | Math     |
| 09:35    | Ms. T    | Mr. K    | Ms. P    | Mr. L    | Mr. K    |
+----------+----------+----------+----------+----------+
| BREAK    |          10:30 - 11:00                     |
+----------+----------+----------+----------+----------+
```

- Subject cells are color-coded using the subject's assigned color
- Break periods span the full row width with a muted background
- On mobile, the grid scrolls horizontally with the period column fixed
- Empty slots show a dashed border with a "+" icon for quick entry creation

