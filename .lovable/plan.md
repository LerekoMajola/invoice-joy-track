

# School Management System -- Integrated into Orion Labs

A school management module that plugs directly into the existing Orion Labs multi-tenant platform. Schools subscribe to school-specific modules just like workshop businesses subscribe to the Workshop module.

---

## How It Fits Into the Existing Platform

The key insight is that Orion Labs is already a modular, multi-tenant SaaS. A school is just another type of tenant. Instead of building a separate system, we add school-specific modules to the existing module catalog:

```text
Existing Modules              New School Modules
-----------------              ------------------
Core CRM                       School Admin (classes, terms)
Quotes                         Student Management
Invoices      <-- reused -->   School Fees (fee schedules, payment tracking)
Staff & HR    <-- reused -->   (teachers are staff members)
Tasks         <-- reused -->   (school tasks/to-dos)
Notifications <-- reused -->   (fee reminders, announcements)
```

This means:
- Schools sign up on Orion Labs the same way any business does
- During signup, they select the school modules from the "Build Your Package" screen
- The existing invoicing system handles fee invoices
- The existing staff system handles teachers
- The existing notification system handles fee reminders and announcements
- Navigation is automatically gated to show only school-relevant items

---

## What Gets Built (Phase 1)

### 1. Student Management

The centrepiece -- managing student records with guardian information.

**Student profiles include:**
- Student name, date of birth, gender
- Admission number (auto-generated: STU-0001, STU-0002)
- Class/grade assignment
- Guardian/parent details (name, phone, email, relationship)
- Secondary guardian (optional)
- Address
- Medical notes (allergies, conditions)
- Status: Active / Graduated / Withdrawn / Suspended
- Profile photo (optional, using existing storage)
- Enrollment date

**UI:**
- Searchable list with mobile card view + desktop table (same pattern as Clients/Invoices)
- Detail dialog with full profile, guardian info, fee history
- Filter by class, status

### 2. Academic Structure (Classes and Terms)

Organise students into classes and track academic periods.

**Classes:**
- Class name (e.g. "Grade 1A", "Form 3")
- Class teacher (linked to staff_members)
- Capacity
- Academic level/grade

**Academic Terms:**
- Term name (e.g. "Term 1 2026")
- Start date, end date
- Is current term flag

### 3. School Fee Management

Track what each student owes and what has been paid. This builds ON TOP of the existing invoicing infrastructure.

**Fee Schedules:**
- Define fee types per term (Tuition, Transport, Uniform, Books, etc.)
- Set amounts per fee type
- Assign to specific classes or all students

**Student Fee Invoices:**
- Generate fee invoices for individual students or bulk-generate for an entire class
- Each invoice links to a student record
- Uses the existing `invoices` + `invoice_line_items` tables with a new `student_id` reference
- Tracks: Amount due, amount paid, balance outstanding
- Payment recording (date, amount, method, reference)

**Fee Dashboard:**
- Total fees expected this term
- Total collected
- Total outstanding
- Collection rate percentage
- Per-class breakdown

### 4. School Announcements

Send messages to all parents or specific classes.

- Title, message body, target audience (All / specific class)
- Sent via the existing notification system
- Visible on parent/guardian view (Phase 2)

### 5. School Dashboard

A dedicated dashboard tab (or the main dashboard adapts when school modules are active) showing:
- Total students (active)
- Fees collected this term
- Outstanding fees
- Announcements count
- Quick actions: Add Student, Record Payment, New Announcement

---

## Phase 2 (Future -- Not Built Now)

These features are scoped out for now but designed to be added later:
- **Parent Portal**: Separate login for parents to view their child's info, fee statements, and announcements
- **Attendance Tracking**: Daily attendance per class
- **Report Cards / Grades**: Term-end academic results
- **Timetable Management**: Class schedules
- **Teacher-specific views**: Class rosters, attendance marking

---

## Technical Details

### New Database Tables

**`students`**

| Column | Type | Default |
|--------|------|---------|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | auth user (school tenant) |
| admission_number | text | auto: STU-0001 |
| first_name | text | required |
| last_name | text | required |
| date_of_birth | date (nullable) | null |
| gender | text (nullable) | null |
| class_id | uuid FK (nullable) | null |
| enrollment_date | date (nullable) | null |
| status | text | 'active' |
| address | text (nullable) | null |
| medical_notes | text (nullable) | null |
| photo_url | text (nullable) | null |
| guardian_name | text (nullable) | null |
| guardian_phone | text (nullable) | null |
| guardian_email | text (nullable) | null |
| guardian_relationship | text (nullable) | null |
| secondary_guardian_name | text (nullable) | null |
| secondary_guardian_phone | text (nullable) | null |
| notes | text (nullable) | null |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

RLS: Standard user_id-based policies.

**`school_classes`**

