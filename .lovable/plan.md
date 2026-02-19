
# Gym-Specific Roles for GymPro Staff

## What's changing

Both the "Add Staff" dialog and the "Staff Detail" dialog currently show generic roles (Admin, Manager, Staff, Viewer) and generic job title suggestions (Technician, Senior Technician, Workshop Foreman). These will be made context-aware so that GymPro tenants see fitness industry roles and job titles instead.

## How the system type is detected

`useSubscription()` exposes a `systemType` value (e.g. `'gym'`, `'business'`, `'workshop'`) read from the subscriptions table. This will be imported into both dialogs to conditionally swap the role and job title lists.

## New GymPro-specific content

**Roles:**
- Head Coach
- Personal Trainer
- Group Fitness Instructor
- Receptionist
- Membership Consultant
- Facility Manager
- Nutritionist
- Physiotherapist
- Admin
- Viewer

**Job Title Suggestions:**
- Personal Trainer
- Group Fitness Instructor
- Head Coach
- Receptionist
- Membership Consultant
- Facility Manager
- Nutritionist
- Physiotherapist

**Departments (Gym-specific):**
- Fitness
- Reception
- Management
- Nutrition & Wellness
- Maintenance
- Admin

## Files to edit

### 1. `src/components/staff/AddStaffDialog.tsx`
- Import `useSubscription`
- Replace the hardcoded `defaultRoles`, `jobTitleSuggestions`, and `departments` arrays with context-aware versions that swap based on `systemType === 'gym'`

### 2. `src/components/staff/StaffDetailDialog.tsx`
- Import `useSubscription`
- Replace the hardcoded `defaultRoles` constant with a context-aware version

No database changes are required — roles are stored as free-text strings in the `staff_roles` table, so any string value works.
