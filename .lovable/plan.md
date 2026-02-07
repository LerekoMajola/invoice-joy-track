

# Build Your Own Package - Modular Subscription System

Transform the current fixed-tier pricing (Basic/Standard/Pro) into a flexible "build your own package" model where users pick individual modules, each with its own monthly cost. This also introduces a new Fleet Management module.

---

## How It Will Work

Users signing up will go through a two-step process:
1. **Step 1**: Enter email and password (existing flow)
2. **Step 2**: Choose which modules to include in their package

Each module has a monthly price. The total subscription cost is the sum of selected modules. All users still get a 7-day free trial with their chosen modules.

The system will also gate access -- users only see sidebar/navigation items for modules they've subscribed to.

---

## Available Modules

| Module | Monthly Price | Description |
|--------|-------------|-------------|
| Core (CRM + Clients) | M100 | Client management, leads, contacts -- always included |
| Quotes | M50 | Create and manage quotations |
| Invoices | M50 | Invoice generation and tracking |
| Delivery Notes | M30 | Delivery note management |
| Profitability | M50 | Job profitability tracking and analytics |
| Task Management | M30 | Task and project management |
| Tender Tracking | M30 | Tender and RFQ tracking |
| Accounting | M80 | Full accounting with bank accounts, expenses |
| Staff & HR | M80 | Staff management, payroll, payslips |
| Fleet Management | M100 | Vehicle tracking, maintenance, fuel logs (NEW) |

---

## Technical Plan

### 1. Database Changes (2 new tables + seed data)

**Table: `platform_modules`** -- defines available modules (admin-managed)
- `id` (uuid, PK)
- `name` (text) -- e.g. "Quotes", "Fleet Management"
- `key` (text, unique) -- e.g. "quotes", "fleet_management"
- `description` (text)
- `monthly_price` (numeric) -- price in Maluti
- `icon` (text) -- lucide icon name
- `is_core` (boolean, default false) -- core modules are always included
- `is_active` (boolean, default true) -- admin can disable modules
- `sort_order` (integer)
- `created_at`, `updated_at`

RLS: Everyone can read (public catalog). Only super_admins can modify.

**Table: `user_modules`** -- tracks which modules each user subscribed to
- `id` (uuid, PK)
- `user_id` (uuid)
- `module_id` (uuid, FK to platform_modules)
- `is_active` (boolean, default true)
- `activated_at` (timestamptz)
- `created_at`, `updated_at`

RLS: Users can view/insert/update their own. Admins can view/update all.

Seed the `platform_modules` table with the initial set of modules listed above.

### 2. New Component: Module Selector (`src/components/auth/ModuleSelector.tsx`)

A visually appealing card-based selector shown during signup:
- Each module displayed as a toggleable card with icon, name, description, and price
- Core module(s) shown as always-included (cannot be deselected)
- Running total displayed at the bottom
- "Start Free Trial" button to complete signup
- Responsive grid layout (2 columns on mobile, 3 on desktop)

### 3. Update Auth Page (`src/pages/Auth.tsx`)

Convert the signup flow into a multi-step process:
- **Step 1**: Email + password (existing)
- **Step 2**: Module selection (new `ModuleSelector` component)
- After user creates account in Step 1, show Step 2 before redirect
- Save selected modules to `user_modules` table after signup

### 4. New Hook: `useModules` (`src/hooks/useModules.tsx`)

- Fetches available modules from `platform_modules`
- Fetches user's subscribed modules from `user_modules`
- Provides helper functions: `hasModule(key)`, `getUserModules()`, `getMonthlyTotal()`
- Used throughout the app to gate access to features

### 5. Update Navigation Gating

**Sidebar (`src/components/layout/Sidebar.tsx`):**
- Map each nav item to its module key
- Only show nav items for modules the user has subscribed to
- Dashboard, Settings, and Billing are always visible

**Bottom Nav (`src/components/layout/BottomNav.tsx`):**
- Same gating logic for mobile navigation

**More Menu Sheet:**
- Filter items based on subscribed modules

### 6. Update Protected Route (`src/components/layout/ProtectedRoute.tsx`)

- When creating the initial subscription for new users, also check if they have modules selected
- If no modules found (legacy users), auto-assign all existing modules

### 7. Update Landing Page Pricing (`src/components/landing/PricingTable.tsx`)

Replace the 3-tier pricing cards with a module-based pricing display:
- Show the "Build Your Package" concept
- Display each module as a card with its price
- Interactive calculator showing estimated monthly cost
- CTA still leads to the signup page

### 8. Update Billing Page (`src/pages/Billing.tsx`)

- Show currently subscribed modules with their individual costs
- Allow adding/removing modules
- Show total monthly cost
- Keep the payment contact info section

### 9. Update Subscription Hook (`src/hooks/useSubscription.tsx`)

- Calculate the total monthly cost from user's active modules instead of fixed plan prices
- Keep backward compatibility with existing plan-based limits

### 10. Admin: Module Management

**Update Admin Settings Tab** to include a module management section:
- List all platform modules
- Edit prices, enable/disable modules
- Add new modules

**Update Edit Subscription Dialog** to show/manage user modules alongside plan/status.

### 11. Fleet Management Module (New Feature Placeholder)

Create a basic Fleet Management page at `/fleet`:
- Route added to `App.tsx`
- Page with placeholder tabs: Vehicles, Maintenance, Fuel Logs
- Nav item gated to users who selected this module
- This establishes the structure for future fleet management features

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/auth/ModuleSelector.tsx` | Module selection cards for signup |
| `src/hooks/useModules.tsx` | Hook for module access checks |
| `src/pages/Fleet.tsx` | Fleet Management page (placeholder) |
| `src/components/admin/ModuleManagement.tsx` | Admin module management UI |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Add multi-step signup with module selection |
| `src/components/layout/Sidebar.tsx` | Gate nav items by subscribed modules |
| `src/components/layout/BottomNav.tsx` | Gate mobile nav by modules |
| `src/components/layout/MoreMenuSheet.tsx` | Gate more menu items |
| `src/components/layout/ProtectedRoute.tsx` | Handle module initialization for new users |
| `src/components/landing/PricingTable.tsx` | Replace tier pricing with modular pricing |
| `src/pages/Billing.tsx` | Show module-based billing with add/remove |
| `src/hooks/useSubscription.tsx` | Integrate with modules for cost calculation |
| `src/components/admin/AdminSettingsTab.tsx` | Add module management section |
| `src/components/admin/EditSubscriptionDialog.tsx` | Add user module management |
| `src/App.tsx` | Add Fleet Management route |

## Database Migration

One migration to create both tables with RLS policies and seed data for the initial 10 modules.

