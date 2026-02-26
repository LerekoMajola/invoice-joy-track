

## Reinstate EduPro (School) as a Standalone Vertical

### Overview
School management was previously consolidated into a BizPro add-on module. This plan reinstates it as a top-level vertical called **EduPro**, alongside BizPro, LawPro, and GymPro, so schools can sign up directly for a dedicated school management system.

### Database Changes

**1. Update `subscriptions.system_type` check constraint**
- Drop and recreate `subscriptions_system_type_check` to allow `'school'` in addition to `business`, `legal`, `gym`:
```sql
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_system_type_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_system_type_check 
  CHECK (system_type IN ('business', 'legal', 'gym', 'school'));
```

**2. Update `platform_modules` for school modules**
- Change `system_type` from `'shared'` to `'school'` for: `students`, `school_admin`, `school_fees`
```sql
UPDATE platform_modules SET system_type = 'school' WHERE key IN ('students', 'school_admin', 'school_fees');
```

No new tables needed -- school package tiers already exist in `package_tiers` with `system_type = 'school'`.

### Frontend Changes

**3. `src/hooks/useSubscription.tsx`**
- Add `'school'` to the `SystemType` union: `'business' | 'legal' | 'gym' | 'school'`

**4. `src/components/auth/SystemSelector.tsx`**
- Add `'school'` to the `SystemType` union
- Add a 4th card for EduPro with `GraduationCap` icon, teal/cyan gradient (`from-cyan-400 to-teal-600`), description "Student management, fee tracking, timetables & announcements for schools", starting price "M720"
- Update grid to `lg:grid-cols-4`

**5. `src/pages/Auth.tsx`**
- Add `'school'` to the allowed system types array on line 44: `['business', 'legal', 'gym', 'school']`

**6. `src/pages/Dashboard.tsx`**
- Lazy-import `SchoolDashboard`
- Add `case 'school'` to the `renderDashboard` switch to render `SchoolDashboard`

**7. `src/components/layout/Sidebar.tsx`**
- Update school nav items `systemTypes` from `['business']` to `['business', 'school']` for: Students, School Admin, School Fees, Timetable
- Also show Invoices for school (already `systemTypes: null`, so no change needed)

**8. `src/components/layout/BottomNav.tsx`**
- Update school nav items `systemTypes` from `['business']` to `['business', 'school']` for: Students, Fees

**9. `src/components/landing/Solutions.tsx`**
- Add EduPro card with `GraduationCap` icon, teal gradient, features list, and M720/mo price
- Update badge text from "3 Solutions" to "4 Solutions"

**10. `src/components/admin/adminConstants.ts`**
- Import `GraduationCap` icon
- Add `school: GraduationCap` to `SYSTEM_ICONS`
- Add `school: 'EduPro'` to `SYSTEM_LABELS`
- Add `school: 'bg-teal-600 text-white dark:bg-teal-500 dark:text-white'` to `SYSTEM_COLORS`

### Files Modified
- 1 database migration (constraint + module system_type update)
- `src/hooks/useSubscription.tsx`
- `src/components/auth/SystemSelector.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/landing/Solutions.tsx`
- `src/components/admin/adminConstants.ts`

