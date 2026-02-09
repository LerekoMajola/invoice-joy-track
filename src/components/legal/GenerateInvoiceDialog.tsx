import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMaluti } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { type LegalTimeEntry } from '@/hooks/useLegalTimeEntries';
import { type LegalCase } from '@/hooks/useLegalCases';
import { useClients } from '@/hooks/useClients';

interface Props {
  entries: LegalTimeEntry[];
  cases: LegalCase[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: () => void;
}

export function GenerateInvoiceDialog({ entries, cases, open, onOpenChange, onGenerated }: Props) {
  const { user } = useAuth();
  const { clients } = useClients();
  const unbilledEntries = useMemo(() => entries.filter(e => e.isBillable && !e.isInvoiced), [entries]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const toggleEntry = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === unbilledEntries.length) setSelected(new Set());
    else setSelected(new Set(unbilledEntries.map(e => e.id)));
  };

  const selectedEntries = unbilledEntries.filter(e => selected.has(e.id));
  const total = selectedEntries.reduce((s, e) => s + e.hours * e.hourlyRate, 0);

  const caseMap = useMemo(() => {
    const m: Record<string, LegalCase> = {};
    cases.forEach(c => { m[c.id] = c; });
    return m;
  }, [cases]);

  const handleGenerate = async () => {
    if (!user || selectedEntries.length === 0) return;

    // Determine client from the first entry's case
    const firstCase = caseMap[selectedEntries[0].caseId];
    const client = firstCase?.clientId ? clients.find(c => c.id === firstCase.clientId) : null;

    // Generate invoice number
    const { data: lastInv } = await supabase.from('invoices').select('invoice_number').order('created_at', { ascending: false }).limit(1);
    let lastNum = 0;
    if (lastInv?.[0]) { const m = lastInv[0].invoice_number.match(/INV-(\d+)/); if (m) lastNum = parseInt(m[1], 10); }
    const invNumber = `INV-${String(lastNum + 1).padStart(4, '0')}`;

    const lineItems = selectedEntries.map(e => ({
      description: `${(e.activityType || 'Service').replace('_', ' ')} - ${e.description}`,
      quantity: e.hours,
      unit_price: e.hourlyRate,
      cost_price: 0,
    }));

    const { data: inv, error: invErr } = await supabase.from('invoices').insert({
      user_id: user.id,
      invoice_number: invNumber,
      client_id: client?.id || null,
      client_name: client?.company || firstCase?.title || 'Legal Services',
      date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      total,
      tax_rate: 0,
      status: 'draft',
      description: `Legal services - ${selectedEntries.length} time entries`,
    }).select().single();

    if (invErr) { toast.error('Failed to create invoice'); return; }

    // Insert line items
    await supabase.from('invoice_line_items').insert(lineItems.map(li => ({ ...li, invoice_id: inv.id })));

    // Mark time entries as invoiced
    await supabase.from('legal_time_entries').update({ is_invoiced: true, invoice_id: inv.id })
      .in('id', selectedEntries.map(e => e.id));

    toast.success(`Invoice ${invNumber} created`);
    setSelected(new Set());
    onOpenChange(false);
    onGenerated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Generate Invoice from Time Entries</DialogTitle></DialogHeader>
        {unbilledEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No unbilled time entries available.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={selected.size === unbilledEntries.length} onCheckedChange={selectAll} />
                <span className="text-sm text-muted-foreground">Select all ({unbilledEntries.length})</span>
              </div>
              <span className="text-sm font-semibold">Total: {formatMaluti(total)}</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {unbilledEntries.map(e => {
                const c = caseMap[e.caseId];
                return (
                  <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                    <Checkbox checked={selected.has(e.id)} onCheckedChange={() => toggleEntry(e.id)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{e.description}</p>
                      <p className="text-xs text-muted-foreground">{c?.caseNumber || 'Unknown'} • {e.hours}h × {formatMaluti(e.hourlyRate)}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatMaluti(e.hours * e.hourlyRate)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={selectedEntries.length === 0}>Generate Invoice ({selectedEntries.length})</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
