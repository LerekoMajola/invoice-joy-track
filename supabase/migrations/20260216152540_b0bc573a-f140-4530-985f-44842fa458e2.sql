
-- Part 1: Add currency to company_profiles
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'LSL';

-- Part 2: Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active_company_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Part 3: Add company_profile_id to all major data tables
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.expense_categories ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.delivery_notes ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.job_cards ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.equipment_items ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.hire_orders ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.fleet_vehicles ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.fleet_drivers ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.legal_cases ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.accounting_transactions ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.recurring_documents ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.school_classes ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.academic_terms ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.tender_source_links ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL;

-- Part 4: Backfill company_profile_id from each table's user_id
UPDATE public.clients SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = clients.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.invoices SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = invoices.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.quotes SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = quotes.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.expenses SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = expenses.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.expense_categories SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = expense_categories.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.leads SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = leads.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.tasks SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = tasks.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.staff_members SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = staff_members.owner_user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.delivery_notes SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = delivery_notes.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.job_cards SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = job_cards.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.equipment_items SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = equipment_items.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.hire_orders SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = hire_orders.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.bookings SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = bookings.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.rooms SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = rooms.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.fleet_vehicles SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = fleet_vehicles.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.fleet_drivers SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = fleet_drivers.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.students SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = students.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.legal_cases SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = legal_cases.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.accounting_transactions SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = accounting_transactions.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.bank_accounts SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = bank_accounts.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.contacts SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = contacts.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.recurring_documents SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = recurring_documents.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.school_classes SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = school_classes.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.academic_terms SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = academic_terms.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.tender_source_links SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = tender_source_links.user_id LIMIT 1) WHERE company_profile_id IS NULL;
UPDATE public.notifications SET company_profile_id = (SELECT id FROM public.company_profiles WHERE user_id = notifications.user_id LIMIT 1) WHERE company_profile_id IS NULL;

-- Part 5: Backfill user_preferences for existing users who have a company profile
INSERT INTO public.user_preferences (user_id, active_company_id)
SELECT DISTINCT cp.user_id, cp.id
FROM public.company_profiles cp
WHERE NOT EXISTS (SELECT 1 FROM public.user_preferences up WHERE up.user_id = cp.user_id)
ON CONFLICT (user_id) DO NOTHING;

-- Part 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_company_profile ON public.clients(company_profile_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_profile ON public.invoices(company_profile_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company_profile ON public.quotes(company_profile_id);
CREATE INDEX IF NOT EXISTS idx_expenses_company_profile ON public.expenses(company_profile_id);
CREATE INDEX IF NOT EXISTS idx_leads_company_profile ON public.leads(company_profile_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_profile ON public.tasks(company_profile_id);
CREATE INDEX IF NOT EXISTS idx_legal_cases_company_profile ON public.legal_cases(company_profile_id);
