import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminProspect, ProspectActivity, ActivityType } from '@/hooks/useAdminProspects';
import { format } from 'date-fns';
import { Phone, Mail, Video, Users, StickyNote, Trash2, Save, Plus } from 'lucide-react';

const activityIcons: Record<ActivityType, React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  note: <StickyNote className="h-3.5 w-3.5" />,
  demo: <Video className="h-3.5 w-3.5" />,
  meeting: <Users className="h-3.5 w-3.5" />,
};

const activityColors: Record<ActivityType, string> = {
  call: 'bg-primary/10 text-primary',
  email: 'bg-accent text-accent-foreground',
  note: 'bg-muted text-muted-foreground',
  demo: 'bg-green-100 text-green-700',
  meeting: 'bg-secondary text-secondary-foreground',
};

interface ProspectDetailSheetProps {
  prospect: AdminProspect | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateProspect: (id: string, data: Partial<AdminProspect>) => Promise<AdminProspect | null>;
  deleteProspect: (id: string) => Promise<void>;
  fetchActivities: (prospectId: string) => Promise<ProspectActivity[]>;
  addActivity: (prospectId: string, data: { type: ActivityType; title: string; description: string }) => Promise<ProspectActivity | null>;
}

export function ProspectDetailSheet({ prospect, open, onOpenChange, updateProspect, deleteProspect, fetchActivities, addActivity }: ProspectDetailSheetProps) {
  const [activities, setActivities] = useState<ProspectActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<AdminProspect>>({});
  const [activityForm, setActivityForm] = useState({ type: 'note' as ActivityType, title: '', description: '' });
  const [addingActivity, setAddingActivity] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);

  useEffect(() => {
    if (prospect) {
      setForm({ ...prospect });
      loadActivities(prospect.id);
    }
  }, [prospect]);

  const loadActivities = async (id: string) => {
    setLoadingActivities(true);
    const data = await fetchActivities(id);
    setActivities(data);
    setLoadingActivities(false);
  };

  const set = (key: string, val: string | number) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!prospect) return;
    setSaving(true);
    await updateProspect(prospect.id, form);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!prospect) return;
    await deleteProspect(prospect.id);
    onOpenChange(false);
  };

  const handleAddActivity = async () => {
    if (!prospect || !activityForm.title) return;
    setAddingActivity(true);
    const act = await addActivity(prospect.id, activityForm);
    if (act) {
      setActivities(prev => [act, ...prev]);
      setActivityForm({ type: 'note', title: '', description: '' });
      setShowActivityForm(false);
    }
    setAddingActivity(false);
  };

  if (!prospect) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle className="text-lg">{prospect.company_name}</SheetTitle>
              <p className="text-sm text-muted-foreground">{prospect.contact_name}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-5">
            {/* Edit Form */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Contact Name</Label>
                <Input value={form.contact_name || ''} onChange={e => set('contact_name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Company Name</Label>
                <Input value={form.company_name || ''} onChange={e => set('company_name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input value={form.email || ''} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stage</Label>
                <Select value={form.status || 'lead'} onValueChange={v => set('status', v)}>
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
                <Label className="text-xs">Priority</Label>
                <Select value={form.priority || 'medium'} onValueChange={v => set('priority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Estimated Value</Label>
                <Input type="number" value={form.estimated_value || ''} onChange={e => set('estimated_value', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Win Probability %</Label>
                <Input type="number" min={0} max={100} value={form.win_probability ?? ''} onChange={e => set('win_probability', parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Expected Close Date</Label>
                <Input type="date" value={form.expected_close_date || ''} onChange={e => set('expected_close_date', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Next Follow-up</Label>
                <Input type="date" value={form.next_follow_up || ''} onChange={e => set('next_follow_up', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Interested Plan</Label>
                <Input value={form.interested_plan || ''} onChange={e => set('interested_plan', e.target.value)} placeholder="Professional" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">System / Module</Label>
                <Input value={form.interested_system || ''} onChange={e => set('interested_system', e.target.value)} placeholder="CRM + Fleet" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Source</Label>
                <Input value={form.source || ''} onChange={e => set('source', e.target.value)} placeholder="LinkedIn, Referral…" />
              </div>
              {form.status === 'lost' && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Loss Reason</Label>
                  <Input value={form.loss_reason || ''} onChange={e => set('loss_reason', e.target.value)} placeholder="Price, competitor…" />
                </div>
              )}
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs">Notes</Label>
                <Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={3} />
              </div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>

            <Separator />

            {/* Activity Log */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Activity Log</h3>
                <Button size="sm" variant="outline" onClick={() => setShowActivityForm(!showActivityForm)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Log Activity
                </Button>
              </div>

              {showActivityForm && (
                <div className="bg-muted/50 rounded-lg p-3 mb-3 space-y-2 border">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select value={activityForm.type} onValueChange={v => setActivityForm(f => ({ ...f, type: v as ActivityType }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="note">Note</SelectItem>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="demo">Demo</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input className="h-8 text-xs" value={activityForm.title} onChange={e => setActivityForm(f => ({ ...f, title: e.target.value }))} placeholder="Brief summary" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea className="text-xs" rows={2} value={activityForm.description} onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))} placeholder="Details…" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setShowActivityForm(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleAddActivity} disabled={addingActivity || !activityForm.title}>
                      {addingActivity ? 'Saving…' : 'Add'}
                    </Button>
                  </div>
                </div>
              )}

              {loadingActivities ? (
                <p className="text-xs text-muted-foreground">Loading activities…</p>
              ) : activities.length === 0 ? (
                <p className="text-xs text-muted-foreground">No activities yet. Log the first interaction!</p>
              ) : (
                <div className="space-y-2">
                  {activities.map(act => (
                    <div key={act.id} className="flex gap-2.5">
                      <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${activityColors[act.type]}`}>
                        {activityIcons[act.type]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{act.title}</p>
                          <Badge variant="outline" className="text-xs capitalize">{act.type}</Badge>
                        </div>
                        {act.description && <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(act.created_at), 'dd MMM yyyy, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
