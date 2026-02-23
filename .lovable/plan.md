

## Build Package Switch Request Approval Workflow

Currently, when a client requests a package change, it only creates a plain notification with no actionable buttons. There is no way for you as admin to approve or reject it from the admin panel. This plan adds a proper request queue with Approve/Reject actions.

### What You'll Get

1. **A new "Requests" tab on the Admin page** (or a section within the Billing tab) showing all pending package switch requests
2. Each request will show: company name, current package, requested package, date submitted, and Approve / Reject buttons
3. Approving will automatically update the tenant's subscription to the new package tier
4. The client will receive a notification confirming the outcome

### How It Works

**New database table: `package_change_requests`**
- Stores each request with: tenant user ID, current tier, requested tier, status (pending/approved/rejected), timestamps
- The client's Billing page will insert into this table instead of just creating a notification
- The admin panel reads from this table to show the queue

**Admin Panel Changes**
- New section (either a "Requests" badge on the Billing tab or a standalone area) listing pending requests
- Each card shows the company name, current vs requested tier with pricing, and Approve/Reject buttons
- Approve updates the subscription's `package_tier_id` and `plan` fields and notifies the client
- Reject sends a notification back to the client

**Client Billing Page Changes**
- Instead of only inserting a notification, also inserts a row into `package_change_requests`
- Shows the pending request status so clients don't submit duplicates

### Technical Details

| Change | Description |
|--------|------------|
| New migration | Create `package_change_requests` table with columns: id, user_id, company_name, current_tier_id, requested_tier_id, status (pending/approved/rejected), admin_note, created_at, updated_at. Add RLS policies. |
| `src/pages/Billing.tsx` | Update `handleSwitchRequest` to insert into `package_change_requests` table (and still send a notification). Show pending request status. |
| `src/hooks/usePackageChangeRequests.tsx` | New hook to fetch/manage package change requests |
| `src/components/admin/PackageChangeRequests.tsx` | New component: list of pending requests with Approve/Reject actions |
| `src/pages/Admin.tsx` | Add the requests section (badge count on Billing tab or inline in Customers tab) |

