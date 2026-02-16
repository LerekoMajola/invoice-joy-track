

# Plan: Multi-Currency Support and Multi-Company (up to 5) Under One Subscription

This is a two-part feature that adds currency flexibility and allows a single subscriber to manage up to 5 separate companies with independent branding and data.

---

## Part 1: Multi-Currency Support

### What Changes
- A new **Currency** setting in the Settings page lets users pick their preferred currency (e.g., Maloti, Rand, USD, EUR, Pula, etc.)
- All monetary values across the platform will display in the chosen currency symbol instead of the hardcoded "M"
- Each company profile stores its own currency, so different companies can use different currencies

### How It Works
- A `currency` column is added to `company_profiles` (default: `'LSL'` for Lesotho Loti)
- The existing `formatMaluti()` function is replaced with a new `formatCurrency(amount, currencyCode)` function that maps codes to symbols (LSL -> M, ZAR -> R, USD -> $, EUR -> E, BWP -> P, etc.)
- A React context provides the active currency to all components so they don't need to pass it around
- A currency dropdown is added to the **Defaults** tab in Settings

---

## Part 2: Multi-Company Support (Up to 5)

### What Changes
- Users can create up to **5 company profiles** under a single subscription
- Each company has its own branding (logo, name, address, banking details, templates, etc.)
- A **company switcher** appears in the header to quickly switch between companies
- All data (clients, invoices, quotes, expenses, etc.) is scoped to the active company
- When switching companies, the entire dashboard reflects that company's data

### How It Works

**Database changes:**
1. Remove the current `UNIQUE(user_id)` constraint on `company_profiles` to allow multiple profiles per user
2. Add a `company_profile_id` column (nullable, UUID, foreign key to company_profiles) to all major data tables: `clients`, `invoices`, `quotes`, `expenses`, `leads`, `tasks`, `staff_members`, `delivery_notes`, `job_cards`, `equipment_items`, `hire_orders`, `bookings`, `rooms`, `fleet_vehicles`, `students`, `legal_cases`, and related tables
3. Create a `user_preferences` table with `active_company_id` to track which company the user is currently working in
4. Backfill existing data: set `company_profile_id` on all existing rows to match the user's current (only) company profile

**Application changes:**
1. **ActiveCompanyContext** -- a new React context that:
   - Loads all company profiles for the user
   - Tracks the active company (from `user_preferences`)
   - Provides `activeCompany`, `companies`, `switchCompany()`, and currency info
   - Enforces the 5-company limit

2. **Company Switcher (Header)** -- a dropdown in the header showing all companies with their logos, with an option to "Add Company" (if under 5)

3. **Hook Updates** -- all data hooks (`useClients`, `useInvoices`, `useQuotes`, `useExpenses`, etc.) will filter by `company_profile_id` from the active company context, in addition to the existing RLS user_id filtering

4. **Settings Page** -- becomes company-specific; when you edit settings, you're editing the active company's profile

5. **Onboarding** -- the first company profile created during onboarding works as before; additional companies are added from the switcher

---

## Technical Details

### New Database Migration

```text
1. ALTER TABLE company_profiles DROP CONSTRAINT company_profiles_user_id_key;
   -- Allows multiple profiles per user

2. ALTER TABLE company_profiles ADD COLUMN currency TEXT NOT NULL DEFAULT 'LSL';

3. CREATE TABLE user_preferences (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
     active_company_id UUID REFERENCES company_profiles(id) ON DELETE SET NULL,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   -- RLS: users can only read/write their own row

4. Add company_profile_id (UUID, nullable, FK to company_profiles) to:
   clients, invoices, quotes, expenses, expense_categories,
   leads, tasks, staff_members, delivery_notes, job_cards,
   equipment_items, hire_orders, bookings, rooms, fleet_vehicles,
   fleet_drivers, students, legal_cases, accounting_transactions,
   bank_accounts, contacts, payslips, recurring_documents,
   and their related sub-tables

5. Backfill: UPDATE each table SET company_profile_id = (
     SELECT id FROM company_profiles WHERE user_id = <table>.user_id LIMIT 1
   ) WHERE company_profile_id IS NULL;

6. Update RLS policies to also check company_profile_id ownership
```

### New/Modified Files

| File | Change |
|------|--------|
| `src/lib/currency.ts` | Replace `formatMaluti` with `formatCurrency(amount, code)` + currency map |
| `src/contexts/ActiveCompanyContext.tsx` | New context: active company, switching, currency |
| `src/components/layout/CompanySwitcher.tsx` | New dropdown component for header |
| `src/components/layout/Header.tsx` | Integrate CompanySwitcher |
| `src/hooks/useCompanyProfile.tsx` | Support multiple profiles, use active company context |
| `src/pages/Settings.tsx` | Add currency selector to Defaults tab |
| All 83 files using `formatMaluti` | Import `formatCurrency` + active currency instead |
| All data hooks (useClients, useInvoices, etc.) | Add `company_profile_id` filter from context |

### Implementation Order

1. Database migration (schema + backfill)
2. Currency system (`formatCurrency` + context)
3. ActiveCompanyContext + user_preferences
4. Company Switcher UI
5. Update data hooks to filter by active company
6. Update all `formatMaluti` references to `formatCurrency`
7. Currency selector in Settings

### Constraints Enforced
- Maximum 5 company profiles per user (checked in context before allowing creation)
- Staff limit of 5 per company (already implemented) applies per-company
- Subscription and modules remain at the user level (shared across all companies)

