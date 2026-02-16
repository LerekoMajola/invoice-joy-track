
# Isolate All Data Per Active Company

## Problem
When switching between companies (e.g., Leekay vs Optimum Resources), most data hooks still show data from ALL companies instead of only the active one. Only 6 out of ~25+ hooks currently filter by `activeCompanyId`.

## What Will Change

### 1. Fix `useCompanyProfile` to return the active company's profile
Currently it fetches with `.maybeSingle()` which returns the first profile. It needs to use the `activeCompanyId` from `ActiveCompanyContext` to return the correct company profile when viewing settings, invoice previews, quote previews, etc.

### 2. Add `activeCompanyId` filtering to ALL remaining data hooks
Each of these hooks will be updated to:
- Import `useActiveCompany` from the context
- Add `activeCompanyId` to the query key (for react-query hooks) or dependency array
- Filter SELECT queries with `.eq('company_profile_id', activeCompanyId)` when `activeCompanyId` is set
- Include `company_profile_id: activeCompanyId` in INSERT operations

**Hooks that need updating:**

| Hook | Table(s) |
|------|----------|
| `useDeliveryNotes` | delivery_notes, delivery_note_items |
| `useTenderSourceLinks` | tender_source_links |
| `useAccountingTransactions` | accounting_transactions |
| `useBankAccounts` | bank_accounts |
| `useExpenses` | expenses |
| `useExpenseCategories` | expense_categories |
| `useAccountingStats` | invoices, payslips (via sub-queries) |
| `useStaff` | staff_members |
| `useJobCards` | job_cards |
| `useBookings` | bookings |
| `useRooms` | rooms |
| `useFleetVehicles` | fleet_vehicles |
| `useFleetDrivers` | fleet_drivers |
| `useHireOrders` | hire_orders |
| `useEquipment` | equipment_items |
| `useNotifications` | notifications |
| `useContacts` | contacts |
| `useStudents` | students |
| `useSchoolClasses` | school_classes |
| `useRecurringDocuments` | recurring_documents |
| `usePayslips` | payslips (if company-scoped) |
| `useCRMClients` | (if separate from useClients) |

### 3. Fix `useCompanyProfile` specifically
Replace the current `.maybeSingle()` approach with a lookup by `activeCompanyId`:
- When `activeCompanyId` is available, fetch that specific profile by ID
- This ensures Settings, invoice previews, and all other profile-dependent components show the correct company's branding, logo, and details

## Technical Details

**Pattern for each hook update (react-query style):**
```typescript
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';

// Add to hook:
const { activeCompanyId } = useActiveCompany();

// Query key includes activeCompanyId:
queryKey: ['table-name', user?.id, activeCompanyId],

// SELECT filter:
let query = supabase.from('table').select('*');
if (activeCompanyId) {
  query = query.eq('company_profile_id', activeCompanyId);
}

// INSERT includes:
company_profile_id: activeCompanyId || null,
```

**Pattern for useState-based hooks (e.g., useDeliveryNotes):**
```typescript
// Add activeCompanyId to useEffect dependency
useEffect(() => { fetchData(); }, [user, activeCompanyId]);

// Filter in fetch
if (activeCompanyId) {
  query = query.eq('company_profile_id', activeCompanyId);
}
```

**useCompanyProfile fix:**
```typescript
const { activeCompanyId } = useActiveCompany();

const { data: profile } = useQuery({
  queryKey: ['company-profile', activeCompanyId],
  queryFn: async () => {
    if (!activeCompanyId) return null;
    const { data } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', activeCompanyId)
      .single();
    return data;
  },
  enabled: !!activeCompanyId,
});
```

## Outcome
After this change, switching companies in the header will immediately show only that company's data across every module -- accounting, delivery notes, tenders, fleet, staff, workshop, and all others will be fully isolated.
