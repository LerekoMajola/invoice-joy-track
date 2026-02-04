
# Staff Management Feature

## Overview
Add a Staff page where tenants can manage their team members. This includes inviting staff, assigning roles, viewing status, and managing permissions. The implementation follows security best practices with roles stored in a separate table to prevent privilege escalation.

---

## Architecture

### Multi-Tenant Staff Model
Staff members belong to a **tenant** (the business owner), not individual users. Each tenant (identified by `owner_user_id`) can have multiple staff members who can access the tenant's data based on their role.

```text
+------------------+          +------------------+          +------------------+
|  auth.users      |          |  staff_members   |          |  staff_roles     |
+------------------+          +------------------+          +------------------+
| id (uuid)        |<---------| user_id (fk)     |          | id (uuid)        |
| email            |          | owner_user_id    |--------->| staff_member_id  |
|                  |          | name             |          | role (enum)      |
+------------------+          | email            |          +------------------+
                              | phone            |
                              | job_title        |
                              | status           |
                              | invited_at       |
                              | joined_at        |
                              +------------------+
```

---

## Database Design

### 1. Create Role Enum
```sql
CREATE TYPE public.staff_role AS ENUM ('admin', 'manager', 'staff', 'viewer');
```

### 2. Staff Members Table
```sql
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,  -- The tenant who owns this staff
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- Linked when they accept invite
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'invited',  -- invited, active, inactive
  notes TEXT,
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(owner_user_id, email)  -- Prevent duplicate staff per tenant
);
```

### 3. Staff Roles Table (Security Best Practice)
```sql
CREATE TABLE public.staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  role staff_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_member_id, role)  -- One role per staff member (or allow multiple)
);
```

### 4. Security Definer Function (Prevent RLS Recursion)
```sql
CREATE OR REPLACE FUNCTION public.get_staff_role(p_user_id UUID, p_owner_user_id UUID)
RETURNS staff_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sr.role
  FROM staff_roles sr
  JOIN staff_members sm ON sr.staff_member_id = sm.id
  WHERE sm.user_id = p_user_id
    AND sm.owner_user_id = p_owner_user_id
  LIMIT 1
$$;
```

### 5. RLS Policies
```sql
-- Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;

-- Staff members: Owner can manage their staff
CREATE POLICY "Owners can manage their staff"
  ON public.staff_members FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Staff members: Staff can view their own record
CREATE POLICY "Staff can view their own record"
  ON public.staff_members FOR SELECT
  USING (auth.uid() = user_id);

-- Staff roles: Owner can manage roles
CREATE POLICY "Owners can manage staff roles"
  ON public.staff_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_members sm
      WHERE sm.id = staff_roles.staff_member_id
        AND sm.owner_user_id = auth.uid()
    )
  );
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Staff.tsx` | Main Staff page with list and management |
| `src/components/staff/StaffTab.tsx` | Staff list component with table/cards |
| `src/components/staff/AddStaffDialog.tsx` | Dialog to add new staff member |
| `src/components/staff/StaffDetailDialog.tsx` | View/edit staff details |
| `src/components/staff/index.ts` | Export barrel file |
| `src/hooks/useStaff.tsx` | Hook for CRUD operations |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/staff` route |
| `src/components/layout/Sidebar.tsx` | Add Staff nav item with `UserPlus` icon |

---

## Component Structure

### Staff Page (`src/pages/Staff.tsx`)
- Uses `DashboardLayout` wrapper
- Header with title and "Add Staff" button
- Search and filter controls
- Stats cards (Total, Active, Invited, By Role)
- Responsive table (desktop) / cards (mobile)

### AddStaffDialog
Form fields:
- Name (required)
- Email (required, validated)
- Phone
- Job Title
- Department (select: Operations, Sales, Finance, Admin, Other)
- Role (select: Admin, Manager, Staff, Viewer)
- Notes

### StaffDetailDialog
- View mode by default
- Edit mode toggle
- Activity history (future enhancement)
- Status management (Activate/Deactivate)

---

## Staff Hook API (`useStaff.tsx`)

```typescript
interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  status: 'invited' | 'active' | 'inactive';
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  notes: string | null;
  invitedAt: string;
  joinedAt: string | null;
}

// Hook returns
{
  staff: StaffMember[];
  isLoading: boolean;
  createStaff: (data) => Promise<StaffMember | null>;
  updateStaff: (id, data) => Promise<boolean>;
  deleteStaff: (id) => Promise<boolean>;
  refetch: () => void;
}
```

---

## Status Flow

```text
[Add Staff] --> [Invited] --> (Accepts Invite) --> [Active]
                                    |
                              [Deactivate] --> [Inactive] --> [Reactivate] --> [Active]
```

---

## UI Components

### Desktop Table Columns
| Column | Description |
|--------|-------------|
| Staff Member | Avatar + Name + Email |
| Job Title | Position in company |
| Department | Team/department |
| Role | Badge with color |
| Status | Badge (invited/active/inactive) |
| Actions | Dropdown menu |

### Status Badges
- **Invited**: Yellow/amber
- **Active**: Green
- **Inactive**: Gray

### Role Badges
- **Admin**: Red (full access)
- **Manager**: Blue (can manage team data)
- **Staff**: Green (can create/edit)
- **Viewer**: Gray (read-only)

---

## Validation (Zod Schema)

```typescript
const staffSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().max(20).optional(),
  jobTitle: z.string().max(100).optional(),
  department: z.string().optional(),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']),
  notes: z.string().max(500).optional(),
});
```

---

## Security Considerations

1. **Roles in Separate Table**: Prevents privilege escalation by keeping roles isolated
2. **Security Definer Function**: Avoids RLS recursion when checking permissions
3. **Server-Side Validation**: All mutations validated via RLS policies
4. **Email Uniqueness per Tenant**: Prevents duplicate staff entries
5. **Soft Delete via Status**: Staff can be deactivated rather than deleted
6. **Input Validation**: Zod schemas for client-side validation

---

## Summary

| Category | Count |
|----------|-------|
| New database tables | 2 (staff_members, staff_roles) |
| New enum type | 1 (staff_role) |
| New pages | 1 (Staff.tsx) |
| New components | 4 |
| New hooks | 1 |
| Modified files | 2 (App.tsx, Sidebar.tsx) |
| RLS policies | 3 |
| Database function | 1 |

This implementation provides a complete staff management system following the existing patterns in the codebase while adhering to security best practices for role management.
