

# Security Hardening: Lock Down All Database Tables

Your application has a solid architecture but critical security gaps that must be closed before commercial deployment. This plan fixes all 14 critical findings.

## The Problem

All 73 tables have RLS enabled, but many policies allow unauthenticated users to read data. Anyone with your project URL could query and download sensitive business data including employee salaries, client contacts, legal cases, and financial records.

## What Will Change

### 1. Fix RLS Policies on All Business Tables (~50 tables)

Every table that stores user/business data will get restrictive policies ensuring:
- Only authenticated users can access data
- Users can only see their own data (matched by `user_id`)
- Staff members can access their employer's data (matched through `owner_user_id` relationship)
- Child tables (e.g. `quote_line_items`) inherit access through their parent's `user_id`

Tables affected include: contacts, leads, clients, staff_members, students, bookings, invoices, quotes, expenses, bank_accounts, payslips, legal_cases, legal_documents, fleet_vehicles, company_profiles, and all related child/junction tables.

### 2. Enable Leaked Password Protection

Turn on the built-in check that prevents users from signing up with passwords known to be compromised in data breaches.

### 3. Review Storage Bucket Policies

The `company-assets` and `hire-assets` buckets are currently public. Evaluate whether they need to be, and add policies if appropriate.

## Technical Details

### Policy Pattern for Owner Tables
```text
-- Tables with user_id column:
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

### Policy Pattern for Staff-Accessible Tables
```text
-- Staff can read their employer's data:
SELECT: auth.uid() = user_id 
   OR EXISTS (
     SELECT 1 FROM staff_members 
     WHERE staff_members.user_id = auth.uid() 
     AND staff_members.owner_user_id = [table].user_id
   )
```

### Policy Pattern for Child Tables (no user_id)
```text
-- e.g. quote_line_items joins through quotes:
SELECT: EXISTS (
  SELECT 1 FROM quotes 
  WHERE quotes.id = quote_line_items.quote_id 
  AND quotes.user_id = auth.uid()
)
```

### Platform Tables (platform_settings, platform_modules)
These intentionally remain publicly readable since they serve the landing/pricing page.

## Migration Approach

- Single database migration that drops overly permissive policies and replaces them with properly scoped ones
- All existing application code already passes `user_id` on inserts, so no frontend changes needed
- The migration is non-destructive -- no data is changed, only access rules

## Files to Modify

| File | Action |
|------|--------|
| Database migration (SQL) | Create -- replace all permissive RLS policies with restrictive ones |
| Auth configuration | Update -- enable leaked password protection |

## Risk Assessment

- **Low risk**: All tables are currently empty in production, so no data access disruption
- **No frontend changes**: The app already scopes queries by `user_id` and `company_profile_id`
- **Reversible**: Policies can be adjusted if any legitimate access pattern is blocked

## After This Fix

- No unauthenticated user can read any business data
- Each user's data is completely isolated from other users
- Staff members can only access data belonging to their employer
- The system will be safe to deploy commercially and scale

