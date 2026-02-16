
# Add Missing System Types to Admin Dashboard

## Problem
The admin dashboard components were only configured with the original system types (business, workshop, school, legal, and partially hire/guesthouse). The newer verticals -- **GymPro**, **FleetPro**, **StayPro (Guesthouse)**, and **HirePro** -- are missing from filter dropdowns, icon maps, color maps, and breakdown cards across the admin interface. This means you can't see or manage subscribers using those systems properly.

## Files to Update

### 1. AdminOverviewTab.tsx
- Add `Hotel`, `Car`, `Dumbbell`, `Hammer` icons to imports
- Add `guesthouse`, `fleet`, `gym` entries to `SYSTEM_CONFIG` (labels: StayPro, FleetPro, GymPro)
- Update the empty-state list from `['business', 'workshop', 'school', 'legal', 'hire']` to include `guesthouse`, `fleet`, `gym`

### 2. CustomersTab.tsx
- Add `Hotel`, `Car`, `Dumbbell`, `Hammer` icons to imports
- Add `hire`, `guesthouse`, `fleet`, `gym` to `systemIcons`, `systemLabels`, `systemColors`
- Add corresponding `SelectItem` entries in the system filter dropdown

### 3. SignupsTab.tsx
- Add `hire`, `guesthouse`, `fleet`, `gym` to `systemColors`
- Add corresponding `SelectItem` entries in the system filter dropdown

### 4. TenantDetailDialog.tsx
- Expand the inline system icon/label logic to handle all 8 system types instead of just business/workshop/school

### 5. ModuleManagement.tsx
- Add `gym` entry to `systemGroups` array with Dumbbell icon and lime gradient
- Also add `fleet` entry if missing (Car icon, slate gradient)

### 6. EditSubscriptionDialog.tsx (optional)
- No system type selector needed here (it edits plan/status only), so no changes required

## Technical Details

Each file has hardcoded lookup maps (`Record<string, ...>`) that need the new keys added. The pattern is consistent: add the key, label, icon, and color for each missing system type. Filter dropdowns need matching `SelectItem` entries.

No database changes needed -- the constraint already includes `gym` from the previous migration.
