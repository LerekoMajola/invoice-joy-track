
-- Drop the old function first (it returns staff_role enum)
DROP FUNCTION IF EXISTS public.get_staff_role(uuid, uuid);

-- Change staff_roles.role from enum to text
ALTER TABLE public.staff_roles ALTER COLUMN role TYPE TEXT USING role::TEXT;

-- Recreate the function returning TEXT
CREATE OR REPLACE FUNCTION public.get_staff_role(p_user_id uuid, p_owner_user_id uuid)
 RETURNS TEXT
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT sr.role
  FROM staff_roles sr
  JOIN staff_members sm ON sr.staff_member_id = sm.id
  WHERE sm.user_id = p_user_id
    AND sm.owner_user_id = p_owner_user_id
  LIMIT 1
$function$;

-- Drop the old enum type
DROP TYPE IF EXISTS public.staff_role;
