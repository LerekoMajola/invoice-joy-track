
# Add GymPro -- New Industry Vertical

## Overview
Add "GymPro" as the 8th system type in the platform suite, covering gym and fitness centre management with modules for members, class scheduling, attendance tracking, and payment/billing. Starting price: M500/mo.

## 1. Database Migration

Update the `subscriptions_system_type_check` constraint to allow `'gym'`:

```sql
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_system_type_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_system_type_check
  CHECK (system_type IN ('business', 'workshop', 'school', 'legal', 'hire', 'guesthouse', 'fleet', 'gym'));
```

Insert GymPro-specific platform modules into `platform_modules`:

| key | name | system_type | monthly_price |
|-----|------|-------------|---------------|
| gym_members | Members & Subscriptions | gym | 150 |
| gym_classes | Class Scheduling | gym | 100 |
| gym_attendance | Attendance Tracking | gym | 100 |
| gym_billing | Payment & Billing | gym | 150 |

## 2. Frontend Changes (10 files)

### A. Type Definitions
**`src/hooks/useSubscription.tsx`** -- Add `'gym'` to the `SystemType` union type.

### B. System Selector (Signup Flow)
**`src/components/auth/SystemSelector.tsx`** -- Add GymPro card with `Dumbbell` icon, gradient `from-lime-500 to-green-600`, description "Member management, class scheduling, attendance tracking & billing for gyms", starting price M500.

### C. Package Tiers (Signup Flow)
**`src/components/auth/PackageTierSelector.tsx`** -- Add `gymTiers` array (Starter M500, Professional M700, Enterprise M950) and register in `SYSTEM_CONFIG` as `gym: { label: 'GymPro', ... }`.

### D. Auth Page
**`src/pages/Auth.tsx`** -- Add `'gym'` to the URL param whitelist array and add GymPro entry to the `SYSTEM_META` record (review step).

### E. Dashboard Router
**`src/pages/Dashboard.tsx`** -- Lazy-import a new `GymDashboard` page and add `case 'gym'` to `renderDashboard()`.

### F. New Dashboard Page
**`src/pages/GymDashboard.tsx`** -- Create a simple executive dashboard showing placeholder stat cards (Total Members, Active Classes, Check-ins Today, Revenue This Month) using `DashboardLayout`. This will be expanded later with real data.

### G. Sidebar Navigation
**`src/components/layout/Sidebar.tsx`** -- Add GymPro nav items:
- Members (`/gym-members`, moduleKey `gym_members`, systemTypes `['gym']`)
- Classes (`/gym-classes`, moduleKey `gym_classes`, systemTypes `['gym']`)
- Attendance (`/gym-attendance`, moduleKey `gym_attendance`, systemTypes `['gym']`)

### H. Bottom Navigation (Mobile)
**`src/components/layout/BottomNav.tsx`** -- Add GymPro bottom nav items for Members and Classes. Add `/gym-members`, `/gym-classes`, `/gym-attendance` to the `moreRoutes` array.

### I. App Router
**`src/App.tsx`** -- Add protected routes for `/gym-members`, `/gym-classes`, `/gym-attendance` pointing to placeholder pages.

### J. Landing Page
**`src/components/landing/Solutions.tsx`** -- Add GymPro card with features list.
**`src/components/landing/Footer.tsx`** -- Add GymPro link under Solutions.

### K. Placeholder Pages
Create 3 minimal placeholder pages (`GymMembers.tsx`, `GymClasses.tsx`, `GymAttendance.tsx`) that render a `DashboardLayout` with a "Coming Soon" or empty-state card. These will be fleshed out with full CRUD in follow-up work.

## 3. Order of Operations

1. Run database migration (constraint + module inserts)
2. Update type definition in `useSubscription.tsx`
3. Create placeholder pages and dashboard
4. Update SystemSelector, PackageTierSelector, Auth page
5. Update Sidebar, BottomNav, App router
6. Update Landing page (Solutions + Footer)

## Technical Notes

- Internal database value: `'gym'` (lowercase, matching existing pattern)
- Brand name: **GymPro**
- Icon: `Dumbbell` from lucide-react
- Gradient: `from-lime-500 to-green-600`
- The `ModuleSelector` (custom build flow) and `TenantModuleManager` (admin) already dynamically filter by `system_type` from the database, so they will automatically pick up the new gym modules without code changes.
