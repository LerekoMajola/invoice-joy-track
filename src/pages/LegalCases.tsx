import { useState } from 'react';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Scale, Search, Loader2, Calendar } from 'lucide-react';
import { useLegalCases, type LegalCase } from '@/hooks/useLegalCases';
import { useClients } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CaseDetailDialog } from '@/components/legal/CaseDetailDialog';
import { ConflictCheckAlert } from '@/components/legal/ConflictCheckAlert';

const statusStyles: Record<string, string> = {
  open: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  on_hold: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

const statusLabels: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', on_hold: 'On Hold', closed: 'Closed',
};

const caseTypes = ['civil', 'criminal', 'family', 'corporate', 'labour', 'property', 'other'];
const priorities = ['low', 'medium', 'high'];

function generateNextCaseNumber(cases: LegalCase[]): string {
  let max = 0;
  for (const c of cases) {
    const match = c.caseNumber.match(/(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `CASE-${String(max + 1).padStart(4, '0')}`;
}

export default function LegalCases() {
  const { user } = useAuth();
  const { cases, isLoading, refetch } = useLegalCases();
  const { clients } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const openAddDialog = () => {
    setForm(f => ({ ...f, caseNumber: generateNextCaseNumber(cases) }));
    setAddOpen(true);
  };
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState({
    caseNumber: '', title: '', caseType: 'civil', status: 'open', priority: 'medium',
    clientId: '', courtName: '', courtCaseNumber: '', opposingParty: '', opposingCounsel: '',
    judgeName: '', assignedLawyer: '', filingDate: '', description: '',
  });

  const filtered = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.caseNumber.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) ||
      (c.assignedLawyer || '').toLowerCase().includes(q);
  });

  const handleSubmit = async () => {
    if (!user || !form.title) {
      toast.error('Title is required');
      return;
    }
    const { error } = await supabase.from('legal_cases').insert({
      user_id: user.id, case_number: form.caseNumber, title: form.title, case_type: form.caseType,
      status: form.status, priority: form.priority, client_id: form.clientId || null,
      court_name: form.courtName || null, court_case_number: form.courtCaseNumber || null,
      opposing_party: form.opposingParty || null, opposing_counsel: form.opposingCounsel || null,
      judge_name: form.judgeName || null, assigned_lawyer: form.assignedLawyer || null,
      filing_date: form.filingDate || null, description: form.description || null,
    });
    if (error) { toast.error('Failed to create case'); return; }
    toast.success('Case created');
    setAddOpen(false);
    setForm({ caseNumber: '', title: '', caseType: 'civil', status: 'open', priority: 'medium', clientId: '', courtName: '', courtCaseNumber: '', opposingParty: '', opposingCounsel: '', judgeName: '', assignedLawyer: '', filingDate: '', description: '' });
    refetch();
  };

  const openDetail = (c: LegalCase) => { setSelectedCase(c); setDetailOpen(true); };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  return (
    <DashboardLayout>
      <Header title="Cases" subtitle="Manage legal cases and matters" action={{ label: 'New Case', onClick: openAddDialog }} />

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Open', count: cases.filter(c => c.status === 'open').length, color: 'text-emerald-600' },
            { label: 'In Progress', count: cases.filter(c => c.status === 'in_progress').length, color: 'text-blue-600' },
            { label: 'On Hold', count: cases.filter(c => c.status === 'on_hold').length, color: 'text-amber-600' },
            { label: 'Closed', count: cases.filter(c => c.status === 'closed').length, color: 'text-muted-foreground' },
          ].map((s) => (
            <Card key={s.label} className="p-3 md:p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn('text-2xl font-display font-semibold', s.color)}>{s.count}</p>
            </Card>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search cases..." className="pl-9" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Scale className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No cases yet</p>
            <p className="text-sm">Create your first case to get started</p>
          </Card>
        ) : (
          <>
            <div className="md:hidden space-y-3">
              {filtered.map((c) => (
                <Card key={c.id} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openDetail(c)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-card-foreground">{c.caseNumber}</p>
                      <p className="text-sm text-muted-foreground truncate">{c.title}</p>
                    </div>
                    <Badge variant="outline" className={cn('capitalize text-xs flex-shrink-0', statusStyles[c.status])}>
                      {statusLabels[c.status] || c.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="capitalize">{c.caseType}</span>
                    {c.assignedLawyer && <span>• {c.assignedLawyer}</span>}
                    {c.nextHearingDate && (
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(c.nextHearingDate)}</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="font-semibold">Case #</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Lawyer</TableHead>
                    <TableHead className="font-semibold">Next Hearing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => openDetail(c)}>
                      <TableCell className="font-medium">{c.caseNumber}</TableCell>
                      <TableCell>{c.title}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">{c.caseType}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize', statusStyles[c.status])}>
                          {statusLabels[c.status] || c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize',
                          c.priority === 'high' && 'bg-destructive/10 text-destructive border-destructive/20',
                          c.priority === 'medium' && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                          c.priority === 'low' && 'bg-muted text-muted-foreground border-border',
                        )}>{c.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.assignedLawyer || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(c.nextHearingDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Add Case Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Case</DialogTitle></DialogHeader>
          {form.opposingParty && (
            <ConflictCheckAlert opposingParty={form.opposingParty} clientName="" existingCases={cases} />
          )}
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Case Number</Label><Input value={form.caseNumber} readOnly className="bg-muted" /></div>
              <div><Label>Type</Label>
                <Select value={form.caseType} onValueChange={(v) => setForm(f => ({ ...f, caseType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{caseTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Case title" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{priorities.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Client</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{clients.map(cl => <SelectItem key={cl.id} value={cl.id}>{cl.company}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Assigned Lawyer</Label><Input value={form.assignedLawyer} onChange={(e) => setForm(f => ({ ...f, assignedLawyer: e.target.value }))} placeholder="Lawyer name" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Court Name</Label><Input value={form.courtName} onChange={(e) => setForm(f => ({ ...f, courtName: e.target.value }))} /></div>
              <div><Label>Court Case #</Label><Input value={form.courtCaseNumber} onChange={(e) => setForm(f => ({ ...f, courtCaseNumber: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Opposing Party</Label><Input value={form.opposingParty} onChange={(e) => setForm(f => ({ ...f, opposingParty: e.target.value }))} /></div>
              <div><Label>Opposing Counsel</Label><Input value={form.opposingCounsel} onChange={(e) => setForm(f => ({ ...f, opposingCounsel: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Judge</Label><Input value={form.judgeName} onChange={(e) => setForm(f => ({ ...f, judgeName: e.target.value }))} /></div>
              <div><Label>Filing Date</Label><Input type="date" value={form.filingDate} onChange={(e) => setForm(f => ({ ...f, filingDate: e.target.value }))} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create Case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CaseDetailDialog caseData={selectedCase} open={detailOpen} onOpenChange={setDetailOpen} onUpdate={() => { refetch(); }} />
    </DashboardLayout>
  );
}
