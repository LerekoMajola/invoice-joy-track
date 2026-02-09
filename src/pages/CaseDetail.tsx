import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { Scale, Clock, FileText, StickyNote, Receipt, Trash2, Save, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { CaseDocumentsTab } from '@/components/legal/CaseDocumentsTab';
import { useLegalCases } from '@/hooks/useLegalCases';
import { useLegalTimeEntries } from '@/hooks/useLegalTimeEntries';
import { useLegalCaseExpenses } from '@/hooks/useLegalCaseExpenses';
import { useLegalCaseNotes } from '@/hooks/useLegalCaseNotes';
import { useLegalCalendar } from '@/hooks/useLegalCalendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { type LegalCase } from '@/hooks/useLegalCases';

const statusOptions = ['open', 'in_progress', 'on_hold', 'closed'];
const priorityOptions = ['low', 'medium', 'high'];
const caseTypes = ['civil', 'criminal', 'family', 'corporate', 'labour', 'property', 'other'];
const noteTypes = ['general', 'court_notes', 'client_communication', 'research', 'strategy'];
const expenseTypes = ['filing_fee', 'expert_witness', 'travel', 'court_costs', 'printing', 'service_of_process', 'other'];

const statusStyles: Record<string, string> = {
  open: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  on_hold: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cases, isLoading, refetch } = useLegalCases();

  const caseData = useMemo(() => cases.find(c => c.id === id) || null, [cases, id]);

  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<Partial<LegalCase>>({});
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0], expenseType: 'other', isBillable: true });
  const [addingExpense, setAddingExpense] = useState(false);

  const { entries } = useLegalTimeEntries();
  const { expenses, createExpense, deleteExpense } = useLegalCaseExpenses(caseData?.id);
  const { notes, createNote, deleteNote } = useLegalCaseNotes(caseData?.id);
  const { events } = useLegalCalendar();

  const caseEntries = useMemo(() => entries.filter(e => e.caseId === caseData?.id), [entries, caseData?.id]);
  const caseEvents = useMemo(() => events.filter(e => e.caseId === caseData?.id), [events, caseData?.id]);

  const totalBilled = useMemo(() => caseEntries.reduce((s, e) => s + e.hours * e.hourlyRate, 0), [caseEntries]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const startEdit = () => { setForm({ ...caseData! }); setEditing(true); };

  const saveEdit = async () => {
    if (!caseData) return;
    const { error } = await supabase.from('legal_cases').update({
      title: form.title, case_type: form.caseType, status: form.status, priority: form.priority,
      court_name: form.courtName || null, court_case_number: form.courtCaseNumber || null,
      opposing_party: form.opposingParty || null, opposing_counsel: form.opposingCounsel || null,
      judge_name: form.judgeName || null, assigned_lawyer: form.assignedLawyer || null,
      description: form.description || null,
    }).eq('id', caseData.id);
    if (error) { toast.error('Failed to update case'); return; }
    toast.success('Case updated');
    setEditing(false);
    refetch();
  };

  const handleDelete = async () => {
    if (!caseData) return;
    const { error } = await supabase.from('legal_cases').delete().eq('id', caseData.id);
    if (error) { toast.error('Failed to delete case'); return; }
    toast.success('Case deleted');
    navigate('/legal-cases');
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() || !caseData) return;
    await createNote({ caseId: caseData.id, content: noteContent, noteType });
    setNoteContent('');
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount || !caseData) { toast.error('Description and amount required'); return; }
    await createExpense({
      caseId: caseData.id, description: expenseForm.description, amount: parseFloat(expenseForm.amount),
      date: expenseForm.date, expenseType: expenseForm.expenseType, isBillable: expenseForm.isBillable, receiptUrl: null,
    });
    setExpenseForm({ description: '', amount: '', date: new Date().toISOString().split('T')[0], expenseType: 'other', isBillable: true });
    setAddingExpense(false);
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header title="Case Detail" subtitle="Loading..." />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!caseData) {
    return (
      <DashboardLayout>
        <Header title="Case Not Found" />
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Scale className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Case not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/legal-cases')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Cases
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title={caseData.caseNumber} subtitle={caseData.title} />

      <div className="p-4 md:p-6">
        {/* Top bar with back button, status, and actions */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/legal-cases')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back to Cases
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('capitalize', statusStyles[caseData.status])}>{caseData.status.replace('_', ' ')}</Badge>
            {!editing && <Button size="sm" variant="outline" onClick={startEdit}>Edit</Button>}
            <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="w-full grid grid-cols-5 mb-4">
            <TabsTrigger value="overview"><Scale className="h-4 w-4 mr-1.5" />Overview</TabsTrigger>
            <TabsTrigger value="time"><Clock className="h-4 w-4 mr-1.5" />Time</TabsTrigger>
            <TabsTrigger value="expenses"><Receipt className="h-4 w-4 mr-1.5" />Expenses</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1.5" />Docs</TabsTrigger>
            <TabsTrigger value="notes"><StickyNote className="h-4 w-4 mr-1.5" />Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {editing ? (
              <Card className="p-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Title</Label><Input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                    <div><Label>Type</Label>
                      <Select value={form.caseType} onValueChange={v => setForm(f => ({ ...f, caseType: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{caseTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Status</Label>
                      <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Priority</Label>
                      <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{priorityOptions.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Court</Label><Input value={form.courtName || ''} onChange={e => setForm(f => ({ ...f, courtName: e.target.value }))} /></div>
                    <div><Label>Court Case #</Label><Input value={form.courtCaseNumber || ''} onChange={e => setForm(f => ({ ...f, courtCaseNumber: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Opposing Party</Label><Input value={form.opposingParty || ''} onChange={e => setForm(f => ({ ...f, opposingParty: e.target.value }))} /></div>
                    <div><Label>Opposing Counsel</Label><Input value={form.opposingCounsel || ''} onChange={e => setForm(f => ({ ...f, opposingCounsel: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Judge</Label><Input value={form.judgeName || ''} onChange={e => setForm(f => ({ ...f, judgeName: e.target.value }))} /></div>
                    <div><Label>Lawyer</Label><Input value={form.assignedLawyer || ''} onChange={e => setForm(f => ({ ...f, assignedLawyer: e.target.value }))} /></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} /></div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button onClick={saveEdit}><Save className="h-4 w-4 mr-1" />Save</Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Case Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Type', value: caseData.caseType },
                        { label: 'Priority', value: caseData.priority },
                        { label: 'Court', value: caseData.courtName },
                        { label: 'Court Case #', value: caseData.courtCaseNumber },
                        { label: 'Opposing Party', value: caseData.opposingParty },
                        { label: 'Opposing Counsel', value: caseData.opposingCounsel },
                        { label: 'Judge', value: caseData.judgeName },
                        { label: 'Lawyer', value: caseData.assignedLawyer },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium capitalize">{value || '-'}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                  {caseData.description && (
                    <Card className="p-6">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground">{caseData.description}</p>
                    </Card>
                  )}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-3">Upcoming Events</h3>
                    {caseEvents.filter(e => !e.isCompleted).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No upcoming events</p>
                    ) : (
                      <div className="space-y-2">
                        {caseEvents.filter(e => !e.isCompleted).slice(0, 5).map(e => (
                          <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
                            <span>{e.title}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(e.eventDate)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
                <div className="space-y-4">
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground">Billable Time</p>
                    <p className="text-2xl font-semibold text-primary">{formatMaluti(totalBilled)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{caseEntries.length} entries • {caseEntries.reduce((s, e) => s + e.hours, 0).toFixed(1)}h</p>
                  </Card>
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground">Expenses</p>
                    <p className="text-2xl font-semibold text-amber-600">{formatMaluti(totalExpenses)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{expenses.length} items</p>
                  </Card>
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground">Filing Date</p>
                    <p className="text-sm font-medium">{formatDate(caseData.filingDate)}</p>
                  </Card>
                  <Card className="p-5">
                    <p className="text-xs text-muted-foreground">Next Hearing</p>
                    <p className="text-sm font-medium">{formatDate(caseData.nextHearingDate)}</p>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="time">
            {caseEntries.length === 0 ? (
              <Card className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Clock className="h-10 w-10 mb-3" />
                <p className="text-sm">No time entries for this case</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {caseEntries.map(e => (
                  <Card key={e.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">{e.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">{formatDate(e.date)} • {(e.activityType || '').replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{e.hours}h</p>
                      <p className="text-xs text-muted-foreground">{formatMaluti(e.hours * e.hourlyRate)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expenses">
            <div className="flex justify-end mb-4">
              <Button size="sm" variant="outline" onClick={() => setAddingExpense(!addingExpense)}><Plus className="h-4 w-4 mr-1" />Add Expense</Button>
            </div>
            {addingExpense && (
              <Card className="p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><Label>Description</Label><Input value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} /></div>
                  <div><Label>Amount</Label><Input type="number" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" value={expenseForm.date} onChange={e => setExpenseForm(f => ({ ...f, date: e.target.value }))} /></div>
                  <div><Label>Type</Label>
                    <Select value={expenseForm.expenseType} onValueChange={v => setExpenseForm(f => ({ ...f, expenseType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{expenseTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setAddingExpense(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleAddExpense}>Add</Button>
                </div>
              </Card>
            )}
            {expenses.length === 0 ? (
              <Card className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Receipt className="h-10 w-10 mb-3" />
                <p className="text-sm">No expenses recorded</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {expenses.map(e => (
                  <Card key={e.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">{e.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">{formatDate(e.date)} • {e.expenseType.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{formatMaluti(e.amount)}</p>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteExpense(e.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents">
            <CaseDocumentsTab caseId={caseData.id} />
          </TabsContent>

          <TabsContent value="notes">
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{noteTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Add a note..." className="flex-1"
                  onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }} />
                <Button onClick={handleAddNote} size="sm">Add</Button>
              </div>
            </div>
            {notes.length === 0 ? (
              <Card className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <StickyNote className="h-10 w-10 mb-3" />
                <p className="text-sm">No notes yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {notes.map(n => (
                  <Card key={n.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs capitalize">{n.noteType.replace('_', ' ')}</Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteNote(n.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    <p className="text-sm">{n.content}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Case"
        description={`Are you sure you want to delete case ${caseData.caseNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
