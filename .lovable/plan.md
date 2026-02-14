
# Integrate Africa's Talking SMS Notifications

## Overview
Add SMS notifications via Africa's Talking to the platform. Every in-app notification will also be sent as an SMS to users who have a phone number on file. Each tenant gets a monthly SMS credit allowance based on their subscription, with the option for admins to allocate extra credits.

## What Will Change

### 1. Store the API Key Securely
- Save the Africa's Talking API key as a backend secret (`AT_API_KEY`)
- Save the username as a secret (`AT_USERNAME` = "Lereko Majola")

### 2. New Database Table: `sms_credits`
Tracks SMS credit allocations and usage per tenant per month:
- `user_id` - the tenant
- `month` - e.g. "2026-02-01"
- `credits_allocated` - how many SMS the tenant can send this month
- `credits_used` - how many have been sent
- RLS policies so users see their own credits, admins can manage all

### 3. New Edge Function: `send-sms`
A backend function that:
- Accepts `user_id`, `phone`, `message` parameters
- Checks the user has remaining SMS credits for the current month
- Calls the Africa's Talking SMS API (`https://api.africastalking.com/version1/messaging`)
- Decrements the user's credits on success
- Logs the SMS in an `sms_log` table for audit

### 4. New Database Table: `sms_log`
Audit trail of all SMS sent:
- `user_id`, `phone_number`, `message`, `status`, `at_message_id`, `created_at`

### 5. Hook Into Existing Notification System
Modify the database triggers that create notifications (invoice status, quote status, lead status) and the edge functions (task reminders, payment reminders, tender link reminders) to also call `send-sms` when the user has a phone number and available credits.

The approach: Create a new database trigger on the `notifications` table (AFTER INSERT) that automatically calls the `send-sms` edge function. This way every notification -- regardless of source -- gets an SMS copy without modifying each individual trigger.

### 6. Admin SMS Credit Management
Add a section in the Admin dashboard (Tenants tab) where you can:
- See each tenant's SMS usage for the current month
- Allocate/adjust monthly credits per tenant
- View SMS sending history

### 7. Billing Page SMS Section
Add a small card on the tenant's Billing page showing:
- SMS credits remaining this month
- SMS sent this month

## File Changes

| File | Change |
|------|--------|
| `supabase/functions/send-sms/index.ts` | New edge function for Africa's Talking SMS API |
| `supabase/functions/send-sms-on-notification/index.ts` | New edge function triggered by notification insert |
| Database migration | Create `sms_credits` and `sms_log` tables with RLS |
| Database migration | Create trigger on `notifications` table to fire SMS |
| `src/hooks/useSmsCredits.tsx` | New hook to fetch SMS credit balance |
| `src/components/admin/TenantDetailDialog.tsx` | Add SMS credits management section |
| `src/pages/Billing.tsx` | Add SMS usage card |

## Technical Details

### Africa's Talking API Call
```text
POST https://api.africastalking.com/version1/messaging
Content-Type: application/x-www-form-urlencoded
apiKey: {AT_API_KEY}

username=Lereko+Majola&to={phone}&message={message}
```

### SMS Credit Flow
```text
Notification inserted
       |
       v
  AFTER INSERT trigger on notifications table
       |
       v
  Calls send-sms-on-notification edge function
       |
       v
  Looks up user's phone from company_profiles
       |
       v
  Checks sms_credits for remaining balance
       |
       v
  Calls send-sms (Africa's Talking API)
       |
       v
  Logs result in sms_log, decrements credits_used
```

### Default Credit Allocation
Each subscription tier gets a default monthly SMS allocation:
- Free Trial: 10 SMS/month
- Basic: 50 SMS/month
- Standard: 200 SMS/month
- Pro: 500 SMS/month

Admins can override these defaults per tenant from the admin panel.
