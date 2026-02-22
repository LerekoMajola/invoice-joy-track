

## Consolidate to 3 Verticals: BizPro, LawPro, GymPro

### Overview

Remove ShopPro (workshop), EduPro (school), HirePro (hire), StayPro (guesthouse), and FleetPro (fleet) as standalone verticals. Their functionality becomes optional add-on modules available in BizPro's custom package builder.

**Existing users impact**: There are currently 3 workshop, 1 school, and 1 hire subscribers. Their `system_type` will be migrated to `business`, and their existing modules will continue to work since navigation is already module-gated.

---

### Changes

#### 1. Database Updates

- **Update `subscriptions_system_type_check` constraint** to only allow `business`, `legal`, `gym`
- **Migrate existing subscribers** on removed verticals (`workshop`, `school`, `hire`, `guesthouse`, `fleet`) to `system_type = 'business'`
- **Update `platform_modules`**: Change `system_type` for workshop/school/hire/guesthouse modules from their vertical-specific type to `shared` (so they appear as selectable modules under BizPro custom builder)
- **Deactivate `package_tiers`** for removed verticals (workshop, school, hire, guesthouse, fleet)

#### 2. Signup Flow (SystemSelector)

Remove the 5 cards for ShopPro, EduPro, HirePro, StayPro, FleetPro. Keep only BizPro, LawPro, GymPro.

#### 3. Landing Page Pricing (PricingTable)

Remove the 5 tabs for removed verticals. Keep only BizPro, LawPro, GymPro tabs.

#### 4. Auth Flow (Auth.tsx)

- Update valid system types list to `['business', 'legal', 'gym']`
- Remove SYSTEM_META entries for removed verticals (keep them only as fallbacks for legacy users)
- Update `ModuleSelector` allowed keys: BizPro's `SYSTEM_ALLOWED_SHARED_KEYS` will now include workshop, hire, school, guesthouse, and fleet module keys

#### 5. Navigation (Sidebar + BottomNav)

Update `systemTypes` for removed vertical nav items to include `'business'`. For example:
- Workshop nav: `systemTypes: ['business']` (was `['workshop']`)
- Hire nav items: `systemTypes: ['business']` (was `['hire']`)
- School nav items: `systemTypes: ['business']` (was `['school']`)
- Guesthouse nav items: `systemTypes: ['business']` (was `['guesthouse']`)
- Fleet nav: already shows for `['fleet']`, change to `['business']`

These items will only appear when the user has the corresponding module active (the `moduleKey` gating already handles this).

#### 6. Dashboard Routing

Update `Dashboard.tsx` so that BizPro users get the BusinessDashboard regardless. Remove the `case 'workshop'`, `case 'school'`, `case 'hire'`, `case 'guesthouse'`, `case 'fleet'` cases. All migrated users will see the BusinessDashboard.

#### 7. Module Selector (Custom Builder)

Update `SYSTEM_ALLOWED_SHARED_KEYS` for `business` to include all module keys from the removed verticals:
- `workshop`, `hire_equipment`, `hire_orders`, `hire_calendar`, `hire_returns`, `school_admin`, `students`, `school_fees`, `gh_rooms`, `gh_bookings`, `gh_housekeeping`, `gh_reviews`, `fleet`

---

### Files to Modify

| File | Change |
|------|--------|
| **Database migration** | Update constraint, migrate subscribers, update module system_types, deactivate tiers |
| `src/components/auth/SystemSelector.tsx` | Remove 5 vertical cards |
| `src/components/landing/PricingTable.tsx` | Remove 5 tabs |
| `src/pages/Auth.tsx` | Update valid system types, clean up SYSTEM_META |
| `src/components/auth/ModuleSelector.tsx` | Expand BizPro allowed module keys |
| `src/components/layout/Sidebar.tsx` | Change removed vertical nav `systemTypes` to `['business']` |
| `src/components/layout/BottomNav.tsx` | Same navigation changes |
| `src/pages/Dashboard.tsx` | Remove removed vertical dashboard cases |
| `src/hooks/useSubscription.tsx` | Update `SystemType` to 3 values |

### Risk Mitigation

- All routes (e.g., `/workshop`, `/equipment`, `/students`) remain functional -- they're just accessible under BizPro now
- Module gating in navigation means users only see features they've subscribed to
- Existing users keep their modules; only their `system_type` label changes to `business`
- The individual dashboard pages (WorkshopDashboard, SchoolDashboard, etc.) are kept in the codebase but won't be the default landing -- users will get BusinessDashboard

