

# Simple Mobile Money Payment Flow

## The Approach

No Stripe, no external integrations. Just clear M-Pesa/bank transfer instructions and a paywall that blocks access when the trial expires. You manually activate subscriptions from your admin panel after confirming payment.

## What Gets Built

### 1. Paywall Page

A new `/payment-required` page that users see when their 7-day trial expires. It shows:

- "Your trial has ended" message
- Their selected package name and monthly price
- Clear M-Pesa payment instructions (paybill number, account reference)
- Bank transfer details as a fallback
- A "I've Made Payment" button that notifies you (the admin)
- A unique payment reference based on their user ID so you can match payments

### 2. Trial Enforcement

Update the `ProtectedRoute` to check if the trial has expired. If it has and the subscription is not `active`, redirect to the paywall page instead of letting them into the app.

### 3. Payment Notification to Admin

When a user clicks "I've Made Payment," a notification is inserted into the `notifications` table for the admin. This way you see it in your admin panel and can verify the payment, then flip the subscription to "active."

### 4. Updated Billing Page

Replace the vague "contact us" section with proper payment instructions:
- M-Pesa paybill number and how to pay
- Bank transfer details (bank name, account number, branch)
- The user's unique payment reference
- Current subscription status (trialing / active / expired)

---

## User Flow

```text
Trial expires (day 7)
    |
    v
User tries to access any page
    |
    v
ProtectedRoute detects expired trial
    |
    v
Redirect to /payment-required
    |
    +-- Shows M-Pesa instructions
    |   "Send M350 to Paybill 123456"
    |   "Account: REF-abc123"
    |
    +-- [I've Made Payment] button
    |       |
    |       v
    |   Notification sent to admin
    |   "User X says they've paid (REF-abc123)"
    |
    +-- Admin checks M-Pesa statement
    |       |
    |       v
    |   Admin opens admin panel > Edit Subscription > Set to "Active"
    |       |
    |       v
    |   User refreshes and gets full access
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/PaymentRequired.tsx` | Paywall page with M-Pesa instructions and "I've paid" button |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/layout/ProtectedRoute.tsx` | Add trial-expiry check; redirect to `/payment-required` when expired |
| `src/pages/Billing.tsx` | Replace "contact us" with proper M-Pesa and bank transfer instructions |
| `src/App.tsx` | Add `/payment-required` route |
| `src/hooks/useSubscription.tsx` | Add `needsPayment` helper that combines trial-expired + not-active checks |

## No Changes Needed

- No database migrations (existing `subscriptions` table has everything we need)
- No edge functions
- No external API keys or integrations
- Admin panel already supports editing subscription status

---

## Technical Details

### ProtectedRoute Update

The route guard will fetch the subscription and check:
- If `status === 'trialing'` AND `trial_ends_at < now()` AND `status !== 'active'` then redirect to `/payment-required`
- Active users pass through normally
- Users still in their trial pass through normally

### Payment Reference

Generated from the user's ID: `REF-{first 8 chars of user_id}`. This gives each user a unique reference to quote when paying via M-Pesa so you can match payments easily.

### "I've Made Payment" Button

Inserts a row into the existing `notifications` table targeting the admin user. The notification includes the user's company name, payment reference, and amount. You will see this notification in the admin panel.

### Billing Page Payment Section

Two clear sections:
1. **M-Pesa**: Step-by-step instructions -- dial `*111#`, select Pay Bill, enter number, enter reference, enter amount, confirm
2. **Bank Transfer**: Bank name, account number, branch code, and reference to include

You will need to provide your actual M-Pesa paybill number and bank details -- placeholder values will be used initially that you can update later in Settings.

