

## Add Contact Person to Company Profile

### What changes

Add a "Contact Person" field to the Company Profile form so businesses can specify who should be contacted on their behalf.

### Database Change

Add a new column `contact_person` to the `company_profiles` table:

```sql
ALTER TABLE public.company_profiles
ADD COLUMN contact_person text;
```

### Code Changes

**1. `src/hooks/useCompanyProfile.tsx`**
- Add `contact_person: string | null` to the `CompanyProfile` interface

**2. `src/pages/Settings.tsx`** (Profile tab)
- Add `contact_person` to `formData` initial state and the `useEffect` that loads profile data
- Add a "Contact Person" input field in the profile form grid, placed alongside the company name field

**3. `src/components/onboarding/CompanyOnboardingDialog.tsx`**
- Add an optional "Contact Person" field to the onboarding form so new users can enter it during setup

### Form Layout

The Profile tab will show the contact person next to the company name:

| Company Name * | Contact Person |
| Email          | Phone          |
| Website        | (existing)     |

This keeps the most important identity fields grouped together at the top.

### Technical Details

- The column is nullable with no default, so existing profiles are unaffected
- No RLS changes needed -- existing policies already cover the `company_profiles` table
- The `CompanyProfileInput` type auto-derives from `CompanyProfile` via `Omit`, so adding to the interface is sufficient

