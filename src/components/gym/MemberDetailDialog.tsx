import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, AlertTriangle, Heart, Calendar, CreditCard, Snowflake, XCircle, KeyRound, Pencil } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useCurrency } from '@/hooks/useCurrency';
import { useGymMemberSubscriptions } from '@/hooks/useGymMemberSubscriptions';
import { AssignPlanDialog } from './AssignPlanDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog as ConfirmDialogComponent } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { GymMember } from '@/hooks/useGymMembers';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: GymMember;
  onUpdate: (id: string, updates: any) => Promise<boolean>;
}

const statusColors: Record<string, string> = {
  prospect: 'bg-muted text-muted-foreground',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  frozen: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface EditData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  healthConditions: string;
  notes: string;
}

function MemberEditForm({ editData, setEditData }: { editData: EditData; setEditData: React.Dispatch<React.SetStateAction<EditData>> }) {
  const update = (field: keyof EditData, value: string) => setEditData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">First Name</Label>
          <Input value={editData.firstName} onChange={e => update('firstName', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Last Name</Label>
          <Input value={editData.lastName} onChange={e => update('lastName', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Email</Label>
          <Input type="email" value={editData.email} onChange={e => update('email', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Phone</Label>
          <Input value={editData.phone} onChange={e => update('phone', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Date of Birth</Label>
          <Input type="date" value={editData.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Gender</Label>
          <Select value={editData.gender} onValueChange={v => update('gender', v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Address</Label>
        <Input value={editData.address} onChange={e => update('address', e.target.value)} />
      </div>
      <Separator />
      <p className="text-xs font-medium text-destructive flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Emergency Contact</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Name</Label>
          <Input value={editData.emergencyContactName} onChange={e => update('emergencyContactName', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Phone</Label>
          <Input value={editData.emergencyContactPhone} onChange={e => update('emergencyContactPhone', e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Health Conditions</Label>
        <Textarea value={editData.healthConditions} onChange={e => update('healthConditions', e.target.value)} rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Notes</Label>
        <Textarea value={editData.notes} onChange={e => update('notes', e.target.value)} rows={2} />
      </div>
    </div>
  );
}

export function MemberDetailDialog({ open, onOpenChange, member, onUpdate }: Props) {
  const { fc } = useCurrency();
  const { toast } = useToast();
  const { subscriptions, freezeSubscription, unfreezeSubscription, cancelSubscription } = useGymMemberSubscriptions(member.id);
  const [assignOpen, setAssignOpen] = useState(false);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [freezeEnd, setFreezeEnd] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
    gender: '', address: '', emergencyContactName: '', emergencyContactPhone: '',
    healthConditions: '', notes: '',
  });
  const { confirmDialog, openConfirmDialog, closeConfirmDialog, handleConfirm } = useConfirmDialog();

  useEffect(() => {
    setEditData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email || '',
      phone: member.phone || '',
      dateOfBirth: member.dateOfBirth || '',
      gender: member.gender || '',
      address: member.address || '',
      emergencyContactName: member.emergencyContactName || '',
      emergencyContactPhone: member.emergencyContactPhone || '',
      healthConditions: member.healthConditions || '',
      notes: member.notes || '',
    });
    setIsEditing(false);
  }, [member]);

  const activeSub = subscriptions.find(s => s.status === 'active' || s.status === 'frozen');
  const today = new Date();

  const handleSave = async () => {
    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      toast({ title: 'Name required', description: 'First and last name cannot be empty.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const ok = await onUpdate(member.id, editData);
    setSaving(false);
    if (ok) setIsEditing(false);
  };

  const handleCreatePortalAccess = async () => {
    if (!member.email) {
      toast({ title: 'No email', description: 'This member has no email address on file.', variant: 'destructive' });
      return;
    }
    setSendingInvite(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke('create-portal-account', {
      body: {
        memberId: member.id,
        portalType: 'gym',
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
      },
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    });
    setSendingInvite(false);
    if (res.error || res.data?.error) {
      const msg = res.data?.error || res.error?.message || 'Failed to create portal access';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } else {
      toast({ title: 'Portal access created!', description: `Login credentials have been emailed to ${member.email}.` });
    }
  };

  let daysRemaining = 0;
  let totalDays = 1;
  let progressPercent = 0;
  if (activeSub) {
    const start = parseISO(activeSub.startDate);
    const end = parseISO(activeSub.endDate);
    totalDays = Math.max(differenceInDays(end, start), 1);
    daysRemaining = Math.max(differenceInDays(end, today), 0);
    progressPercent = Math.round(((totalDays - daysRemaining) / totalDays) * 100);
  }

  const handleFreeze = async () => {
    if (!activeSub || !freezeEnd) return;
    await freezeSubscription(activeSub.id, freezeEnd);
    setFreezeDialogOpen(false);
    setFreezeEnd('');
  };

  const handleUnfreeze = async () => {
    if (!activeSub) return;
    await unfreezeSubscription(activeSub.id);
  };

  const handleCancel = async () => {
    if (!activeSub) return;
    openConfirmDialog({
      title: 'Cancel Membership',
      description: 'Are you sure you want to cancel this membership? This action cannot be undone.',
      variant: 'destructive',
      confirmLabel: 'Cancel Membership',
      action: async () => { await cancelSubscription(activeSub.id); },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>View and manage member profile and subscription.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {isEditing ? (
              <>
                <MemberEditForm editData={editData} setEditData={setEditData} />
                <div className="flex justify-end gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditData({ firstName: member.firstName, lastName: member.lastName, email: member.email || '', phone: member.phone || '', dateOfBirth: member.dateOfBirth || '', gender: member.gender || '', address: member.address || '', emergencyContactName: member.emergencyContactName || '', emergencyContactPhone: member.emergencyContactPhone || '', healthConditions: member.healthConditions || '', notes: member.notes || '' }); }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                </div>
              </>
            ) : (
              <>
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{member.firstName} {member.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{member.memberNumber}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Badge className={statusColors[member.status]} variant="secondary">{member.status}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {member.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{member.email}</div>}
                  {member.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{member.phone}</div>}
                  {member.dateOfBirth && <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{format(parseISO(member.dateOfBirth), 'dd MMM yyyy')}</div>}
                  {member.gender && <div className="text-muted-foreground capitalize">{member.gender}</div>}
                </div>

                {/* Emergency Contact */}
                {(member.emergencyContactName || member.emergencyContactPhone) && (
                  <>
                    <Separator />
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                      <p className="text-xs font-medium text-destructive flex items-center gap-1.5 mb-1"><AlertTriangle className="h-3.5 w-3.5" />Emergency Contact</p>
                      <p className="text-sm text-foreground">{member.emergencyContactName} {member.emergencyContactPhone && `— ${member.emergencyContactPhone}`}</p>
                    </div>
                  </>
                )}

                {/* Health Declaration */}
                {member.healthConditions && (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                    <p className="text-xs font-medium text-warning flex items-center gap-1.5 mb-1"><Heart className="h-3.5 w-3.5" />Health Declaration</p>
                    <p className="text-sm text-foreground">{member.healthConditions}</p>
                  </div>
                )}
              </>
            )}

            {/* Current Subscription */}
            <Separator />
            {activeSub ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{activeSub.planName || 'Subscription'}</p>
                  <Badge variant={activeSub.paymentStatus === 'paid' ? 'default' : 'destructive'} className="text-xs">
                    <CreditCard className="h-3 w-3 mr-1" />{activeSub.paymentStatus}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(parseISO(activeSub.startDate), 'dd MMM yyyy')} — {format(parseISO(activeSub.endDate), 'dd MMM yyyy')}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{daysRemaining} days remaining</span>
                    <span>{progressPercent}% elapsed</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
                {activeSub.status === 'frozen' && (
                  <p className="text-xs text-info flex items-center gap-1"><Snowflake className="h-3 w-3" />Frozen since {activeSub.freezeStart ? format(parseISO(activeSub.freezeStart), 'dd MMM') : 'N/A'}</p>
                )}
                <div className="flex gap-2 pt-1">
                  {activeSub.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={() => setFreezeDialogOpen(true)}>
                      <Snowflake className="h-3.5 w-3.5 mr-1" />Freeze
                    </Button>
                  )}
                  {activeSub.status === 'frozen' && (
                    <Button size="sm" variant="outline" onClick={handleUnfreeze}>
                      Unfreeze
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={handleCancel}>
                    <XCircle className="h-3.5 w-3.5 mr-1" />Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-sm text-muted-foreground mb-2">No active subscription</p>
                <Button size="sm" onClick={() => setAssignOpen(true)}>Assign Plan</Button>
              </div>
            )}

            {/* Subscription History */}
            {subscriptions.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Subscription History</p>
                  <div className="space-y-2">
                    {subscriptions.map(s => (
                      <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">{s.planName || 'Plan'}</p>
                          <p className="text-muted-foreground">{format(parseISO(s.startDate), 'dd MMM yy')} — {format(parseISO(s.endDate), 'dd MMM yy')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{fc(s.amountPaid)}</p>
                          <Badge variant="secondary" className="text-[10px]">{s.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            {!isEditing && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {member.email && (
                    <Button size="sm" variant="outline" onClick={handleCreatePortalAccess} disabled={sendingInvite} className="flex-1">
                      <KeyRound className="h-3.5 w-3.5 mr-1" />{sendingInvite ? 'Sending…' : member.portalUserId ? 'Resend Portal Access' : 'Create Portal Access'}
                    </Button>
                  )}
                  {!activeSub && <Button size="sm" onClick={() => setAssignOpen(true)}>Assign Plan</Button>}
                  <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AssignPlanDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        memberId={member.id}
        memberName={`${member.firstName} ${member.lastName}`}
      />

      {/* Freeze date dialog */}
      <Dialog open={freezeDialogOpen} onOpenChange={setFreezeDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Freeze Membership</DialogTitle>
            <DialogDescription>Select the expected unfreeze date.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Unfreeze Date</Label>
              <Input type="date" value={freezeEnd} onChange={e => setFreezeEnd(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFreezeDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleFreeze} disabled={!freezeEnd}>Freeze</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {confirmDialog && (
        <ConfirmDialogComponent
          open={confirmDialog.open}
          onOpenChange={(open) => { if (!open) closeConfirmDialog(); }}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={handleConfirm}
          variant={confirmDialog.variant}
          confirmLabel={confirmDialog.confirmLabel}
        />
      )}
    </>
  );
}
