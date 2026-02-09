

# Fix WhatsApp Opening With Wrong Phone Number

## The Problem
The WhatsApp button fetches the client's phone number using `jobCard.clientId`, but the query might be unreliable. Two potential issues:

1. **Null clientId**: Older job cards created before the client selector was added have no `client_id`. The Supabase query `.eq('id', null)` could behave unexpectedly.
2. **Stale state**: The `clientPhone` state from a previous job card might persist when opening a different one, causing a mismatch.

## The Fix

### File: `src/components/workshop/JobCardDetailDialog.tsx`

**1. Add a null guard** so the query only runs when `clientId` is a real UUID:

```ts
useEffect(() => {
  if (!jobCard?.clientId) { setClientPhone(null); return; }
  supabase.from('clients').select('phone').eq('id', jobCard.clientId).single()
    .then(({ data }) => setClientPhone(data?.phone ?? null));
}, [jobCard?.clientId]);
```

This already looks correct in the current code. The real fix is:

**2. Add a debug log temporarily and verify data** -- but more importantly, add the client's phone number as visible text in the dialog so the user can confirm which number will be used before clicking:

- Show the client phone number next to the WhatsApp button tooltip (e.g., "Send WhatsApp to +266 58335233")
- This helps the user verify the correct number is being used

**3. Reset clientPhone when dialog closes or job card changes** to prevent stale state:

```ts
useEffect(() => {
  setClientPhone(null); // reset first
  if (!jobCard?.clientId) return;
  supabase.from('clients').select('phone').eq('id', jobCard.clientId).single()
    .then(({ data }) => setClientPhone(data?.phone ?? null));
}, [jobCard?.id]); // key on job card id, not just clientId
```

Changing the dependency to `jobCard?.id` ensures the phone is re-fetched whenever a different job card is opened, and resets to null first to prevent stale data.

**4. Show the phone number in the tooltip** so users can verify:

Update the tooltip from `"Send WhatsApp update"` to `"WhatsApp: {clientPhone}"` so the user sees which number will be messaged.

### Summary of changes
- **One file**: `src/components/workshop/JobCardDetailDialog.tsx`
- Reset `clientPhone` to null at the start of the useEffect
- Change dependency from `jobCard?.clientId` to `jobCard?.id`
- Show the actual phone number in the tooltip for transparency
