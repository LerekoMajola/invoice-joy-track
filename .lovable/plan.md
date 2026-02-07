

# Fix: Email Confirmation, Signup Emails, and Admin Dashboard

## Three Issues Found

### Issue 1: Users log in without email confirmation
The authentication system has **auto-confirm enabled**, which means any email address is instantly verified. Every user in the database was confirmed within milliseconds of signing up -- no email verification ever happened.

**Fix:** Disable auto-confirm so users must click a verification link in their email before they can sign in. The signup flow will show a "Check your email" message instead of logging them straight in.

### Issue 2: No signup/confirmation email sent
Because auto-confirm is on, the system never attempts to send a verification email. Once auto-confirm is disabled, the built-in email service will automatically send confirmation emails to new signups.

**Fix:** This is resolved by disabling auto-confirm (Issue 1). Additionally, the signup code currently calls `saveSignupData(data.user.id)` immediately after `signUp()` returns a user -- but with email verification required, the user object still comes back (unverified). The code needs to handle this properly: show a "check your email" message and NOT try to save modules/subscription until the user actually confirms. The `ProtectedRoute` already handles creating a subscription on first authenticated visit, so module assignment can be deferred there too.

### Issue 3: Admin dashboard sidebar shows all modules
When you (the admin) look at the app via "Go to App" button, the sidebar shows every module (Workshop, School, Students, etc.) because the admin user has no `user_modules` rows. The sidebar code defaults to showing everything when no modules are found (line 61 of Sidebar.tsx: `if (userModules.length === 0) return true`).

For the admin specifically, this might be intentional (so you can see everything). But if you want the admin dashboard's **Tenants tab** to show which system each tenant is on, that is currently missing from the table.

**Fix (Tenants tab):** Add a "System" column to the Tenants table that shows Business/Workshop/School with an icon badge. Pull `system_type` from the subscription data and display it. Also add a system type filter dropdown.

---

## Files to Modify

| File | Change |
|------|--------|
| Auth configuration | Disable email auto-confirm |
| `src/pages/Auth.tsx` | Handle unverified signup: show "Check your email" message instead of saving data and redirecting. Defer module assignment. |
| `src/hooks/useAdminTenants.tsx` | Include `system_type` in the Tenant interface and data mapping |
| `src/components/admin/TenantsTab.tsx` | Add "System" column with icon badges and a system type filter |
| `src/components/admin/TenantDetailDialog.tsx` | Show system type in tenant details |

## No Changes Needed

- ProtectedRoute (already handles subscription creation on first visit)
- AuthContext (already handles session state correctly)
- AdminOverviewTab (already shows system breakdown cards)
- Dashboard routing (already routes based on system_type)

---

## Technical Details

### Disabling Auto-Confirm
Use the auth configuration tool to set `enable_signup = true` with `double_confirm_changes = true` and `enable_confirmations = true` (disable auto-confirm). This means:
- New signups get a confirmation email
- Users cannot sign in until they click the link
- The `email_confirmed_at` field stays null until they verify

### Signup Flow Changes (Auth.tsx)

After `supabase.auth.signUp()` returns, check if the user's `email_confirmed_at` is null (or if `data.session` is null -- Supabase returns no session when email confirmation is required). If so:
- Show a success message: "Check your email to verify your account"
- Do NOT call `saveSignupData()` -- the user hasn't verified yet
- Switch back to the login form

Module and subscription assignment will happen automatically when the user first logs in, handled by the existing `ProtectedRoute` logic (which already creates subscriptions and assigns modules for users who don't have them).

The `saveSignupData` function currently saves `system_type` to the subscription. Since the subscription doesn't exist yet at signup time (it gets created by ProtectedRoute on first login), we need to store the selected `system_type` temporarily. Options:
- Store it in `user_metadata` during signup (passed via `signUp` options)
- Then read it from `user_metadata` in ProtectedRoute when creating the subscription

This ensures the system type selection survives the email verification step.

### Tenants Tab Enhancement

Add a "System" column between "Company" and "Email" that displays:
- A colored badge with an icon: Briefcase for Business, Wrench for Workshop, GraduationCap for School
- Add a system type filter dropdown alongside the existing status and plan filters
- Pull `system_type` from `subscription.system_type` (already available in the subscriptions query)

### Tenant Detail Dialog

Add a "System Type" row in the subscription section showing Business/Workshop/School with the matching icon.

