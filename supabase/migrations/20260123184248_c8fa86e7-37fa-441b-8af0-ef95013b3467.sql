-- Create contacts table for multi-contact support
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  email text,
  phone text,
  is_primary boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT contact_must_belong_to_one CHECK (
    (client_id IS NOT NULL AND lead_id IS NULL) OR 
    (client_id IS NULL AND lead_id IS NOT NULL)
  )
);

-- Create client_activities table for client interaction history
CREATE TABLE public.client_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enhance clients table with CRM fields
ALTER TABLE public.clients 
ADD COLUMN source text,
ADD COLUMN source_lead_id uuid REFERENCES public.leads(id),
ADD COLUMN total_revenue numeric DEFAULT 0,
ADD COLUMN last_activity_at timestamptz,
ADD COLUMN status text DEFAULT 'active';

-- Enable RLS on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contacts"
ON public.contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
ON public.contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
ON public.contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
ON public.contacts FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on client_activities
ALTER TABLE public.client_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their client activities"
ON public.client_activities FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clients 
  WHERE clients.id = client_activities.client_id 
  AND clients.user_id = auth.uid()
));

CREATE POLICY "Users can create their client activities"
ON public.client_activities FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM clients 
  WHERE clients.id = client_activities.client_id 
  AND clients.user_id = auth.uid()
));

CREATE POLICY "Users can update their client activities"
ON public.client_activities FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM clients 
  WHERE clients.id = client_activities.client_id 
  AND clients.user_id = auth.uid()
));

CREATE POLICY "Users can delete their client activities"
ON public.client_activities FOR DELETE
USING (EXISTS (
  SELECT 1 FROM clients 
  WHERE clients.id = client_activities.client_id 
  AND clients.user_id = auth.uid()
));

-- Create trigger for contacts updated_at
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();