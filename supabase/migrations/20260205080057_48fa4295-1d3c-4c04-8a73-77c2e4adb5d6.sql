-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  reference_id UUID,
  reference_type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view their own notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Service role / triggers can insert notifications
CREATE POLICY "Service role can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for the notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function for invoice status changes
CREATE OR REPLACE FUNCTION public.notify_invoice_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Invoice becomes overdue
  IF NEW.status = 'overdue' AND (OLD.status IS NULL OR OLD.status != 'overdue') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, reference_id, reference_type)
    VALUES (
      NEW.user_id,
      'invoice',
      'Invoice Overdue',
      'Invoice ' || NEW.invoice_number || ' for ' || NEW.client_name || ' is now overdue',
      '/invoices',
      NEW.id,
      'invoice'
    );
  END IF;
  
  -- Invoice paid
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, reference_id, reference_type)
    VALUES (
      NEW.user_id,
      'invoice',
      'Payment Received',
      'Invoice ' || NEW.invoice_number || ' has been marked as paid',
      '/invoices',
      NEW.id,
      'invoice'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for invoice status changes
CREATE TRIGGER on_invoice_status_change
AFTER UPDATE ON public.invoices
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.notify_invoice_status_change();

-- Trigger function for quote status changes
CREATE OR REPLACE FUNCTION public.notify_quote_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Quote accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, reference_id, reference_type)
    VALUES (
      NEW.user_id,
      'quote',
      'Quote Accepted',
      'Quote ' || NEW.quote_number || ' for ' || NEW.client_name || ' has been accepted',
      '/quotes',
      NEW.id,
      'quote'
    );
  END IF;
  
  -- Quote expired
  IF NEW.status = 'expired' AND (OLD.status IS NULL OR OLD.status != 'expired') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, reference_id, reference_type)
    VALUES (
      NEW.user_id,
      'quote',
      'Quote Expired',
      'Quote ' || NEW.quote_number || ' for ' || NEW.client_name || ' has expired',
      '/quotes',
      NEW.id,
      'quote'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for quote status changes
CREATE TRIGGER on_quote_status_change
AFTER UPDATE ON public.quotes
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.notify_quote_status_change();

-- Trigger function for lead status changes
CREATE OR REPLACE FUNCTION public.notify_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Lead won
  IF NEW.status = 'won' AND (OLD.status IS NULL OR OLD.status != 'won') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, reference_id, reference_type)
    VALUES (
      NEW.user_id,
      'lead',
      'Deal Won!',
      'Congratulations! Lead ' || NEW.name || COALESCE(' from ' || NEW.company, '') || ' has been won',
      '/crm',
      NEW.id,
      'lead'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for lead status changes
CREATE TRIGGER on_lead_status_change
AFTER UPDATE ON public.leads
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.notify_lead_status_change();