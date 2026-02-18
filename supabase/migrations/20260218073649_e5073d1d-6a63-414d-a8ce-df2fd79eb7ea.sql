
-- ============================================
-- GYM MEMBERSHIP PLANS
-- ============================================
CREATE TABLE public.gym_membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_profile_id uuid REFERENCES public.company_profiles(id),
  name text NOT NULL,
  description text,
  duration_days integer NOT NULL DEFAULT 30,
  price numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'monthly',
  max_freezes integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage gym_membership_plans" ON public.gym_membership_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view gym_membership_plans" ON public.gym_membership_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.owner_user_id = gym_membership_plans.user_id
    )
  );

CREATE TRIGGER update_gym_membership_plans_updated_at
  BEFORE UPDATE ON public.gym_membership_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- GYM MEMBERS
-- ============================================
CREATE TABLE public.gym_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_profile_id uuid REFERENCES public.company_profiles(id),
  member_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  health_conditions text,
  photo_url text,
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'prospect',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage gym_members" ON public.gym_members
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view gym_members" ON public.gym_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.owner_user_id = gym_members.user_id
    )
  );

CREATE TRIGGER update_gym_members_updated_at
  BEFORE UPDATE ON public.gym_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- GYM MEMBER SUBSCRIPTIONS
-- ============================================
CREATE TABLE public.gym_member_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_profile_id uuid REFERENCES public.company_profiles(id),
  member_id uuid NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.gym_membership_plans(id),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  freeze_start date,
  freeze_end date,
  freezes_used integer NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  amount_paid numeric NOT NULL DEFAULT 0,
  auto_renew boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_member_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage gym_member_subscriptions" ON public.gym_member_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view gym_member_subscriptions" ON public.gym_member_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.owner_user_id = gym_member_subscriptions.user_id
    )
  );

CREATE TRIGGER update_gym_member_subscriptions_updated_at
  BEFORE UPDATE ON public.gym_member_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
