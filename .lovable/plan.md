
# Add Billing Note to Subscription — Record "Leselihub pays M450/month"

## What's needed

The `subscriptions` table has no notes field. We need a `billing_note` text column so admins can record custom billing context like "pays M450/month" against a tenant — visible in the tenant detail view and editable from the Edit Subscription sheet.

## Changes

### 1. Database — add `billing_note` column to `subscriptions`

```sql
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS billing_note text;
```

Nullable text, no default. No RLS changes needed (existing subscription RLS covers it).

### 2. `src/components/admin/EditSubscriptionDialog.tsx` — add Billing Note field

Add a textarea input for `billing_note` below the Status selector. On save, include the value in the `updateData` patch.

```tsx
// New state
const [billingNote, setBillingNote] = useState(tenant?.subscription?.billing_note || '');

// In the form JSX
<div className="space-y-2">
  <Label htmlFor="billing_note">Billing Note</Label>
  <Textarea
    id="billing_note"
    placeholder="e.g. Pays M450/month via EFT"
    value={billingNote}
    onChange={(e) => setBillingNote(e.target.value)}
    rows={3}
  />
</div>
```

And in `updateData`:
```tsx
billing_note: billingNote || null,
```

### 3. `src/components/admin/TenantDetailDialog.tsx` — display the note

Show `billing_note` in the Subscription info block if it exists:

```tsx
{tenant.subscription.billing_note && (
  <div className="mt-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
    <span className="font-medium">Note:</span> {tenant.subscription.billing_note}
  </div>
)}
```

### 4. `src/hooks/useAdminTenants.tsx` — include `billing_note` in the subscription select

Ensure the subscription query fetches the new field (it likely uses `select('*')` already, so this may be automatic — will verify).

## Files to edit

- Database migration (add column)
- `src/components/admin/EditSubscriptionDialog.tsx`
- `src/components/admin/TenantDetailDialog.tsx`
- `src/hooks/useAdminTenants.tsx` (verify `billing_note` is fetched)

After the change, open Leselihub's detail → Edit Subscription → type "Pays M450/month" in the Billing Note field and save.
