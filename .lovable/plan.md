
## Fix: "Send Portal Access" — Always Works (Create or Resend)

### Root Cause

The `create-portal-account` edge function blocks re-invitations with a **409 Conflict** error when `portal_user_id` is already set on the member/student record (lines 180–185 and 207–212). This means:

- First time: works fine.
- After first invite: button appears but clicking it fails with "Portal account already exists."
- On the published version, where real members have already been provisioned, the button never works again.

### Solution

Two changes:

**1. Edge Function (`create-portal-account/index.ts`)**

Remove the 409 early-return block. Instead, if `portal_user_id` is already set, treat the request as a **"Resend"** — reset the password and re-send the email (the existing "already registered" path already handles this correctly). So the fix is simply to remove those early-exit blocks:

```ts
// REMOVE this block for gym:
if (record.portal_user_id) {
  return new Response(JSON.stringify({ error: 'Portal account already exists for this member' }), {
    status: 409, ...
  })
}

// REMOVE this block for school:
if (record.portal_user_id) {
  return new Response(JSON.stringify({ error: 'Portal account already exists for this student' }), {
    status: 409, ...
  })
}
```

When `portal_user_id` is already set, the function continues to `createUser`, gets an "already registered" error, then correctly falls into the existing `isAlreadyRegistered` branch — which resets the password and re-links the user. The email is then re-sent with new credentials.

**2. UI Labels — Gym (`MemberDetailDialog.tsx`) and School (`StudentDetailDialog.tsx`)**

Update the button label to reflect the state dynamically:
- If `member.portalUserId` is set → show **"Resend Portal Access"**
- If not → show **"Create Portal Access"**

This gives the business owner clear feedback and makes the button useful on an ongoing basis.

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/create-portal-account/index.ts` | Remove the two 409 early-exit blocks for existing `portal_user_id` |
| `src/components/gym/MemberDetailDialog.tsx` | Update button label: "Create" vs "Resend" based on `member.portalUserId` |
| `src/components/school/StudentDetailDialog.tsx` | Update button label: "Create" vs "Resend" based on `student.portalUserId` |

### No database changes needed.

The flow after the fix:

```text
Click "Create/Resend Portal Access"
  │
  ├─ portal_user_id not set → Create new auth user → Link ID → Send email ✓
  │
  └─ portal_user_id already set → createUser gets "already registered" error
       → Find existing user → Reset password → Re-link → Re-send email ✓
```

Both paths end with the member receiving fresh credentials in their inbox.
