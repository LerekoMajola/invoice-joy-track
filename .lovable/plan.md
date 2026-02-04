

# Platform Admin Dashboard

## Overview
Create a secure Super Admin dashboard that allows platform administrators to view and manage all registered tenants, their subscription status, usage statistics, and system-wide analytics. This provides Orion Labs operators with full visibility into the platform.

---

## Feature Summary

| Feature | Description |
|---------|-------------|
| **Tenant Overview** | View all registered businesses with search and filtering |
| **Subscription Management** | View/modify subscription status and plans for any tenant |
| **Usage Analytics** | Platform-wide usage statistics and trends |
| **Revenue Dashboard** | Track MRR, total subscriptions, churn rate |
| **System Health** | Monitor active users, recent signups, trial conversions |

---

## Security Architecture

### Role-Based Access Control

Following Supabase security best practices, admin roles will be stored in a separate table to prevent privilege escalation:

```text
+------------------+     +------------------+
|   auth.users     |     |   user_roles     |
+------------------+     +------------------+
| id (uuid)        |<--->| user_id (uuid)   |
| email            |     | role (enum)      |
| ...              |     | created_at       |
+------------------+     +------------------+
```

### Security Definer Function

A security definer function will be used to check admin status without recursive RLS issues:

```sql
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### RLS Policies for Admin Access

Admins can view all data across tenants using the has_role function:

```sql
-- Example: Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
```

---

## Database Schema

### 1. App Role Enum

```sql
CREATE TYPE public.app_role AS ENUM ('super_admin', 'support_agent', 'user');
```

### 2. User Roles Table

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- References auth.users(id)
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only super_admins can manage roles
CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### 3. Update Existing Tables with Admin Access

Add admin-read policies to key tables:

```sql
-- Subscriptions: Admin can view all
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update subscriptions"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Company Profiles: Admin can view all
CREATE POLICY "Admins can view all company profiles"
  ON public.company_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Usage Tracking: Admin can view all
CREATE POLICY "Admins can view all usage"
  ON public.usage_tracking FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
```

---

## UI Structure

### Admin Page Layout

```text
/admin
  ├── Overview Tab
  │   ├── Platform Stats Cards (Total Tenants, MRR, Active Trials, etc.)
  │   ├── Signups Over Time Chart
  │   ├── Revenue Trend Chart
  │   └── Recent Activity Feed
  │
  ├── Tenants Tab
  │   ├── Search & Filter Bar
  │   ├── Tenant List Table
  │   │   ├── Company Name
  │   │   ├── Owner Email
  │   │   ├── Plan / Status
  │   │   ├── Usage Stats
  │   │   ├── Created Date
  │   │   └── Actions (View Details, Manage Subscription)
  │   └── Tenant Detail Dialog
  │
  └── Subscriptions Tab
      ├── Filter by Plan/Status
      ├── Subscription Management Table
      └── Bulk Actions (Extend Trial, Change Plan)
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Admin.tsx` | Main admin dashboard page with tabs |
| `src/hooks/useAdminRole.tsx` | Check if current user is admin |
| `src/hooks/useAdminTenants.tsx` | Fetch all tenants for admin view |
| `src/hooks/useAdminStats.tsx` | Platform-wide statistics |
| `src/components/admin/AdminOverviewTab.tsx` | Stats and charts overview |
| `src/components/admin/TenantsTab.tsx` | Tenant list and management |
| `src/components/admin/SubscriptionsTab.tsx` | Subscription management |
| `src/components/admin/TenantDetailDialog.tsx` | View tenant details |
| `src/components/admin/EditSubscriptionDialog.tsx` | Modify tenant subscription |
| `src/components/admin/PlatformStatsCards.tsx` | Summary stat cards |
| `src/components/admin/SignupsChart.tsx` | Signups over time |
| `src/components/admin/RevenueChart.tsx` | MRR trends |
| `src/components/admin/index.ts` | Barrel exports |
| `src/components/layout/AdminProtectedRoute.tsx` | Route guard for admins |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/admin` route with AdminProtectedRoute |
| `src/pages/Auth.tsx` | Redirect admins to /admin after login |

---

## Key Components

### Platform Stats Cards

| Card | Calculation |
|------|-------------|
| Total Tenants | Count of unique user_ids with company_profiles |
| Monthly Recurring Revenue | Sum of active subscription plan values |
| Active Trials | Count of subscriptions with status = 'trialing' |
| Trial Conversion Rate | (Active subscriptions / Total past trials) x 100 |
| Total Invoices | Platform-wide invoice count |
| Active Users (30d) | Users with activity in last 30 days |

### Tenant List Table Columns

