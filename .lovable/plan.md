

## Fix Package Pricing: Single Source of Truth

### The Problem

Right now, package prices exist in **three disconnected places**:
1. Hardcoded tier arrays in `PackageTierSelector.tsx` (signup) -- e.g., BizPro Starter = M350
2. Hardcoded tier arrays in `PricingTable.tsx` (landing page) -- same hardcoded values
3. Individual module prices in the `platform_modules` database table -- e.g., Quotes M50 + Invoices M50 + Tasks M30 + Staff M80 = M210

After signup, the Billing page shows the sum of module prices (M210), not the tier price the user saw (M350). This creates confusion about what the subscriber actually owes.

### The Solution: Database-Driven Package Tiers

Create a `package_tiers` table as the **single source of truth** for all pricing. Both the landing page and signup flow will read from this table instead of hardcoded arrays. Subscribers can also custom-build their own package.

### How It Works

**For pre-built packages (Starter / Professional / Enterprise):**
- Admin sets a bundle price per tier (can include markup or discount vs. raw module sum)
- When a user selects a tier, the system stores the tier ID on their subscription
- Billing page shows the tier's bundle price as "Monthly Total"

**For custom-built packages:**
- User picks individual modules (existing flow)
- Monthly total = sum of selected module prices (existing behavior)
- Subscription is marked as "custom" tier

**Post-signup flexibility:**
- On the Billing page, users can see their current package and have a "Customize Package" button
- This opens the module selector where they can add/remove modules
- Changing modules switches them to custom pricing (sum of modules) or they can switch back to a pre-built tier

### What Changes

**1. New database table: `package_tiers`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| system_type | text | e.g., 'business', 'gym' |
| name | text | e.g., 'Starter', 'Professional', 'Enterprise' |
| display_name | text | e.g., 'BizPro Starter' |
| description | text | Target audience text |
| bundle_price | numeric | What the customer pays per month |
| module_keys | text[] | Array of module keys included |
| features | jsonb | Display features list with included/excluded flags |
| is_popular | boolean | Highlight badge |
| sort_order | integer | Display ordering |
| is_active | boolean | Can be hidden without deleting |

**2. Add `package_tier_id` to `subscriptions` table**
- Links the subscriber to their selected tier
- NULL means custom-built package

**3. New hook: `usePackageTiers`**
- Fetches tiers from database filtered by system_type
- Replaces all hardcoded tier arrays

**4. Update these files to use database tiers:**

| File | Change |
|------|--------|
| `src/components/auth/PackageTierSelector.tsx` | Remove ~400 lines of hardcoded tiers, fetch from `package_tiers` table instead |
| `src/components/landing/PricingTable.tsx` | Remove ~360 lines of hardcoded tiers, fetch from `package_tiers` table instead |
| `src/pages/Auth.tsx` | Store `package_tier_id` on subscription during signup |
| `src/pages/Billing.tsx` | Show bundle price from tier (or module sum for custom). Add "Customize Package" button |
| `src/hooks/useModules.tsx` | Add `getMonthlyTotal` logic that checks tier price first, falls back to module sum |

**5. Seed data migration**
- Insert all 24 current tiers (3 per vertical x 8 verticals) into `package_tiers` with the prices currently hardcoded
- This makes them editable by the admin going forward

### Billing Page Improvements

The Billing page "Your Package" section will be enhanced:
- Shows the tier name (e.g., "BizPro Professional") and bundle price if on a pre-built tier
- Shows "Custom Package" with module-sum price if on a custom build
- Lists included modules with individual prices for transparency
- "Change Package" button opens a sheet where users can:
  - Switch to a different pre-built tier for their vertical
  - Or toggle individual modules (switches to custom pricing)

### Admin Benefits

Since tiers are now in the database:
- Prices can be adjusted without code changes
- New tiers can be added per vertical
- Tiers can be deactivated without deleting
- The admin dashboard could later include a tier management UI

### Technical Details

**Database migration:**
```
-- Create package_tiers table
-- Add package_tier_id to subscriptions
-- Seed all 24 tier definitions
-- RLS: public read (for landing/signup), admin write
```

**New files:**
- `src/hooks/usePackageTiers.tsx` -- fetch and cache tiers

**Modified files:**
- `src/components/auth/PackageTierSelector.tsx` -- use database tiers
- `src/components/landing/PricingTable.tsx` -- use database tiers
- `src/pages/Auth.tsx` -- save tier ID on signup
- `src/pages/Billing.tsx` -- show tier price, add customization
- `src/hooks/useModules.tsx` -- tier-aware pricing logic

**No breaking changes** -- existing subscribers keep working. Their `package_tier_id` will be NULL (treated as custom) until they select a tier.
