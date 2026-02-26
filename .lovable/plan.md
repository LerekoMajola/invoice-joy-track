

## Enhance School Parent Portal -- Reports, Messages & Announcements

### Overview
Expand the school parent portal from 3 tabs (Home, Fees, Timetable) to 5 tabs by adding **Reports** (academic progress/report cards) and **Messages** (direct messaging with the school). Announcements will be surfaced on the Home tab.

### Database Changes

**1. New table: `student_report_cards`**
Stores termly academic reports published by the school for each student.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| student_id | uuid FK -> students | |
| term_id | uuid FK -> academic_terms | |
| user_id | uuid | School owner |
| overall_grade | text | e.g. "A", "B+", nullable |
| overall_percentage | numeric | nullable |
| teacher_comments | text | nullable |
| principal_comments | text | nullable |
| attendance_days | int | nullable |
| attendance_total | int | nullable |
| is_published | boolean | default false |
| published_at | timestamptz | nullable |
| created_at | timestamptz | default now() |

RLS: Portal users can read their own child's published reports; school owners can CRUD all for their students.

**2. New table: `student_subject_grades`**
Per-subject grades within a report card.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| report_card_id | uuid FK -> student_report_cards | |
| subject_name | text | |
| grade | text | e.g. "A", "B+" |
| percentage | numeric | nullable |
| teacher_comment | text | nullable |
| created_at | timestamptz | default now() |

RLS: Inherits access through the parent report_card_id lookup.

**3. Enable realtime for `portal_messages` and `school_announcements`**
Already existing tables -- just ensure realtime publication for live updates.

### Frontend Changes

**4. Update `PortalLayout.tsx`**
- Add `'reports'` and `'messages'` to the `PortalTab` type union
- Add two new items to the `schoolNav` array:
  - `{ id: 'reports', label: 'Reports', icon: FileText }`
  - `{ id: 'messages', label: 'Messages', icon: MessageCircle }`
- Total school nav: Home, Fees, Timetable, Reports, Messages (5 items)

**5. New component: `src/components/portal/school/SchoolPortalReports.tsx`**
- Fetches `student_report_cards` (where `is_published = true`) joined with `student_subject_grades`
- Groups by term, shows expandable cards per term
- Displays overall grade/percentage, per-subject grades table, teacher/principal comments
- Attendance summary if available
- Empty state: "No report cards published yet"

**6. New component: `src/components/portal/school/SchoolPortalMessages.tsx`**
- Thin wrapper around the existing `PortalMessaging` shared component
- Passes `portalType: 'school'`, `senderType: 'guardian'`, `referenceId: student.id`, `recipientOwnerId: ownerUserId`
- Reuses the full messaging UI (real-time chat with the school)

**7. Update `SchoolParentPortal.tsx` (Home tab)**
- Add an **Announcements** section that fetches from `school_announcements` where `is_published = true` and either `target_class_id` matches the student's class or is null (school-wide)
- Display as a list of announcement cards with title, message preview, and published date
- Make the Quick Actions (Timetable, Messages, Fees) clickable by accepting an `onTabChange` callback

**8. Update `src/pages/Portal.tsx`**
- Import the two new components
- Add `case 'reports'` and `case 'messages'` to the `renderSchoolTab` switch

### Admin-Side (School Owner)

**9. Add report card management to School Admin page**
- New section or tab on the existing SchoolAdmin page for creating/publishing report cards
- Form to select student + term, enter subject grades, overall comments
- Bulk publish toggle
- This allows the school to create reports that parents then see in their portal

### Files to Create
- `src/components/portal/school/SchoolPortalReports.tsx`
- `src/components/portal/school/SchoolPortalMessages.tsx`

### Files to Modify
- `src/components/portal/PortalLayout.tsx` -- add reports + messages tabs
- `src/pages/Portal.tsx` -- add routing for new tabs
- `src/components/portal/school/SchoolParentPortal.tsx` -- add announcements + clickable quick actions
- `src/pages/SchoolAdmin.tsx` -- add report card management UI

### Database Migration
- Create `student_report_cards` and `student_subject_grades` tables with RLS
- Add realtime publication for `school_announcements`

