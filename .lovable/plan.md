

# Implement Real Email Authentication with Password Reset

## Current State Analysis

Based on my exploration, here's the current setup:
- **Email confirmation is auto-enabled** - users are immediately confirmed without verifying their email
- **No password reset flow** - the "Forgot password" link doesn't exist
- **One subscription per user** - there's already a unique constraint on `subscriptions.user_id`, so one email = one subscription (properly enforced)
- **No email service configured** - RESEND_API_KEY is not in your secrets

## What You Need

### 1. Email Service Provider (Resend)
To send real emails (verification, password reset), you need an email service. I recommend **Resend** as it integrates well with the backend:

**Setup steps:**
1. Go to [resend.com](https://resend.com) and create an account
2. Verify your email domain at [resend.com/domains](https://resend.com/domains) - this is required to send emails from your domain (e.g., `noreply@yourdomain.com`)
3. Create an API key at [resend.com/api-keys](https://resend.com/api-keys)

### 2. Configure Authentication Settings
Disable auto-confirm so users must verify their email before accessing the app.

### 3. Implementation Components

| Component | Purpose |
|-----------|---------|
| Password Reset Edge Function | Sends reset emails using Resend |
| Reset Password Page | New route `/reset-password` for entering new password |
| Auth Page Updates | Add "Forgot password?" link |
| Email Verification Handling | Show appropriate messages for unverified users |

## Implementation Plan

### Phase 1: Configure Email Service
- Add `RESEND_API_KEY` secret to the project
- Configure Resend with your verified domain

### Phase 2: Create Password Reset Edge Function
**New file: `supabase/functions/send-password-reset/index.ts`**

This function will:
- Accept an email address
- Generate a password reset token using Supabase Auth
- Send a branded email via Resend with the reset link

### Phase 3: Create Reset Password Page
**New file: `src/pages/ResetPassword.tsx`**

A page where users:
- Request password reset (enter email)
- OR complete the reset (if they clicked the link in email)

### Phase 4: Update Auth Page
**Modify: `src/pages/Auth.tsx`**

- Add "Forgot password?" link below the password field
- Handle email verification messages gracefully
- Show "Check your email" message after signup instead of auto-redirecting

### Phase 5: Handle Unverified Users
**Modify: `src/pages/Auth.tsx`**

When a user signs up:
- Show "Please check your email to verify your account"
- Don't auto-redirect until email is verified

When a user tries to log in with unverified email:
- Show helpful error message with option to resend verification

### Phase 6: Update App Routes
**Modify: `src/App.tsx`**

- Add route for `/reset-password`

## User Flows

### Password Reset Flow
```text
User clicks "Forgot password?"
         |
         v
Enter email address
         |
         v
Edge function generates reset link
         |
         v
Email sent via Resend
         |
         v
User clicks link in email
         |
         v
Redirect to /reset-password?token=xxx
         |
         v
User enters new password
         |
         v
Password updated, redirect to login
```

### Signup Flow (with email verification)
```text
User signs up
         |
         v
Show "Check your email to verify"
         |
         v
User clicks verification link
         |
         v
Email confirmed
         |
         v
User can now log in
```

## Before We Start

I need you to:
1. **Create a Resend account** at [resend.com](https://resend.com)
2. **Verify your email domain** at [resend.com/domains](https://resend.com/domains)
3. **Get your API key** from [resend.com/api-keys](https://resend.com/api-keys)

Once you have the Resend API key ready, I'll prompt you to enter it securely and then implement the full password reset and email verification system.

Would you like to proceed with getting the Resend account set up?

