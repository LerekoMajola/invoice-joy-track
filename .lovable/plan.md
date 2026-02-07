

# Fix: System-Specific Dashboard and Signup Confirmation

## What's Wrong

Three bugs are causing every user to see the full Business dashboard regardless of what they selected during signup:

### 1. Module key mismatch (the main bug)
The signup package tiers use module keys `crm` and `clients`, but the actual database keys are `core_crm`. There is no `clients` key in platform_modules at all. When the ProtectedRoute tries to match these keys against the database, nothing matches, so it falls through to the legacy path and assigns ALL 14 modules to every user.

Database keys: `core_crm, quotes, invoices, delivery_notes, profitability, tasks, tenders, accounting, staff, fleet, workshop, school_admin, students, school_fees`

Tier configs currently use: `crm, clients, workshop, quotes...` -- `crm` and `clients` do not exist.

### 2. User metadata was never saved
All 5 users in the database have empty metadata (no `system_type`, no `selected_module_keys`). The users were created before the metadata-saving code was added or with auto-confirm on. The ProtectedRoute then defaults to `system_type: 'business'` and assigns all modules.

### 3. No confirmation step
Users go straight from package selection to credentials. There is no review screen showing "You selected Workshop / Starter -- here are your modules."

---

## What Gets Fixed

### Fix 1: Correct module keys in PackageTierSelector
Replace `crm` and `clients` with `core_crm` in every tier configuration. This ensures that when the signup saves `selected_module_keys` to user metadata, the keys actually exist in the `platform_modules` table and can be matched during module assignment.

### Fix 2: Add a confirmation/review step to signup
Insert a new step between package selection and credentials entry. This step shows:
- The system type they selected (Business/Workshop/School) with its icon
- The package tier name and price
- A checklist of all included modules
- An "Edit" button to go back and change
- A "Continue to create account" button to proceed

The signup flow becomes: System Selection -> Package Tier -> **Review Selection** -> Account Credentials

### Fix 3: Clean up existing user data
Since the current users have wrong data (all modules assigned, all system_type = business), the existing `sales@orionlabslesotho.com` user that signed up for Workshop needs to be fixed. This will be done by updating the subscription's `system_type` to match what was actually selected and removing incorrect module assignments.

---

## Files to Modify

| File | Change |
|------|---------|
| `src/components/auth/PackageTierSelector.tsx` | Replace `crm` and `clients` with `core_crm` in all tier moduleKeys arrays |
| `src/pages/Auth.tsx` | Add new `review` step between package and credentials; show summary of selections |
| `src/components/layout/Sidebar.tsx` | Change fallback behavior: when user has no modules, show nothing (not everything) |
| `src/components/layout/BottomNav.tsx` | Same fallback fix as Sidebar |

## Database Fix (one-time cleanup)

Update the `sales@orionlabslesotho.com` subscription to `system_type = 'workshop'` and reassign only the workshop-relevant modules.

---

## Technical Details

### PackageTierSelector Key Fix

Every occurrence of `'crm'` and `'clients'` in moduleKeys arrays gets replaced with `'core_crm'`. Example for Workshop Starter:

Before: `['crm', 'clients', 'workshop', 'quotes', 'invoices', 'tasks', 'delivery_notes']`
After: `['core_crm', 'workshop', 'quotes', 'invoices', 'tasks', 'delivery_notes']`

This applies to all 9 tier definitions (3 systems x 3 tiers each).

### Review Step (Auth.tsx)

Add a new `SignupStep` value: `'review'`. After the user selects a package tier, instead of going to `'credentials'`, go to `'review'` first. The review screen renders:

- System icon and label (e.g., Wrench icon + "Workshop Management")
- Tier badge (e.g., "Starter -- M450/mo")
- A list of included modules with checkmarks
- Two buttons: "Change Package" (goes back to package step) and "Continue" (goes to credentials step)

This gives the user a clear confirmation of exactly what they are signing up for.

### Sidebar and BottomNav Fallback Fix

Currently both components show ALL navigation items when `userModules.length === 0`. This was meant as a legacy fallback, but it means any user without properly assigned modules sees everything.

Change: When `userModules.length === 0`, only show items with `moduleKey: null` (Dashboard, Settings, Billing). This ensures that if module assignment fails for any reason, users see only the base navigation -- not the entire platform.

### Data Cleanup

Run a migration to fix the existing workshop user:
1. Update their subscription `system_type` from `'business'` to `'workshop'`
2. Delete their current `user_modules` rows
3. Re-insert only the correct workshop modules (`core_crm, workshop, quotes, invoices, tasks, delivery_notes`)

This is a one-time fix for users created before the bug was fixed.
