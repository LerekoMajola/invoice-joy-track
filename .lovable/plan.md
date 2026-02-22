
## Add Real-Time Updates Across All Data Hooks

### Problem
27 data hooks lack real-time database subscriptions, meaning when you add, edit, or delete data in those areas, you may need to reload to see changes -- especially if working across tabs or if mutations don't optimistically update local state correctly.

### Hooks That Need Real-Time Subscriptions

Each hook below will get a `useEffect` block that subscribes to database changes and either calls `fetchData()` (for useState-based hooks) or `queryClient.invalidateQueries()` (for react-query-based hooks).

| # | Hook | Table(s) | Pattern |
|---|------|----------|---------|
| 1 | `useContacts` | `contacts` | fetchContacts |
| 2 | `useClientActivities` | `client_activities` | fetchActivities |
| 3 | `useClientDocuments` | `client_documents` | fetchDocuments |
| 4 | `useCRMClients` | `clients` | fetchClients |
| 5 | `useLeadActivities` | `lead_activities` | fetchActivities |
| 6 | `useDealTasks` | `deal_tasks` | fetchTasks |
| 7 | `useGuestReviews` | `guest_reviews` | invalidateQueries |
| 8 | `useHousekeeping` | `housekeeping_tasks` | invalidateQueries |
| 9 | `useFleetDocuments` | `fleet_documents` | fetchDocuments |
| 10 | `useFleetIncidents` | `fleet_incidents` | fetchIncidents |
| 11 | `useFleetMaintenanceSchedules` | `fleet_maintenance_schedules` | fetchSchedules |
| 12 | `useFleetTyres` | `fleet_tyres` | fetchTyres |
| 13 | `useFleetCostEntries` | `fleet_cost_entries` | fetchEntries |
| 14 | `useEquipmentIncidents` | `equipment_incidents` | invalidateQueries |
| 15 | `useEquipmentServices` | `equipment_service_logs` | invalidateQueries |
| 16 | `useLegalTimeEntries` | `legal_time_entries` | fetchEntries |
| 17 | `useLegalCaseExpenses` | `legal_case_expenses` | fetchExpenses |
| 18 | `useLegalCaseNotes` | `legal_case_notes` | fetchNotes |
| 19 | `useLegalCalendar` | `legal_calendar_events` | fetchEvents |
| 20 | `useGymAttendance` | `gym_attendance` | invalidateQueries |
| 21 | `useRecurringDocuments` | `recurring_documents` | fetchRecurringDocs |
| 22 | `useTaxClearances` | `tax_clearance_documents` | invalidateQueries |
| 23 | `useAccountingTransactions` | `accounting_transactions` | invalidateQueries |
| 24 | `useSchoolClasses` | `school_classes`, `academic_terms` | fetchAll |
| 25 | `useTenderSourceLinks` | `tender_source_links` | invalidateQueries |
| 26 | `useCompanyProfile` | `company_profiles` | invalidateQueries |
| 27 | `useModules` | `user_modules` | invalidateQueries |

### Technical Details

For each hook, the same pattern is added:

```text
useEffect(() => {
  const channel = supabase
    .channel('<table-name>-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: '<table_name>' }, () => {
      // Either fetchData() or queryClient.invalidateQueries(...)
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [dependencies]);
```

- Hooks using `useState` + manual fetch will call their fetch function on change
- Hooks using `useQuery` (react-query) will call `queryClient.invalidateQueries()` on change
- Channel names are unique per table to avoid conflicts
- Cleanup on unmount removes the channel subscription

### What This Means for You
After this change, every add/edit/delete action across ALL modules (CRM, Fleet, Legal, Gym, School, Equipment, Accounting, etc.) will instantly reflect in the UI without needing to reload the page.
