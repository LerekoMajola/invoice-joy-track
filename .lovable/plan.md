

## Add Platform-Wide Lead Stats to Admin CRM Tab

### What's changing
Add a row of gradient-styled stats cards at the top of the Admin CRM tab showing aggregate lead data across all tenants in the system. These sit above the existing prospect stats and use the platform's standard indigo-to-purple gradient design.

### Stats to display
1. **Total Leads** -- count of all leads in the system (Users icon)
2. **Won Deals** -- leads with status "won" (TrendingUp icon)
3. **Lost Deals** -- leads with status "lost" (TrendingDown icon)
4. **Active Pipeline** -- leads not won/lost (DollarSign icon), showing total estimated value
5. **Conversion Rate** -- won / (won + lost) as a percentage (Target icon)

### Changes

#### 1. `src/hooks/useAdminLeadStats.tsx` (new file)
- Create a new hook that queries the `leads` table to compute platform-wide stats
- Uses `useQuery` from TanStack for caching and loading states
- Only enabled when user has admin role (via `useAdminRole`)
- Computes: totalLeads, wonCount, lostCount, activeCount, totalPipelineValue, conversionRate

#### 2. `src/components/admin/crm/AdminCRMTab.tsx`
- Import the new `useAdminLeadStats` hook
- Add a section header "Platform Lead Stats" above the existing prospect cards
- Render 5 gradient cards (matching `PlatformStatsCards` / `StatCard` style):
  - `bg-gradient-to-br from-indigo-500 to-purple-600`
  - White text, icon in `bg-white/20` circle
  - `hover:scale-[1.02]` effect with shadow
- Keep the existing 4 prospect stat cards below, unchanged
- Replace the existing plain white prospect cards with the same gradient style for visual consistency

### Design
```text
+------------------+------------------+------------------+------------------+------------------+
| Total Leads      | Won Deals        | Lost Deals       | Active Pipeline  | Conversion Rate  |
| 142              | 38               | 21               | M 1,250,000      | 64.4%            |
| All tenant leads | Converted leads  | Lost leads       | Est. value       | Won / (Won+Lost) |
+------------------+------------------+------------------+------------------+------------------+

[Existing prospect stats cards - also upgraded to gradient style]
```

### Technical details
- The `leads` table is tenant-scoped via RLS, but admin users with `super_admin` role can read all rows (verified by existing RLS patterns)
- If RLS blocks admin access, the hook will return zeros gracefully
- Currency formatting uses `formatMaluti` from `@/lib/currency` for consistency
- The hook uses `useAdminRole` to gate the query, matching the pattern in `useAdminStats`

### Files
- `src/hooks/useAdminLeadStats.tsx` -- new hook for platform-wide lead statistics
- `src/components/admin/crm/AdminCRMTab.tsx` -- add gradient lead stats cards section

