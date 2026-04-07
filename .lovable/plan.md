
## Simplify Pricing to Two Verticals

### Problem
Complex module-based pricing leads to wrong totals at month-end. Too many tiers and verticals.

### Solution
Three simple flat-rate plans:
- **BizPro** — M350/month (covers Business, Workshop, Hire, Guesthouse, Fleet, School)
- **LawPro** — M450/month (Legal practice management)
- **GymPro** — M700/month

### Changes

1. **Database: Deactivate old package tiers, keep only 2 active**
   - Deactivate all existing `package_tiers` rows
   - Insert/update two active tiers: BizPro (M350) and GymPro (M700)

2. **Admin billing logic (`useAdminStats`, `useAdminTenants`, billing tab)**
   - MRR calculation: simply count active BizPro × 350 + active GymPro × 700
   - Remove complex bundle_price / module-sum fallback logic

3. **Signup flow (`Auth.tsx`, `PackageTierSelector.tsx`)**
   - Show only two options: BizPro or GymPro
   - Remove multi-tier selection within each vertical

4. **Billing page (`Billing.tsx`)**
   - Show simple "Your plan: BizPro — M350/mo" or "GymPro — M700/mo"
   - Remove package switching modal (only 1 tier per vertical)

5. **Landing page pricing (`PricingTable.tsx`)**
   - Two cards: BizPro M350 and GymPro M700

6. **Admin constants**
   - Keep all 8 system labels for display but map workshop/legal/hire/guesthouse/fleet/school → BizPro pricing
