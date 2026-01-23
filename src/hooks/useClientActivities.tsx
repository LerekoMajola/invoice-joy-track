import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ClientActivity {
  id: string;
  client_id: string;
  user_id: string;
  activity_type: string;
  content: string;
  created_at: string;
}

export interface ClientActivityInsert {
  client_id: string;
  activity_type: string;
  content: string;
}

export const CLIENT_ACTIVITY_TYPES = [
  { value: 'note', label: 'Note', icon: 'FileText' },
  { value: 'call', label: 'Call', icon: 'Phone' },
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'meeting', label: 'Meeting', icon: 'Users' },
  { value: 'invoice_sent', label: 'Invoice Sent', icon: 'Receipt' },
  { value: 'quote_sent', label: 'Quote Sent', icon: 'FileText' },
  { value: 'payment_received', label: 'Payment Received', icon: 'DollarSign' },
  { value: 'follow_up', label: 'Follow-up', icon: 'Clock' },
] as const;

export function useClientActivities(clientId?: string) {
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchActivities = async () => {
    if (!user || !clientId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('client_activities')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching activities',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user, clientId]);

  const createActivity = async (activity: ClientActivityInsert) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('client_activities')
        .insert({
          ...activity,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [data, ...prev]);

      // Update client's last_activity_at
      await supabase
        .from('clients')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', activity.client_id);

      toast({
        title: 'Activity logged',
        description: 'Activity has been recorded.',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error logging activity',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('client_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setActivities(prev => prev.filter(a => a.id !== id));
      toast({
        title: 'Activity deleted',
        description: 'Activity has been removed.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error deleting activity',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    activities,
    isLoading,
    createActivity,
    deleteActivity,
    refetch: fetchActivities,
  };
}
