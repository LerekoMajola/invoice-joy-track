import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface LegalCalendarEvent {
  id: string;
  caseId: string | null;
  title: string;
  eventType: string;
  eventDate: string;
  eventTime: string | null;
  endTime: string | null;
  location: string | null;
  description: string | null;
  priority: string;
  isCompleted: boolean;
  reminderDate: string | null;
  createdAt: string;
}

export function useLegalCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<LegalCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    if (!user) { setEvents([]); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('legal_calendar_events')
        .select('*')
        .order('event_date', { ascending: true });
      if (error) throw error;
      setEvents((data || []).map(e => ({
        id: e.id,
        caseId: e.case_id,
        title: e.title,
        eventType: e.event_type,
        eventDate: e.event_date,
        eventTime: e.event_time,
        endTime: e.end_time,
        location: e.location,
        description: e.description,
        priority: e.priority || 'medium',
        isCompleted: e.is_completed ?? false,
        reminderDate: e.reminder_date,
        createdAt: e.created_at,
      })));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [user]);

  return { events, isLoading, refetch: fetchEvents };
}
