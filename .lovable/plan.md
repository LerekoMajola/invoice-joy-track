

## Fix: Company Logo Not Updating in Header "My Business" Tab

### Problem
When you upload a logo in Settings and save, the `CompanySwitcher` ("My Business" button in the header) still shows no logo. This happens because:

1. Settings saves `logo_url` to the `company_profiles` table via `useCompanyProfile`
2. The `CompanySwitcher` reads from `ActiveCompanyContext`, which fetches companies into local state on mount
3. There's no mechanism to refresh that local state when the profile is updated

### Fix

**`src/contexts/ActiveCompanyContext.tsx`** — Add a realtime subscription on the `company_profiles` table so when a profile is updated (including logo), the companies list automatically refreshes:

```typescript
// Add realtime listener for company_profiles changes
useEffect(() => {
  const channel = supabase
    .channel('company-profiles-switcher')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'company_profiles' }, () => {
      fetchCompanies();
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [fetchCompanies]);
```

This single addition ensures that any update to `company_profiles` (logo upload, name change, etc.) immediately reflects in the header's company switcher without a page reload.

### Files Changed
| File | Change |
|------|--------|
| `src/contexts/ActiveCompanyContext.tsx` | Add realtime subscription to auto-refresh on profile changes |

