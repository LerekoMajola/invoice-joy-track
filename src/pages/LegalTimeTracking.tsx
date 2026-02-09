import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { Timer, Loader2, Clock, DollarSign, FileText } from 'lucide-react';
import { useLegalTimeEntries, type LegalTimeEntry } from '@/hooks/useLegalTimeEntries';
import { useLegalCases } from '@/hooks/useLegalCases';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const activityTypes = ['consultation', 'research', 'drafting', 'court_appearance', 'negotiation', 'review', 'meeting', 'travel', 'other'];

export default function LegalTimeTracking() {
  const { user } = useAuth();
  const { entries, isLoading, refetch } = useLegalTimeEntries();
  const { cases } = useLegalCases();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    caseId: '', date: new Date().toISOString().split('T')[0], hours: '', hourlyRate: '',
    description: '', activityType: 'consultation', isBillable: true,
  });

  const stats = useMemo(() => {
    const totalHours = entries.reduce((s, e) => s + e.hours, 0);
    const billableHours = entries.filter(e => e.isBillable && !e.isInvoiced).reduce((s, e) => s + e.hours, 0);
    const unbilledValue = entries.filter(e => e.isBillable && !e.isInvoiced).reduce((s, e) => s + e.hours * e.hourlyRate, 0);
    const invoicedValue = entries.filter(e => e.isInvoiced).reduce((s, e) => s + e.hours * e.hourlyRate, 0);
    return { totalHours, billableHours, unbilledValue, invoicedValue };
  }, [entries]);

  const caseMap = useMemo(() => {
    const m: Record<string, string> = {};
    cases.forEach(c => { m[c.id] = `${c.caseNumber} - ${c.title}`; });
    return m;
  }, [cases]);

  const handleSubmit = async () => {
    if (!user || !form.caseId || !form.hours || !form.description) {
      toast.error('Case, hours, and description are required');
      return;
    }
    const { error } = await supabase.from('legal_time_entries').insert({
      user_id: user.id,
      case_id: form.caseId,
      date: form.date,
      hours: parseFloat(form.hours),
      hourly_rate: parseFloat(form.hourlyRate) || 0,
      description: form.description,
      activity_type: form.activityType,
      is_billable: form.isBillable,
    });
    if (error) { toast.error('Failed to log time'); return; }
    toast.success('Time entry logged');
    setAddOpen(false);
    setForm({ caseId: '', date: new Date().toISOString().split('T')[0], hours: '', hourlyRate: '', description: '', activityType: 'consultation', isBillable: true });
    refetch();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <DashboardLayout>
      <Header title="Time Tracking" subtitle="Log and manage billable hours" action={{ label: 'Log Time', onClick: () => setAddOpen(true) }} />

      <div className="p-4 md:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Hours', value: stats.totalHours.toFixed(1), icon: Clock, color: 'text-primary' },
            { label: 'Unbilled Hours', value: stats.billableHours.toFixed(1), icon: Timer, color: 'text-amber-600' },
            { label: 'Unbilled Value', value: formatMaluti(stats.unbilledValue), icon: DollarSign, color: 'text-emerald-600' },
            { label: 'Invoiced', value: formatMaluti(stats.invoicedValue), icon: FileText, color: 'text-blue-600' },
          ].map((s) => (
            <Card key={s.label} className="p-3 md:p-4">
              <div className="flex items-center gap-2">
                <s.icon className={cn('h-4 w-4', s.color)} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className={cn('text-lg md:text-2xl font-display font-semibold mt-1', s.color)}>{s.value}</p>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : entries.length === 0 ? (
          <Card className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Timer className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No time entries yet</p>
            <p className="text-sm">Log your first time entry to get started</p>
          </Card>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {entries.map((e) => (
                <Card key={e.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-card-foreground truncate">{caseMap[e.caseId] || 'Unknown Case'}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{e.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-semibold">{e.hours}h</p>
                      <p className="text-xs text-muted-foreground">{formatMaluti(e.hours * e.hourlyRate)}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(e.date)}</span>
                    <span className="capitalize">• {(e.activityType || '').replace('_', ' ')}</span>
                    {e.isBillable && !e.isInvoiced && <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">Unbilled</Badge>}
                    {e.isInvoiced && <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Invoiced</Badge>}
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Case</TableHead>
                    <TableHead className="font-semibold">Activity</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold text-right">Hours</TableHead>
                    <TableHead className="font-semibold text-right">Rate</TableHead>
                    <TableHead className="font-semibold text-right">Value</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow key={e.id} className="hover:bg-muted/50">
                      <TableCell className="text-muted-foreground">{formatDate(e.date)}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{caseMap[e.caseId] || '-'}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">{(e.activityType || '').replace('_', ' ')}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{e.description}</TableCell>
                      <TableCell className="text-right font-medium">{e.hours}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatMaluti(e.hourlyRate)}</TableCell>
                      <TableCell className="text-right font-medium">{formatMaluti(e.hours * e.hourlyRate)}</TableCell>
                      <TableCell>
                        {e.isInvoiced ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Invoiced</Badge>
                        ) : e.isBillable ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Unbilled</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">Non-billable</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Add Time Entry Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Log Time</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Case *</Label>
              <Select value={form.caseId} onValueChange={(v) => setForm(f => ({ ...f, caseId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.caseNumber} - {c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div>
                <Label>Activity</Label>
                <Select value={form.activityType} onValueChange={(v) => setForm(f => ({ ...f, activityType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{activityTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Hours *</Label><Input type="number" step="0.25" value={form.hours} onChange={(e) => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="1.5" /></div>
              <div><Label>Hourly Rate</Label><Input type="number" value={form.hourlyRate} onChange={(e) => setForm(f => ({ ...f, hourlyRate: e.target.value }))} placeholder="500" /></div>
            </div>
            <div><Label>Description *</Label><Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Work performed..." /></div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.isBillable} onCheckedChange={(v) => setForm(f => ({ ...f, isBillable: !!v }))} id="billable" />
              <Label htmlFor="billable" className="text-sm">Billable</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Log Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
