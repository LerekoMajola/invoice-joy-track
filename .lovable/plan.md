

## Use Active Company Profile Data for Notifications

### Problem
When notifications are triggered (e.g., "Deal Won!"), the system looks up your phone number and email from **any** company profile you own, rather than the one you're actively working in. With multiple company profiles, this can send SMS to the wrong phone number or use the wrong contact details.

### Solution
Thread the `company_profile_id` through the entire notification pipeline so that SMS and email always use the contact details from the correct company profile.

### Changes

#### 1. Update Database Trigger Functions
Modify the three notification trigger functions to copy the `company_profile_id` from the source record (lead, invoice, quote) into the notification row:

- **`notify_lead_status_change()`** -- read `NEW.company_profile_id` and insert it into the notification
- **`notify_invoice_status_change()`** -- same
- **`notify_quote_status_change()`** -- same

#### 2. Update SMS Trigger to Pass `company_profile_id`
Modify **`notify_sms_on_notification()`** database trigger to include `company_profile_id` in the payload sent to the `send-sms-on-notification` edge function.

#### 3. Update Email Trigger to Pass `company_profile_id`
Modify **`notify_email_on_notification()`** database trigger to include `company_profile_id` in the payload sent to the `send-email-notification` edge function.

#### 4. Update `send-sms-on-notification` Edge Function
Instead of querying for any company profile with a phone number, look up the **specific** profile by `company_profile_id` (falling back to the active company from `user_preferences`, then to any profile with a phone).

#### 5. Update `send-email-notification` Edge Function
Similarly, when building the email, optionally use the business email from the specific company profile rather than always using the auth email. This ensures the email is sent to the address registered on the active profile.

### Technical Details

**Database migration** (single SQL migration):
- `CREATE OR REPLACE FUNCTION notify_lead_status_change()` -- adds `company_profile_id` to the INSERT into notifications
- `CREATE OR REPLACE FUNCTION notify_invoice_status_change()` -- same
- `CREATE OR REPLACE FUNCTION notify_quote_status_change()` -- same
- `CREATE OR REPLACE FUNCTION notify_sms_on_notification()` -- adds `company_profile_id` to the JSON payload
- `CREATE OR REPLACE FUNCTION notify_email_on_notification()` -- adds `company_profile_id` to the JSON payload

**Edge function updates:**

- **`supabase/functions/send-sms-on-notification/index.ts`**: Accept `company_profile_id`, query `company_profiles` by ID first, fall back to `user_preferences.active_company_id`, then fall back to any profile with a phone
- **`supabase/functions/send-email-notification/index.ts`**: Accept `company_profile_id`, query the specific profile's email, fall back to auth email

This ensures that no matter how many companies you manage, notifications always use the contact details from the profile the event originated in.
