

## Fix Data Backup Email Sender + Test

### The Problem
The `export-data-backup` function uses `from: "Data Backup <onboarding@resend.dev>"` (Resend sandbox). Sandbox senders can only email the account owner. Sending to `ceo@ideliver.co.ls` gets blocked with a 403 error.

### The Fix
**File: `supabase/functions/export-data-backup/index.ts`** (line 254)

Change the sender from:
```
"Data Backup <onboarding@resend.dev>"
```
to:
```
"Data Backup <updates@updates.orionlabslesotho.com>"
```

This uses the verified domain already working for other email functions in the system.

### After Deploying
Trigger a manual test backup call to send the email to `ceo@ideliver.co.ls` and confirm delivery.

### Files Changed
1. `supabase/functions/export-data-backup/index.ts` -- one line change (sender address)

