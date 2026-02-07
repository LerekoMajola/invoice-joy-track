

# System-Aware Signup Flow with Package Selection

## Current State

Right now, the signup process works like this:
1. User enters email + password
2. After account creation, they see a flat grid of **all** individual modules and manually pick which ones they want
3. Everyone lands on the **same** dashboard (business-focused with quotes, invoices, tenders, leads)

There is no concept of a "system type" -- the platform does not know whether a user signed up for Business, Workshop, or School. The sidebar and bottom nav simply filter items based on which individual modules are active, but the dashboard itself is always the same business-centric layout.

## What Needs to Change

### 1. Add a "system_type" column to track the user's chosen system

**Database migration:** Add a `system_type` text column to the `subscriptions` table with allowed values: `business`, `workshop`, `school`.

This ties the system choice to the subscription record so the platform knows which system the user is on.

### 2. Redesign the signup flow into 3 steps

Replace the current 2-step flow (credentials then module picker) with a 3-step flow:

**Step 1 -- Choose Your System** (new step)
- Three large, visually distinct cards: Business, Workshop, School
- Each card shows the system icon, name, short description, and "Starting from M350/mo" pricing
- Uses the same gradient colours from the landing page (purple for Business, coral for Workshop, blue for School)
- User clicks one to proceed

**Step 2 -- Choose Your Package Tier**
- Shows the 3 tiers (Starter / Professional / Enterprise) for the selected system only
- Same layout as the landing page pricing cards but adapted for the signup context
- Each card lists included modules, price, and a "Select" button
- Also includes an "Or customise your own" link at the bottom that opens the existing module picker

**Step 3 -- Enter Credentials**
- Standard email + password form (the existing form, moved to step 3)
- After account creation, the selected modules are saved to `user_modules` and the system_type + plan tier are saved to `subscriptions`

### 3. System-aware dashboard

Create a routing layer that shows the correct dashboard based on the user's `system_type`:

- **Business users** -- see the current dashboard (quotes, invoices, tenders, leads pipeline, etc.)
- **Workshop users** -- see a workshop-focused dashboard with Job Card stats, active repairs, workshop queue, and quick-create job card button
- **School users** -- see a school-focused dashboard with student count, fee collection stats, upcoming terms, and announcements

### 4. System-aware onboarding dialog

Update the `CompanyOnboardingDialog` to adapt its wording based on system type:
- Business: "Let's set up your business"
- Workshop: "Let's set up your workshop"
- School: "Let's set up your school"

---

## Files to Create / Modify

### Database
- **Migration**: Add `system_type text DEFAULT 'business'` column to `subscriptions` table

### New Files
- `src/components/auth/SystemSelector.tsx` -- Step 1: Three system cards
- `src/components/auth/PackageTierSelector.tsx` -- Step 2: Three tier cards for the chosen system
- `src/pages/WorkshopDashboard.tsx` -- Workshop-specific dashboard layout
- `src/pages/SchoolDashboard.tsx` -- School-specific dashboard layout

### Modified Files
- `src/pages/Auth.tsx` -- Rewrite signup flow to use 3 steps (system choice, package tier, credentials)
- `src/pages/Dashboard.tsx` -- Add system_type detection and render the correct dashboard variant
- `src/hooks/useSubscription.tsx` -- Expose `systemType` from the subscription record
- `src/components/onboarding/CompanyOnboardingDialog.tsx` -- Adapt welcome text by system type
- `src/integrations/supabase/types.ts` -- Will auto-update after migration

### Unchanged
- `src/components/auth/ModuleSelector.tsx` -- Kept as the "custom build" fallback
- `src/components/landing/PricingTable.tsx` -- No changes (landing page stays the same)
- `src/components/layout/Sidebar.tsx` -- Already module-gated, will naturally show correct items
- `src/components/layout/BottomNav.tsx` -- Already module-gated

---

## Detailed Flow

```text
Landing Page
    |
    v
[Start Free Trial] button
    |
    v
/auth (signup mode)
    |
    v
Step 1: "What are you managing?"
  +------------------+  +------------------+  +------------------+
  |   Business       |  |   Workshop       |  |   School         |
  |   Briefcase icon |  |   Wrench icon    |  |   GraduationCap  |
  |   From M350/mo   |  |   From M450/mo   |  |   From M720/mo   |
  +------------------+  +------------------+  +------------------+
    |
    v  (user picks one)
Step 2: "Choose your package"
  Shows 3 tiers for that system (Starter / Professional / Enterprise)
  + "Or build your own" link at bottom
    |
    v  (user picks a tier)
Step 3: "Create your account"
  Email + Password form
    |
    v  (on submit)
  - Create auth account
  - Insert user_modules rows for the selected tier's modules
  - Insert/update subscription with system_type + plan tier
  - Redirect to /dashboard
    |
    v
Dashboard detects system_type and renders:
  - Business dashboard (current)
  - Workshop dashboard (job card focused)
  - School dashboard (student/fee focused)
```

---

## Workshop Dashboard Content
- **Stats**: Active Job Cards, Completed This Month, Revenue This Month, Pending Quotes
- **Active Repairs Queue**: List of in-progress job cards with vehicle info and status
- **Quick Actions**: Create Job Card, Create Quote, Create Invoice
- **Recent Activity**: Latest job card updates

## School Dashboard Content
- **Stats**: Total Students, Fee Collection Rate, Active Terms, Pending Payments
- **Fee Collection Overview**: Progress bar showing collected vs outstanding
- **Upcoming Events**: Term dates, announcements
- **Quick Actions**: Record Payment, Add Student, Create Invoice

