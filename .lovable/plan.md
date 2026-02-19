
## Two Issues, One Fix Each

### Issue 1: Build Warning (Dynamic Import)
In `src/pages/Portal.tsx` line 108, the sign-out button uses a **dynamic import** (`await import('@/integrations/supabase/client')`). The same file is already statically imported everywhere else, which causes Vite to emit a bundle warning. This is a one-line fix — replace the dynamic import with the static `supabase` import that is already used at the top of the file via `usePortalSession`.

**Fix:** Change the `onClick` handler to just call `supabase.auth.signOut()` directly (the `supabase` client is already accessible in scope via the `usePortalSession` hook's return, or we simply add a static import).

---

### Issue 2: Data Does Not Update Without a Page Reload (Platform-Wide)

**Root Cause:** Every single data hook in the platform (e.g., `useGymMembers`, `useStudents`, `useInvoices`, `useQuotes`, `useLeads`, `useClients`, `useStaff`, and dozens more) follows the same pattern:

```
useEffect(() => { fetchXxx(); }, [user, activeCompanyId]);
```

They fetch data **once on mount** and then only re-fetch when `user` or `activeCompanyId` changes. There is **no real-time subscription** and **no polling**. So when you add a record, the mutation runs `fetchMembers()` / `fetchStudents()` etc. on the same hook instance — but the issue arises when:

1. The dialog/form component is unmounted after saving (closing the dialog re-mounts nothing that triggers a re-fetch).
2. Multiple hook instances exist (as happened with the Admin CRM).
3. The mutation in some hooks uses optimistic local state (`setStudents(prev => [...prev, newStudent])`) which works for `createStudent`, but `updateStudent` calls `fetchStudents()` which is an async network round-trip that can silently fail if the component unmounts mid-flight.

**The Fix:** Add a **Supabase Realtime channel subscription** to every affected hook. When the database table changes (INSERT, UPDATE, DELETE), the hook automatically calls its own `fetchXxx()` to refresh. This is the canonical Supabase pattern and makes the app truly live without any architectural restructuring.

**Pattern to add to every hook (example for `useGymMembers`):**
```typescript
useEffect(() => {
  fetchMembers();

  const channel = supabase
    .channel('gym-members-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'gym_members',
    }, () => {
      fetchMembers();
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [user, activeCompanyId]);
```

---

### Hooks to Update (All Core Business Hooks)

| Hook File | Table | Channel Name |
|---|---|---|
| `useGymMembers.tsx` | `gym_members` | `gym-members-rt` |
| `useStudents.tsx` | `students` | `students-rt` |
| `useInvoices.tsx` | `invoices` | `invoices-rt` |
| `useQuotes.tsx` | `quotes` | `quotes-rt` |
| `useLeads.tsx` | `leads` | `leads-rt` |
| `useClients.tsx` | `clients` | `clients-rt` |
| `useStaff.tsx` | `staff_members` | `staff-rt` |
| `useDeals.tsx` | `deals` | `deals-rt` |
| `useTasks.tsx` | `tasks` | `tasks-rt` |
| `useExpenses.tsx` | `expenses` | `expenses-rt` |
| `useBankAccounts.tsx` | `bank_accounts` | `bank-accounts-rt` |
| `useFleetVehicles.tsx` | `fleet_vehicles` | `fleet-vehicles-rt` |
| `useFleetDrivers.tsx` | `fleet_drivers` | `fleet-drivers-rt` |
| `useFleetFuelLogs.tsx` | `fleet_fuel_logs` | `fleet-fuel-rt` |
| `useFleetServiceLogs.tsx` | `fleet_service_logs` | `fleet-service-rt` |
| `useEquipment.tsx` | `equipment` | `equipment-rt` |
| `useHireOrders.tsx` | `hire_orders` | `hire-orders-rt` |
| `useBookings.tsx` | `bookings` | `bookings-rt` |
| `useRooms.tsx` | `rooms` | `rooms-rt` |
| `useGymClasses.tsx` | `gym_classes` | `gym-classes-rt` |
| `useGymMembershipPlans.tsx` | `gym_membership_plans` | `gym-plans-rt` |
| `useGymMemberSubscriptions.tsx` | `gym_member_subscriptions` | `gym-subs-rt` |
| `useSchoolFees.tsx` | `school_fees` | `school-fees-rt` |
| `useLegalCases.tsx` | `legal_cases` | `legal-cases-rt` |
| `useJobCards.tsx` | `job_cards` | `job-cards-rt` |
| `usePayslips.tsx` | `payslips` | `payslips-rt` |
| `useDeliveryNotes.tsx` | `delivery_notes` | `delivery-notes-rt` |
| `useAdminProspects.tsx` | `admin_prospects` | `admin-prospects-rt` |

---

### Files Changed

- **`src/pages/Portal.tsx`** — fix dynamic import (1-line fix)
- All ~28 hook files above — add realtime channel subscription inside the main `useEffect`

No database migrations needed. No new components. The realtime tables are already accessible via existing RLS policies since the subscriptions fire as the logged-in user who already has SELECT permission on their own data.