| Column | Source |
|--------|--------|
| Company Name | company_profiles.company_name |
| Owner Email | auth.users.email (via user_id) |
| Plan | subscriptions.plan |
| Status | subscriptions.status |
| Trial Ends | subscriptions.trial_ends_at |
| Clients | usage_tracking.clients_count |
| Quotes | usage_tracking.quotes_count |
| Invoices | usage_tracking.invoices_count |
| Joined | company_profiles.created_at |

### Tenant Detail Dialog

```text
+------------------------------------------+
| TENANT DETAILS                           |
+------------------------------------------+
| Company: Acme Corporation                |
| Owner: john@acme.com                     |
| Registered: Jan 15, 2026                 |
+------------------------------------------+
| SUBSCRIPTION                             |
| Plan: Standard (M500/month)              |
| Status: Active                           |
| Current Period: Feb 1 - Mar 1, 2026      |
| [Change Plan] [Extend Period]            |
+------------------------------------------+
| USAGE (Current Period)                   |
| Clients: 45 / 200                        |
| Quotes: 87 / Unlimited                   |
| Invoices: 23 / Unlimited                 |
+------------------------------------------+
| QUICK ACTIONS                            |
| [Reset Usage] [Send Notification]        |
+------------------------------------------+
```

---

## Authentication Flow

### Admin Login Process

```text
1. User logs in via /auth
         ↓
2. After auth success, check user_roles table
         ↓
3. If role = 'super_admin':
   → Redirect to /admin
         ↓
4. If no admin role:
   → Redirect to /dashboard (normal user flow)
```

### Admin Route Protection

```typescript
// AdminProtectedRoute.tsx
function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  
  if (loading || roleLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}
```

---

## Admin Hook Implementation

### useAdminRole Hook

```typescript
export function useAdminRole() {
  const { user } = useAuth();
  
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .maybeSingle();
      
      if (error) return false;
      return !!data;
    },
    enabled: !!user,
  });
  
  return { isAdmin: isAdmin ?? false, isLoading };
}
```

### useAdminTenants Hook

```typescript
export function useAdminTenants() {
  const { isAdmin } = useAdminRole();
  
  return useQuery({
    queryKey: ['admin-tenants'],
    queryFn: async () => {
      // Fetch all company profiles with subscription data
      const { data: profiles } = await supabase
        .from('company_profiles')
        .select(`
          *,
          subscriptions!inner (plan, status, trial_ends_at),
          usage_tracking (clients_count, quotes_count, invoices_count)
        `);
      
      return profiles;
    },
    enabled: isAdmin,
  });
}
```

---

## Admin Statistics

### Platform KPIs

| KPI | Calculation |
|-----|-------------|
| Total Revenue (All Time) | Sum of all paid invoice totals across all tenants |
| Monthly Recurring Revenue | Sum of active plan prices (M300 + M500 + M800) |
| Average Revenue Per User | MRR / Active Subscribers |
| Churn Rate | Cancelled subscriptions / Total subscriptions |
| Trial to Paid Rate | Paid conversions / Total trials started |
| Active Users (DAU) | Unique logins in last 24 hours |
| Active Users (MAU) | Unique logins in last 30 days |

### Data Aggregation

Revenue calculations based on plan pricing:

```typescript
const PLAN_PRICES = {
  free_trial: 0,
  basic: 300,
  standard: 500,
  pro: 800,
};

const calculateMRR = (subscriptions) => {
  return subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + PLAN_PRICES[s.plan], 0);
};
```

---

## Creating the First Admin

To bootstrap the first super admin, manually insert into user_roles after the user registers:

```sql
-- Run this in Cloud View → Run SQL after admin user signs up
INSERT INTO public.user_roles (user_id, role)
VALUES ('admin-user-uuid-here', 'super_admin');
```

Alternatively, you could seed this during the initial migration for a known admin email.

---

## Security Considerations

1. **Separate Role Table**: Roles stored separately from profiles to prevent privilege escalation
2. **Security Definer Function**: Bypasses RLS safely for role checks
3. **Server-Side Validation**: All admin checks happen in database, not client-side
4. **Audit Trail**: Consider adding admin_actions table to log all admin operations
5. **No Hardcoded Credentials**: Admin status determined by database role, not email matching

---

## Summary

| Category | Count |
|----------|-------|
| New database objects | 3 (enum, table, function) |
| New RLS policies | 6+ (admin access to key tables) |
| New pages | 1 (Admin.tsx) |
| New hooks | 3 |
| New components | 10+ |
| Modified files | 2 (App.tsx, Auth.tsx) |
| Charts | 2 (Signups, Revenue) |

This implementation provides a secure, role-based admin dashboard following Supabase security best practices, enabling platform operators to manage all tenants from a single interface.

