
# Tool Hire Management System -- 5th Industry Vertical

## Overview

Add "Tool Hire" as the 5th system type alongside Business, Workshop, School, and Legal. This system is designed for general equipment rental companies (construction tools, generators, party/event gear, etc.) with four core modules: Equipment Catalogue, Hire Orders, Availability Calendar, and Returns/Condition Tracking.

Given the scope, this should be built in **two phases**. Phase 1 gets the system selectable and wired up with the Equipment Catalogue and Hire Orders. Phase 2 adds the Availability Calendar and Returns Tracking.

---

## Phase 1 -- Foundation + Equipment + Hire Orders

### 1. Database Changes

**Update system_type constraint:**
```sql
ALTER TABLE public.subscriptions
  DROP CONSTRAINT subscriptions_system_type_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_system_type_check
  CHECK (system_type = ANY (ARRAY['business', 'workshop', 'school', 'legal', 'hire']));
```

**New tables:**

**`equipment_items`** -- the catalogue of tools/equipment available for hire
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | tenant owner |
| name | text | e.g. "Hilti TE 30 Hammer Drill" |
| category | text | e.g. "Power Tools", "Earthmoving", "Generators" |
| description | text | |
| serial_number | text | nullable, for tracking |
| daily_rate | numeric | |
| weekly_rate | numeric | nullable, discount rate |
| monthly_rate | numeric | nullable |
| deposit_amount | numeric | default 0 |
| condition | text | 'excellent', 'good', 'fair', 'poor' |
| status | text | 'available', 'on_hire', 'maintenance', 'retired' |
| image_url | text | nullable, photo stored in storage bucket |
| notes | text | nullable |
| created_at / updated_at | timestamptz | |

**`hire_orders`** -- rental agreements / bookings
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid | tenant owner |
| order_number | text | e.g. "HO-001" |
| client_id | uuid | nullable FK to clients |
| client_name | text | |
| client_phone | text | nullable |
| hire_start | date | |
| hire_end | date | expected return |
| actual_return_date | date | nullable, filled on return |
| status | text | 'draft', 'active', 'returned', 'overdue' |
| deposit_paid | numeric | default 0 |
| total | numeric | default 0 |
| notes | text | nullable |
| created_at / updated_at | timestamptz | |

**`hire_order_items`** -- line items linking equipment to orders
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| hire_order_id | uuid FK | |
| equipment_item_id | uuid FK | |
| equipment_name | text | snapshot |
| daily_rate | numeric | rate at time of hire |
| quantity | integer | default 1 |
| subtotal | numeric | |
| condition_out | text | condition when sent out |
| condition_in | text | nullable, condition on return |
| damage_notes | text | nullable |
| damage_charge | numeric | default 0 |

**Storage bucket:** `hire-assets` (public) for equipment photos.

**RLS policies:** Standard `auth.uid() = user_id` pattern on all new tables. `hire_order_items` uses the parent join pattern (check hire_order belongs to user).

**Platform modules to seed** (insert into `platform_modules`):
- `hire_equipment` -- Equipment Catalogue (system_type: 'hire')
- `hire_orders` -- Hire Orders (system_type: 'hire')
- `hire_calendar` -- Availability Calendar (system_type: 'hire')
- `hire_returns` -- Returns & Tracking (system_type: 'hire')

### 2. Signup / Auth Flow Updates

| File | Change |
|------|--------|
| `src/components/auth/SystemSelector.tsx` | Add "Tool Hire" option with `Hammer` icon, `from-amber-500 to-orange-500` gradient, M400 starting price |
| `src/components/auth/PackageTierSelector.tsx` | Add `hireTiers` array (Starter M400, Professional M600, Enterprise M850) and add to `SYSTEM_CONFIG` |
| `src/hooks/useSubscription.tsx` | Add `'hire'` to the `SystemType` union |

**Hire pricing tiers:**
- **Starter (M400/mo):** Equipment Catalogue, Invoices, Tasks, Staff
- **Professional (M600/mo):** + Hire Orders, Accounting (most popular)
- **Enterprise (M850/mo):** + Availability Calendar, Returns Tracking, CRM

