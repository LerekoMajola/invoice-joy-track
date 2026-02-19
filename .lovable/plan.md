
## The Problem: "Already Registered" Error When Creating Portal Access

### What Is Happening

When the gym owner clicks "Create Portal Access" for a member, the backend function tries to create a brand-new login account using the member's email. But if that email address already exists anywhere in the system (e.g., the member is also a business owner, or a previous invite attempt partially succeeded), the auth system rejects it with "A user with this email address has already been registered".

The function currently returns this as an error to the UI, which is wrong behavior. The correct behavior is to **handle this gracefully**: look up the existing user, reset their password to a new temporary one, link them to the member record, and re-send the credentials email.

### The Fix: One File Change (Edge Function)

The fix is entirely inside `supabase/functions/create-portal-account/index.ts`. No database changes are needed — the schema and RLS policies from the previous work are all correct.

**New logic when "already registered" error occurs:**

```
1. Catch the "already registered" error from createUser()
2. Use adminClient.auth.admin.listUsers() to find the existing user by email
3. Generate a new temp password
4. Call adminClient.auth.admin.updateUserById(existingUserId, { password: newTempPassword })
5. Link portal_user_id = existingUserId on the gym_members / students record
6. Send the credentials email with the new password
7. Return success
```

This means:
- First time: creates a fresh account and emails credentials
- Subsequent times (email already exists): resets password and re-emails credentials — which also acts as a "Resend Credentials" feature

### Edge Cases Handled

| Situation | Result |
|---|---|
| Email never existed | Creates new account, links it, emails credentials |
| Email already in auth (any reason) | Resets password, links the existing user, emails new credentials |
| Member already has a `portal_user_id` set (linked account exists) | Returns 409 "Portal account already exists" — caught before reaching auth at all |

The third case (portal_user_id already set) is caught early at lines 179-184 in the current function, before any auth calls are made. That check stays in place.

### Also: Fix the Ownership Validation

Looking at the live database response, `gym_members.user_id` is still the gym owner's auth ID (the backfill correctly copied it to `owner_user_id` as well). So the current ownership check `record.user_id !== caller.id` works now. However, to be future-proof and correct, the check should use `owner_user_id` instead of `user_id`, since `user_id` could theoretically be changed. This is a one-line improvement.

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/create-portal-account/index.ts` | Handle "already registered" by finding existing user, resetting password, linking, and emailing — instead of returning an error |

No database migrations, no UI component changes, no new files needed.
