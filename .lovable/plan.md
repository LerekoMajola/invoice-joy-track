

## Update BizPro Package Tiers

### Summary

Update the three BizPro tiers in the database with new names, prices, modules, and features as specified. The pricing page and billing dashboard already read from the `package_tiers` table dynamically, so no frontend code changes are needed for the pricing display.

### New Tier Definitions

| Tier | Price | Modules | Users | Extra |
|------|-------|---------|-------|-------|
| **Lite** | M150/mo | Quotes and Estimates, Invoices | 1 user | Phone and Email Support |
| **Professional** | M350/mo | Quotes and Estimates, Invoices, Task Management, Staff and HR, CRM and Leads, Accounting, Tender Source Links, Delivery Notes, Clients | 5 users | Extra user: M50/mo each. Phone and Email Support |
| **Enterprise+** | M1,250/mo | Everything in Professional + all custom modules | 20 users | Phone and Email Support |

### Technical Steps

#### 1. Database Updates (3 UPDATE statements on `package_tiers`)

**Lite** (ID: `d682e5f9-0702-4fae-af54-ee379c4f9211`):
- Rename from "Starter" to "Lite", display_name to "BizPro Lite"
- Price: M350 down to M150
- Module keys: `['quotes', 'invoices']` (remove tasks and staff)
- Features: Quotes and Estimates (yes), Invoices (yes), 1 User (yes), Phone and Email Support (yes), Task Management (no), Staff and HR (no), CRM and Leads (no), Accounting (no)

**Professional** (ID: `c50944ab-f60f-4096-9c1a-9870339e42ea`):
- Price: M550 down to M350
- Module keys: `['quotes', 'invoices', 'tasks', 'staff', 'core_crm', 'accounting', 'tenders', 'delivery_notes']`
- Features: All included items listed, plus "5 Users (extra user M50/mo)", "Phone and Email Support"

**Enterprise+** (ID: `e29a7ef3-d4b4-4acf-9151-81c527f28cca`):
- Rename from "Enterprise" to "Enterprise+", display_name to "BizPro Enterprise+"
- Price: M800 up to M1,250
- Module keys: `['quotes', 'invoices', 'tasks', 'staff', 'core_crm', 'accounting', 'tenders', 'delivery_notes', 'profitability', 'fleet', 'workshop']`
- Features: All modules included, "20 Users", "Phone and Email Support", "All Custom Modules"

#### 2. Staff creation block for Lite tier

**File: `src/components/staff/AddStaffDialog.tsx`**
- Already imports `useSubscription`
- Add check: if user's `packageTierId` matches the Lite tier ID, show a warning message and disable form submission
- Message: "Staff management is not available on the Lite plan. Upgrade to Professional to add team members."

#### 3. No other frontend changes needed
- `PricingTable.tsx` renders features from the DB `features` array -- will auto-update
- `Billing.tsx` reads tiers via `usePackageTiers` -- will auto-update
- `PackageTierSelector.tsx` on auth page reads from DB -- will auto-update