### 3. Landing Page Updates

| File | Change |
|------|--------|
| `src/components/landing/PricingTable.tsx` | Add `hire` system tab with `Hammer` icon and the three tiers |
| `src/components/landing/Solutions.tsx` | Add Tool Hire solution card (if this component exists) |

### 4. Navigation Updates

| File | Change |
|------|--------|
| `src/components/layout/Sidebar.tsx` | Add hire-specific nav items: Equipment (`/equipment`), Hire Orders (`/hire-orders`), Clients (shared) |
| `src/components/layout/BottomNav.tsx` | Add hire bottom nav items for Equipment and Hire Orders |
| `src/components/layout/MoreMenuSheet.tsx` | Add hire items to the "More" drawer |

### 5. Dashboard

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Add lazy-loaded `HireDashboard` for `systemType === 'hire'` |
| `src/pages/HireDashboard.tsx` | **New** -- stat cards (total equipment, items on hire, overdue returns, revenue this month), recent hire orders list, equipment status breakdown |

### 6. Equipment Catalogue Page

| File | Change |
|------|--------|
| `src/pages/Equipment.tsx` | **New** -- list/grid view of all equipment items with search, category filter, status filter. Add/edit equipment dialog with photo upload. |
| `src/hooks/useEquipment.tsx` | **New** -- CRUD hook for `equipment_items` table |

### 7. Hire Orders Page

| File | Change |
|------|--------|
| `src/pages/HireOrders.tsx` | **New** -- list of hire orders with status tabs (All, Active, Overdue, Returned). Create hire order dialog with client selection, date range, equipment item picker. |
| `src/hooks/useHireOrders.tsx` | **New** -- CRUD hook for `hire_orders` + `hire_order_items` |

### 8. Admin / Settings Updates

| File | Change |
|------|--------|
| `src/components/admin/AdminOverviewTab.tsx` | Add `hire` to `SYSTEM_CONFIG` with `Hammer` icon |
| `src/components/admin/ModuleManagement.tsx` | Add `hire` to `systemGroups` array |
| `src/pages/Settings.tsx` | Add `'hire'` case for company name label: "Business Name" |
| `src/App.tsx` | Add routes for `/equipment` and `/hire-orders` |

### 9. Routing

Add to `src/App.tsx`:
```
/equipment -> <Equipment />
/hire-orders -> <HireOrders />
```

---

## Phase 2 (follow-up prompt)

- **Availability Calendar** -- visual calendar showing which equipment is booked on which dates
- **Returns & Condition Tracking** -- dedicated returns workflow with condition comparison (out vs. in), damage charges, late fee calculation
- **Hire Order PDF/Preview** -- printable hire agreement document

---

## Files Summary (Phase 1)

| File | Action |
|------|--------|
| Database migration | New tables + constraint update + storage bucket + module seeds |
| `src/hooks/useSubscription.tsx` | Add `'hire'` to SystemType |
| `src/components/auth/SystemSelector.tsx` | Add Tool Hire card |
| `src/components/auth/PackageTierSelector.tsx` | Add hire tiers |
| `src/components/landing/PricingTable.tsx` | Add hire pricing tab |
| `src/components/layout/Sidebar.tsx` | Add hire nav items |
| `src/components/layout/BottomNav.tsx` | Add hire bottom nav |
| `src/components/layout/MoreMenuSheet.tsx` | Add hire menu items |
| `src/components/admin/AdminOverviewTab.tsx` | Add hire to system config |
| `src/components/admin/ModuleManagement.tsx` | Add hire to system groups |
| `src/pages/Settings.tsx` | Add hire label for company name |
| `src/pages/Dashboard.tsx` | Add HireDashboard case |
| `src/pages/HireDashboard.tsx` | **New** -- hire dashboard |
| `src/pages/Equipment.tsx` | **New** -- equipment catalogue |
| `src/pages/HireOrders.tsx` | **New** -- hire orders |
| `src/hooks/useEquipment.tsx` | **New** -- equipment CRUD hook |
| `src/hooks/useHireOrders.tsx` | **New** -- hire orders CRUD hook |
| `src/App.tsx` | Add new routes |
