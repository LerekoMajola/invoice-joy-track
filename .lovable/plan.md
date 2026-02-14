

# Reorganize Admin Tabs into Clear Industry-Standard Groups

## The Problem
The current tabs -- Tenants, Sign-ups, Subscriptions -- are three separate views of the same user base, making it confusing to navigate. Where do you go to find a customer? All three places show overlapping data.

## New Tab Structure

```text
Before:  Overview | Tenants | Sign-ups | Subscriptions | Settings
After:   Overview | Customers | Billing | Settings
```

### 1. "Customers" Tab (merges Tenants + Sign-ups)
- A single unified table showing ALL users in one place
- Toggle filter at the top: **All** | **Onboarded** | **Not Onboarded**
- Keeps all existing columns: company name, email, system type, status, usage, joined date
- Keeps all existing actions: view detail, edit subscription, delete
- Sign-ups that haven't onboarded show as rows with "Not Onboarded" badge and no company name
- This eliminates the confusion of "is this person a tenant or a sign-up?"

### 2. "Billing" Tab (replaces Subscriptions)
- Renamed to the industry-standard term "Billing"
- Same subscription management table with plan, price, status, trial/period dates
- Keeps the edit subscription action and payment page preview button

## Technical Changes

### File: `src/pages/Admin.tsx`
- Change tabs from 5 to 4: Overview, Customers, Billing, Settings
- Remove the "tenants" and "signups" TabsTrigger/TabsContent
- Add "customers" and "billing" TabsTrigger/TabsContent

### New File: `src/components/admin/CustomersTab.tsx`
- Combines data from both `useAdminTenants()` and `useAdminSignups()`
- Unified table with a toggle to filter between All / Onboarded / Not Onboarded
- Onboarded rows show the full tenant experience (company name, usage, view/edit/delete)
- Non-onboarded rows show email, system type, signup date, and delete action
- Keeps all existing filters: search, status, system type

### File: `src/components/admin/SubscriptionsTab.tsx`
- No logic changes, just rename to `BillingTab`

### File: `src/components/admin/index.ts`
- Export `CustomersTab` and `BillingTab` instead of `TenantsTab`, `SignupsTab`, `SubscriptionsTab`
