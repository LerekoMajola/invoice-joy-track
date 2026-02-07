

# Updated Pricing Packages -- Beefed-Up Starters with New Price Points

Replace the current module-picker pricing table with a tabbed, 3-tier package layout per system. The starter tiers now include significantly more modules, matching the user's specified prices.

---

## Package Breakdown

### Business Management

| | Starter | Professional | Enterprise |
|---|---|---|---|
| **Price** | M350/mo | M520/mo | M680/mo |
| **Target** | Growing service companies | Established contractors | Large operations & teams |
| Core CRM + Clients | Yes | Yes | Yes |
| Quotes | Yes | Yes | Yes |
| Invoices | Yes | Yes | Yes |
| Task Management | Yes | Yes | Yes |
| Delivery Notes | Yes | Yes | Yes |
| Profitability Tracking | Yes | Yes | Yes |
| Tender Tracking | -- | Yes | Yes |
| Accounting | -- | Yes | Yes |
| Staff & HR | -- | Yes | Yes |
| Fleet Management | -- | -- | Yes |

Starter includes 6 modules (Core + Quotes + Invoices + Tasks + Delivery Notes + Profitability).

### Workshop Management

| | Starter | Professional | Enterprise |
|---|---|---|---|
| **Price** | M450/mo | M650/mo | M850/mo |
| **Target** | Small repair shops | Busy workshops | Multi-bay service centres |
| Core CRM + Clients | Yes | Yes | Yes |
| Workshop (Job Cards) | Yes | Yes | Yes |
| Quotes | Yes | Yes | Yes |
| Invoices | Yes | Yes | Yes |
| Task Management | Yes | Yes | Yes |
| Delivery Notes | Yes | Yes | Yes |
| Staff & HR | -- | Yes | Yes |
| Profitability Tracking | -- | Yes | Yes |
| Accounting | -- | Yes | Yes |
| Fleet Management | -- | -- | Yes |

Starter includes 6 modules (Core + Workshop + Quotes + Invoices + Tasks + Delivery Notes).

### School Management

| | Starter | Professional | Enterprise |
|---|---|---|---|
| **Price** | M720/mo | M950/mo | M1,200/mo |
| **Target** | Small private schools | Mid-size academies | Large schools & campuses |
| Core CRM + Clients | Yes | Yes | Yes |
| School Admin | Yes | Yes | Yes |
| Student Management | Yes | Yes | Yes |
| School Fees | Yes | Yes | Yes |
| Invoices | Yes | Yes | Yes |
| Task Management | Yes | Yes | Yes |
| Staff & HR | Yes | Yes | Yes |
| Accounting | -- | Yes | Yes |
| Profitability Tracking | -- | Yes | Yes |
| Fleet Management | -- | -- | Yes |

Starter includes 7 modules (Core + School Admin + Students + School Fees + Invoices + Tasks + Staff & HR).

---

## UI Design

The component will use a tabbed layout with three tabs: **Business**, **Workshop**, **School** -- each showing 3 pricing cards side by side.

Each card includes:
- Package name and monthly price (large, bold)
- "Best for..." subtitle
- Feature checklist with check icons for included and dash for excluded
- "Most Popular" badge on the middle (Professional/Standard) tier
- "Start Free Trial" CTA button
- "7-day free trial" fine print

Below all packages: a "Or build your own package" link directing to /auth where the individual module picker lives.

---

## Technical Details

### File to Modify

**`src/components/landing/PricingTable.tsx`** -- Complete rewrite

- Remove the current module-picker grid (fetching from `platform_modules`)
- Replace with static package data arrays and a Radix Tabs layout
- Three tabs: Business / Workshop / School
- Three cards per tab using responsive grid (1 col mobile, 3 col desktop)
- Keep `formatMaluti` for price display
- Use existing `Badge`, `Button`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` components
- CTA buttons link to `/auth`
- "Most Popular" highlighted card gets a primary-coloured border and elevated shadow

### No Other Files Changed

- `Landing.tsx` already renders `<PricingTable />` -- no change needed
- `Solutions.tsx`, `Hero.tsx`, `Features.tsx` -- unchanged
- `ModuleSelector.tsx` (signup flow) -- unchanged, still uses individual module picker
- No database changes -- packages are a marketing presentation layer only

