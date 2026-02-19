import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProspectStatus, ProspectPriority, AdminProspect } from '@/hooks/useAdminProspects';

interface AddProspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: ProspectStatus;
  createProspect: (data: Omit<AdminProspect, 'id' | 'created_at' | 'updated_at'>) => Promise<AdminProspect | null>;
}

export function AddProspectDialog({ open, onOpenChange, defaultStatus = 'lead', createProspect }: AddProspectDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    status: defaultStatus as ProspectStatus,
    priority: 'medium' as ProspectPriority,
    estimated_value: '',
    expected_close_date: '',
    interested_plan: '',
    interested_system: '',
    source: '',
    notes: '',
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_name) return;
    setSaving(true);
    const winProb: Record<ProspectStatus, number> = {
      lead: 5, contacted: 15, demo: 35, proposal: 55, negotiation: 75, won: 100, lost: 0,
    };
    await createProspect({
      company_name: form.company_name,
      contact_name: form.contact_name,
      email: form.email || null,
      phone: form.phone || null,
      status: form.status,
      priority: form.priority,
      estimated_value: parseFloat(form.estimated_value) || 0,
      expected_close_date: form.expected_close_date || null,
      win_probability: winProb[form.status],
      source: form.source || null,
      notes: form.notes || null,
      next_follow_up: null,
      stage_entered_at: null,
      loss_reason: null,
      interested_plan: form.interested_plan || null,
      interested_system: form.interested_system || null,
    });
    setSaving(false);
    onOpenChange(false);
    setForm({ company_name: '', contact_name: '', email: '', phone: '', status: defaultStatus, priority: 'medium', estimated_value: '', expected_close_date: '', interested_plan: '', interested_system: '', source: '', notes: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Prospect</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Company Name *</Label>
              <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Acme Corp" required />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Name *</Label>
              <Input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Jane Smith" required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@acme.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 0123" />
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="demo">Demo Booked</SelectItem>
                  <SelectItem value="proposal">Proposal Sent</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => set('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estimated Value</Label>
              <Input type="number" value={form.estimated_value} onChange={e => set('estimated_value', e.target.value)} placeholder="5000" />
            </div>
            <div className="space-y-1.5">
              <Label>Expected Close Date</Label>
              <Input type="date" value={form.expected_close_date} onChange={e => set('expected_close_date', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Interested Plan</Label>
              <Input value={form.interested_plan} onChange={e => set('interested_plan', e.target.value)} placeholder="Professional" />
            </div>
            <div className="space-y-1.5">
              <Label>System / Module</Label>
              <Input value={form.interested_system} onChange={e => set('interested_system', e.target.value)} placeholder="CRM + Invoicing" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Source</Label>
              <Input value={form.source} onChange={e => set('source', e.target.value)} placeholder="LinkedIn, Referral, Website…" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Initial notes about this prospect…" rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add Prospect'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
