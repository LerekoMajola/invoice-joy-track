

## Clean Up School (EduPro) Vertical -- Remove Non-School Modules

### Problem
School users currently get non-school modules like Clients, CRM, and Equipment because:
- Core modules (`core_crm`, `hire_equipment`) are automatically assigned to ALL signups, including school
- The More Menu doesn't show School Admin and Timetable for school users
- The custom module builder has no school-specific allowed modules list

### Changes

#### 1. `src/pages/Auth.tsx` -- Fix core module auto-assignment
In the `saveSignupData` function, filter out core modules that don't belong to the school system. Only include core modules that are relevant to the selected system type (skip `core_crm` and `hire_equipment` for school signups).

#### 2. `src/components/auth/ModuleSelector.tsx` -- Add school to allowed shared keys
Add a `school` entry to `SYSTEM_ALLOWED_SHARED_KEYS` with only school-relevant shared modules:
```
school: ['invoices', 'tasks', 'accounting', 'staff']
```
This ensures the custom package builder only shows relevant modules for school users.

#### 3. `src/components/layout/MoreMenuSheet.tsx` -- Show school items for school users
Update School Admin and Timetable items from `systemTypes: ['business']` to `systemTypes: ['business', 'school']` so school users can access them from the More menu on mobile.

#### 4. `src/components/layout/Sidebar.tsx` -- Already correct
Students, School Admin, School Fees, and Timetable already have `systemTypes: ['business', 'school']`. Clients is gated to `['business', 'workshop', 'legal']` and CRM/Equipment to `['business']`, so they're already hidden for school users. No changes needed.

#### 5. `src/components/layout/BottomNav.tsx` -- Already correct
Students and Fees already show for school. No changes needed.

### Summary of files to edit
- `src/pages/Auth.tsx` -- skip non-school core modules during signup
- `src/components/auth/ModuleSelector.tsx` -- add school allowed keys
- `src/components/layout/MoreMenuSheet.tsx` -- show School Admin + Timetable for school system type