| Column | Type | Default |
|--------|------|---------|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | auth user |
| name | text | required |
| grade_level | text (nullable) | null |
| class_teacher_id | uuid FK (nullable) | null (links to staff_members) |
| capacity | integer (nullable) | null |
| is_active | boolean | true |
| sort_order | integer | 0 |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

RLS: Standard user_id-based policies.

**`academic_terms`**

| Column | Type | Default |
|--------|------|---------|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | auth user |
| name | text | required (e.g. "Term 1 2026") |
| start_date | date | required |
| end_date | date | required |
| is_current | boolean | false |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

RLS: Standard user_id-based policies.

**`fee_schedules`**

| Column | Type | Default |
|--------|------|---------|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | auth user |
| term_id | uuid FK | required (links to academic_terms) |
| class_id | uuid FK (nullable) | null (null = applies to all) |
| fee_type | text | required (e.g. "Tuition", "Transport") |
| amount | numeric | required |
| is_optional | boolean | false |
| created_at | timestamptz | now() |

RLS: Standard user_id-based policies.

**`student_fee_payments`**

| Column | Type | Default |
|--------|------|---------|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | auth user |
| student_id | uuid FK | required |
| term_id | uuid FK | required |
| amount | numeric | required |
| payment_date | date | required |
| payment_method | text (nullable) | null |
| reference_number | text (nullable) | null |
| notes | text (nullable) | null |
| created_at | timestamptz | now() |

RLS: Standard user_id-based policies.

**`school_announcements`**

| Column | Type | Default |
|--------|------|---------|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | auth user |
| title | text | required |
| message | text | required |
| target_class_id | uuid FK (nullable) | null (null = all) |
| is_published | boolean | false |
| published_at | timestamptz (nullable) | null |
| created_at | timestamptz | now() |

RLS: Standard user_id-based policies.

**Existing table updates:**
- Add `student_id` (uuid, nullable) column to the `invoices` table to link fee invoices to students

### New Module Registration

Three new modules inserted into `platform_modules`:

| Name | Key | Icon | Price | Core |
|------|-----|------|-------|------|
| School Admin | school_admin | School | M100/mo | No |
| Student Management | students | GraduationCap | M80/mo | No |
| School Fees | school_fees | Wallet | M60/mo | No |

### New Files to Create

| File | Purpose |
|------|---------|
| Migration SQL | Create all school tables, add student_id to invoices, insert modules |
| `src/pages/Students.tsx` | Student list page with search, filters, add dialog |
| `src/pages/SchoolAdmin.tsx` | Classes, terms, announcements management |
| `src/pages/SchoolFees.tsx` | Fee dashboard, schedules, payment recording |
| `src/hooks/useStudents.tsx` | CRUD hook for students (follows useInvoices pattern) |
| `src/hooks/useSchoolClasses.tsx` | CRUD hook for classes and terms |
| `src/hooks/useSchoolFees.tsx` | Fee schedules, payments, balance calculations |
| `src/components/school/AddStudentDialog.tsx` | Student intake form with guardian details |
| `src/components/school/StudentDetailDialog.tsx` | Full student profile with fee history |
| `src/components/school/ClassManagement.tsx` | CRUD for classes |
| `src/components/school/TermManagement.tsx` | CRUD for academic terms |
| `src/components/school/FeeScheduleManager.tsx` | Set up fee types and amounts per term/class |
| `src/components/school/RecordPaymentDialog.tsx` | Record a fee payment for a student |
| `src/components/school/AnnouncementDialog.tsx` | Create and publish announcements |
| `src/components/school/FeeStatCards.tsx` | Fee collection summary cards |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add /students, /school-admin, /school-fees routes |
| `src/components/layout/Sidebar.tsx` | Add 3 school nav items with module keys |
| `src/components/layout/BottomNav.tsx` | Add school routes to moreRoutes |
| `src/components/layout/MoreMenuSheet.tsx` | Add school menu items |

### Patterns Followed

- Same hook structure as useInvoices (useState + useEffect + CRUD)
- Same auto-number generation (STU-0001 pattern for admission numbers)
- Same mobile card view + desktop table view pattern
- Same summary stats cards at the top of pages
- Same dialog patterns for create/edit/detail
- Same module gating via moduleKey in navigation
- Same notification system for fee reminders and announcements
- Same RLS pattern (user_id-based ownership)

### Integration with Existing Features

**Invoicing:** Fee invoices are standard invoices with a `student_id` reference. Schools can generate fee invoices that appear in both the School Fees page AND the regular Invoices page.

**Staff:** Teachers are managed through the existing Staff module. The `class_teacher_id` on `school_classes` links to `staff_members`.

**Notifications:** Fee reminders and announcements use the existing `notifications` table and real-time system.

**Tasks:** School admin tasks (report card deadlines, parent meetings) use the existing Tasks module.

