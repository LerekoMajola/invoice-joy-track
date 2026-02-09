ALTER TABLE public.tasks
  ADD COLUMN assigned_to uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  ADD COLUMN assigned_to_name text;