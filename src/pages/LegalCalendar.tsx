import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarDays, Loader2, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { useLegalCalendar, type LegalCalendarEvent } from '@/hooks/useLegalCalendar';
import { useLegalCases } from '@/hooks/useLegalCases';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { differenceInDays, isAfter, startOfToday } from 'date-fns';

const eventTypes = ['hearing', 'deadline', 'meeting', 'filing', 'mediation', 'other'];
const priorities = ['low', 'medium', 'high'];

export default function LegalCalendar() {
  const { user } = useAuth();
  const { events, isLoading, refetch } = useLegalCalendar();
  const { cases } = useLegalCases();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', eventType: 'hearing', eventDate: '', eventTime: '', endTime: '',
    location: '', description: '', priority: 'medium', caseId: '',
  });

  const today = startOfToday();

  const upcomingEvents = useMemo(() =>
    events
      .filter(e => !e.isCompleted && isAfter(new Date(e.eventDate), new Date(Date.now() - 86400000)))
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()),
    [events]
  );

  const pastEvents = useMemo(() =>
    events
      .filter(e => e.isCompleted || !isAfter(new Date(e.eventDate), new Date(Date.now() - 86400000)))
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()),
    [events]
  );

  const caseMap = useMemo(() => {
    const m: Record<string, string> = {};
    cases.forEach(c => { m[c.id] = c.caseNumber; });
    return m;
  }, [cases]);

  const getUrgencyColor = (dateStr: string) => {
    const days = differenceInDays(new Date(dateStr), today);
    if (days <= 2) return 'border-l-destructive bg-destructive/5';
    if (days <= 7) return 'border-l-amber-500 bg-amber-500/5';
    return 'border-l-emerald-500 bg-emerald-500/5';
  };

  const eventTypeStyles: Record<string, string> = {
    hearing: 'bg-destructive/10 text-destructive border-destructive/20',
    deadline: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    meeting: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    filing: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    mediation: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    other: 'bg-muted text-muted-foreground border-border',
  };

  const handleSubmit = async () => {
    if (!user || !form.title || !form.eventDate) {
      toast.error('Title and date are required');
      return;
    }
    const { error } = await supabase.from('legal_calendar_events').insert({
      user_id: user.id,
      title: form.title,
      event_type: form.eventType,
      event_date: form.eventDate,
      event_time: form.eventTime || null,
      end_time: form.endTime || null,
      location: form.location || null,
      description: form.description || null,
      priority: form.priority,
      case_id: form.caseId || null,
    });
    if (error) { toast.error('Failed to create event'); return; }
    toast.success('Event created');
    setAddOpen(false);
    setForm({ title: '', eventType: 'hearing', eventDate: '', eventTime: '', endTime: '', location: '', description: '', priority: 'medium', caseId: '' });
    refetch();
  };

  const toggleComplete = async (event: LegalCalendarEvent) => {
    const { error } = await supabase.from('legal_calendar_events').update({ is_completed: !event.isCompleted }).eq('id', event.id);
    if (error) { toast.error('Failed to update'); return; }
    refetch();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const renderEvent = (event: LegalCalendarEvent) => (
    <Card
      key={event.id}
      className={cn('p-4 border-l-4 transition-all', event.isCompleted ? 'opacity-60 border-l-muted' : getUrgencyColor(event.eventDate))}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn('capitalize text-xs', eventTypeStyles[event.eventType] || eventTypeStyles.other)}>
              {event.eventType}
            </Badge>
            {event.caseId && <span className="text-xs text-muted-foreground">{caseMap[event.caseId]}</span>}
          </div>
          <p className={cn('font-medium text-card-foreground', event.isCompleted && 'line-through')}>{event.title}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(event.eventDate)}</span>
            {event.eventTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.eventTime}</span>}
            {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
          </div>
        </div>
        <Button
          variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8"
          onClick={() => toggleComplete(event)}
        >
          <CheckCircle2 className={cn('h-5 w-5', event.isCompleted ? 'text-emerald-500' : 'text-muted-foreground/40')} />
        </Button>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <Header title="Court Calendar" subtitle="Hearings, deadlines, and events" action={{ label: 'New Event', onClick: () => setAddOpen(true) }} />

      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : events.length === 0 ? (
          <Card className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No events yet</p>
            <p className="text-sm">Add your first court date or deadline</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming</h2>
                <div className="space-y-3">{upcomingEvents.map(renderEvent)}</div>
              </div>
            )}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Past / Completed</h2>
                <div className="space-y-3">{pastEvents.map(renderEvent)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Event Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Hearing / Deadline title" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.eventType} onValueChange={(v) => setForm(f => ({ ...f, eventType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{eventTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{priorities.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Date *</Label><Input type="date" value={form.eventDate} onChange={(e) => setForm(f => ({ ...f, eventDate: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Time</Label><Input type="time" value={form.eventTime} onChange={(e) => setForm(f => ({ ...f, eventTime: e.target.value }))} /></div>
              <div><Label>End Time</Label><Input type="time" value={form.endTime} onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
            </div>
            <div>
              <Label>Case</Label>
              <Select value={form.caseId} onValueChange={(v) => setForm(f => ({ ...f, caseId: v }))}>
                <SelectTrigger><SelectValue placeholder="Link to case (optional)" /></SelectTrigger>
                <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.caseNumber} - {c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Court / Office" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
