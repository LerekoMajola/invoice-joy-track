

## Editable Platform Banking Details

### Problem
Orion Labs banking information (bank name, account number, branch code, etc.) is hardcoded in 4 separate files. Any change requires code edits in multiple places.

### Solution
Add a "Platform Banking Details" card to the Admin Settings tab where you can edit banking info, and have it automatically reflect across all invoices, billing pages, and email templates.

### Where banking details are currently hardcoded
1. **Admin Invoice Preview** (`AdminInvoicePreview.tsx`) -- the PDF/print invoice for tenants
2. **Billing page** (`Billing.tsx`) -- payment instructions shown to tenants
3. **Payment Required page** (`PaymentRequired.tsx`) -- blocked-account payment screen
4. **Send Admin Invoice email** (`send-admin-invoice/index.ts`) -- email body with banking details

### Implementation

**1. Extend `usePlatformSettings` hook**

Add 6 new platform setting keys using the existing `platform_settings` table (no migration needed):
- `bank_name` (default: "First National Bank (FNB)")
- `bank_account_name` (default: "Orion Labs (Pty) Ltd")
- `bank_account_number` (default: "63027317585")
- `bank_branch_code` (default: "280061")
- `bank_branch_name` (default: "Pioneer Mall")
- `bank_pop_email` (default: "sales@orionlabslesotho.com")

Export a dedicated `usePlatformBanking()` hook that returns these values with their defaults.

**2. Add Banking Details card to Admin Settings**

Create a new `PlatformBankingSettings` component with an editable form containing fields for all 6 banking values. Add it to the `AdminSettingsTab` between the branding card and App Icon settings.

The form will:
- Show current values (or defaults if not yet saved)
- Have a "Save Banking Details" button
- Show success/error toast on save

**3. Update all 4 consumer files**

Replace hardcoded banking strings with values from `usePlatformBanking()`:

- **`AdminInvoicePreview.tsx`** -- pass banking data as props or use the hook directly
- **`Billing.tsx`** -- use hook to populate the `bankDetails` array
- **`PaymentRequired.tsx`** -- use hook to populate payment instructions
- **`send-admin-invoice/index.ts`** -- fetch banking details from `platform_settings` table at runtime before building the email HTML

### Files changed
| File | Change |
|------|--------|
| `src/hooks/usePlatformSettings.tsx` | Add `usePlatformBanking()` export |
| `src/components/admin/PlatformBankingSettings.tsx` | New -- banking details form card |
| `src/components/admin/AdminSettingsTab.tsx` | Add `PlatformBankingSettings` component |
| `src/components/admin/AdminInvoicePreview.tsx` | Replace hardcoded banking with hook/props |
| `src/pages/Billing.tsx` | Replace hardcoded `bankDetails` array |
| `src/pages/PaymentRequired.tsx` | Replace hardcoded banking values |
| `supabase/functions/send-admin-invoice/index.ts` | Fetch banking from `platform_settings` table |

### No database migration needed
The existing `platform_settings` key-value table already supports storing arbitrary settings. Banking details will be stored as individual key-value rows following the same pattern used for logo and favicon URLs.

