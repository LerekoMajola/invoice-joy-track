

# SaaS Multi-Business Platform Implementation Plan

## Overview
Transform the current single-business application into a full SaaS platform where multiple businesses can sign up, manage their operations independently, and subscribe to different pricing tiers.

---

## Current State Analysis

The application already has a solid foundation for multi-tenancy:
- All tables use `user_id` to isolate data between users
- Row Level Security (RLS) policies enforce data isolation
- Each user has their own `company_profiles` record for settings
- Authentication is already implemented with Supabase Auth

**What's missing for a full SaaS:**
- Public landing page with pricing information
- Subscription/billing system
- Usage limits enforcement (clients, quotes, invoices per tier)
- Onboarding flow for new businesses
- Admin dashboard (optional, for you to manage customers)

---

## Implementation Plan

### Phase 1: Landing Page & Marketing Site

Create a public-facing landing page that showcases the platform to potential customers.

**New Files:**
- `src/pages/Landing.tsx` - Marketing landing page with:
  - Hero section explaining the value proposition
  - Features grid (Quotes, Invoices, Delivery Notes, CRM, Profitability tracking)
  - Pricing table with 3 tiers (based on your SaaS strategy):
    - **Basic (M300/month)**: 50 clients, 100 quotes/month
    - **Standard (M500/month)**: 200 clients, unlimited quotes
    - **Pro (M800/month)**: Unlimited everything + priority support
  - 7-day free trial call-to-action
  - Testimonials section (placeholder for now)
  - Footer with contact info

**Changes:**
- Update `src/App.tsx` to show Landing page for unauthenticated users at `/`
- Move Dashboard to protected route `/dashboard`
- Update navigation structure

---

### Phase 2: Subscription & Billing System

**Database Tables:**

```text
subscriptions
├── id (uuid)
├── user_id (uuid) - references the business owner
├── plan (enum: 'free_trial', 'basic', 'standard', 'pro')
├── status (enum: 'trialing', 'active', 'past_due', 'cancelled')
├── trial_ends_at (timestamp)
├── current_period_start (timestamp)
├── current_period_end (timestamp)
├── created_at (timestamp)
├── updated_at (timestamp)

usage_tracking
├── id (uuid)
├── user_id (uuid)
├── period_start (date)
├── period_end (date)
├── clients_count (integer)
├── quotes_count (integer)
├── invoices_count (integer)
├── updated_at (timestamp)
```

**Plan Limits:**

| Feature | Free Trial | Basic | Standard | Pro |
|---------|------------|-------|----------|-----|
| Duration | 7 days | Unlimited | Unlimited | Unlimited |
| Clients | 10 | 50 | 200 | Unlimited |
| Quotes/month | 20 | 100 | Unlimited | Unlimited |
| Invoices/month | 10 | 50 | Unlimited | Unlimited |

---

### Phase 3: Usage Limits & Enforcement

**New Hook:**
- `src/hooks/useSubscription.tsx` - Manages subscription state and checks:
  - Current plan details
  - Usage counts for current period
  - Methods to check if action is allowed

**Enforcement Points:**
- Before creating a new client - check `clients_count`
- Before creating a new quote - check `quotes_count`
- Before creating a new invoice - check `invoices_count`
- Show upgrade prompts when limits are reached

**UI Components:**
- `src/components/subscription/UsageMeter.tsx` - Shows current usage
- `src/components/subscription/UpgradePrompt.tsx` - Modal when limit reached
- Add usage display to Dashboard and Settings

---

### Phase 4: Onboarding Flow

When a new user signs up:

1. **Welcome Screen** - Brief intro to the platform
2. **Company Setup** - Collect essential info:
   - Company name
   - Business type/industry
   - Phone number
   - Logo upload (optional)
3. **Subscription Selection** - Choose plan or start free trial
4. **Redirect to Dashboard**

**New Files:**
- `src/pages/Onboarding.tsx` - Multi-step onboarding wizard
- Update `ProtectedRoute` to redirect new users to onboarding

---

### Phase 5: Payment Integration

For Lesotho-specific payments (M-Pesa, bank transfers):

**Option A: Manual Payment Verification (Recommended for MVP)**
- User selects plan and submits payment proof
- Admin reviews and activates subscription manually
- Simple and works with local payment methods

**Option B: Stripe Integration (For card payments)**
- Integrate Stripe for international card payments
- Use Stripe Checkout for subscription management
- Webhook to update subscription status

**Files:**
- `src/pages/Billing.tsx` - Manage subscription, view invoices
- `supabase/functions/verify-payment/index.ts` - Process payment verification
- Add billing link to Settings page

---

### Phase 6: Updated Auth Flow

**Changes to `src/pages/Auth.tsx`:**
- Add business name field during signup
- Create company_profiles record automatically
- Create subscription record (7-day trial)
- Initialize usage_tracking record

**Post-Signup Flow:**
```text
Sign Up → Create User → Create Company Profile → 
Create Trial Subscription → Redirect to Onboarding
```

---

## Technical Details

### Database Migration SQL

```sql
-- Create plan enum
CREATE TYPE subscription_plan AS ENUM ('free_trial', 'basic', 'standard', 'pro');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'expired');

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free_trial',
  status subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at timestamptz,
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz,
  payment_method text,
  payment_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Usage tracking table
CREATE TABLE public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  clients_count integer DEFAULT 0,
  quotes_count integer DEFAULT 0,
  invoices_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);
```

### Updated Routing Structure

```text
/ ........................ Landing (public)
/auth .................... Login/Signup (public)
/onboarding .............. New user setup (protected)
/dashboard ............... Main dashboard (protected)
/crm ..................... Clients & Leads (protected)
/quotes .................. Quotes management (protected)
/invoices ................ Invoices management (protected)
/delivery-notes .......... Delivery notes (protected)
/profitability ........... Profitability tracking (protected)
/tasks ................... Task management (protected)
/tenders ................. Tenders & RFQs (protected)
/settings ................ Company settings (protected)
/billing ................. Subscription & billing (protected)
```

---

## Implementation Priority

1. **Phase 1**: Landing page (lets you start marketing)
2. **Phase 2**: Database tables for subscriptions
3. **Phase 3**: Basic usage tracking
4. **Phase 4**: Onboarding flow
5. **Phase 5**: Manual payment verification (MVP)
6. **Phase 6**: Stripe integration (future enhancement)

---

## Files to Create/Modify

**New Files:**
- `src/pages/Landing.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/Billing.tsx`
- `src/hooks/useSubscription.tsx`
- `src/components/subscription/UsageMeter.tsx`
- `src/components/subscription/UpgradePrompt.tsx`
- `src/components/subscription/PricingCard.tsx`
- `src/components/landing/Hero.tsx`
- `src/components/landing/Features.tsx`
- `src/components/landing/PricingTable.tsx`

**Modified Files:**
- `src/App.tsx` - Updated routing
- `src/pages/Auth.tsx` - Add company name field, auto-create records
- `src/components/layout/ProtectedRoute.tsx` - Check onboarding status
- `src/components/layout/Sidebar.tsx` - Add Billing link
- `src/hooks/useClients.tsx` - Add usage limit check
- `src/hooks/useQuotes.tsx` - Add usage limit check
- `src/hooks/useInvoices.tsx` - Add usage limit check

