

## Admin Overview Redesign + Fix Staff Showing as Customers

### Problem 1: Staff appearing as customers
When a tenant creates staff accounts (workers), those accounts show up in your admin Customers tab as "Not Onboarded" users. These are not your platform customers -- they're employees under a tenant. The `admin-get-signups` function pulls every user from the auth system without checking if they're staff members.

**Fix**: Update the `admin-get-signups` edge function to query the `staff_members` table and exclude any user IDs that appear there. This filters out tenant workers so only real platform customers (tenants and prospects) appear.

### Problem 2: Overview page looks flat and basic
The current overview uses plain white cards with small grey icons and no colour variation. The charts are single-colour with no visual punch.

**Redesign**:

**Stats Cards** -- Each of the 4 top-level stats gets a unique gradient background and a large coloured icon circle:
- Total Tenants: indigo-to-violet gradient with a white Building icon
- Monthly Revenue: emerald-to-teal gradient with a white DollarSign icon
- Active Trials: amber-to-orange gradient with a white Clock icon
- Platform Revenue: rose-to-pink gradient with a white TrendingUp icon
- White text on gradient backgrounds for contrast
- Subtle shadow and rounded corners

**System Breakdown Cards** -- Each system type gets its own branded gradient background matching the system colour (blue for Business, orange for Workshop, emerald for School, etc.) with white text and badges that stand out against the coloured background.

**Charts** -- Add gradient fills to both charts:
- Signups chart: gradient bars transitioning from indigo to violet
- Revenue chart: gradient area fill from emerald to teal
- Both get slightly rounded card borders and subtle shadows

**Welcome Banner** -- Add a full-width gradient banner at the top with a greeting and quick summary line ("You have X tenants generating M revenue").

### Technical Details

**Files to modify:**

1. **`supabase/functions/admin-get-signups/index.ts`**
   - After fetching auth users, also query `staff_members` to get all `user_id` values
   - Filter the signups list to exclude any user whose ID appears in the staff_members table
   - This ensures only actual platform customers appear in the Customers tab

2. **`src/components/admin/PlatformStatsCards.tsx`**
   - Replace plain Card components with gradient-styled cards
   - Each card gets a unique gradient background (e.g., `bg-gradient-to-br from-indigo-500 to-violet-600`)
   - Icon gets a semi-transparent white circle background
   - Text becomes white for contrast
   - Add hover scale effect

3. **`src/components/admin/AdminOverviewTab.tsx`**
   - Add a welcome/summary banner at the top with gradient background
   - Update SystemBreakdownCards to use coloured gradient backgrounds per system type
   - Badges inside system cards use semi-transparent white styling for contrast
   - Empty system cards stay muted but with a subtle coloured border

4. **`src/components/admin/SignupsChart.tsx`**
   - Add gradient fill to bars (indigo to violet)
   - Use `linearGradient` defs in the SVG

5. **`src/components/admin/RevenueChart.tsx`**
   - Update gradient colours to emerald-to-teal for visual variety
   - Increase gradient opacity for more presence
