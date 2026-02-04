-- Create role enum
CREATE TYPE public.staff_role AS ENUM ('admin', 'manager', 'staff', 'viewer');

-- Create staff_members table
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'invited',
  notes TEXT,
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(owner_user_id, email)
);

-- Create staff_roles table
CREATE TABLE public.staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  role staff_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_member_id, role)
);

-- Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to get staff role (prevents RLS recursion)
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

-- RLS Policies for staff_members
CREATE POLICY "Owners can manage their staff"
  ON public.staff_members FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Staff can view their own record"
  ON public.staff_members FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for staff_roles
CREATE POLICY "Owners can manage staff roles"
  ON public.staff_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_members sm
      WHERE sm.id = staff_roles.staff_member_id
        AND sm.owner_user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON public.staff_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();