import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CreditCard, Snowflake, Calendar, Loader2, Upload, CheckCircle2,
  ImageIcon, X, Eye, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { GymPortalMember } from '@/hooks/usePortalSession';

interface Subscription {
  id: string;
  plan_id: string;
  plan_name: string | null;
  start_date: string;
  end_date: string;
  status: string;
  payment_status: string;
  amount_paid: number;
  freeze_start: string | null;
  freeze_end: string | null;
  pop_url: string | null;
}

interface GymPortalMembershipProps {
  memberId: string;
  member: GymPortalMember;
}

export function GymPortalMembership({ memberId, member }: GymPortalMembershipProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);
  const [proofSub, setProofSub] = useState<Subscription | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSubscriptions = async () => {
    const { data } = await supabase
      .from('gym_member_subscriptions' as any)
      .select('*, gym_membership_plans(name)')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    const mapped = ((data as any[]) || []).map((s: any) => ({
      id: s.id,
      plan_id: s.plan_id,
      plan_name: s.plan_name || s.gym_membership_plans?.name || null,
      start_date: s.start_date,
      end_date: s.end_date,
      status: s.status,
      payment_status: s.payment_status,
      amount_paid: Number(s.amount_paid),
      freeze_start: s.freeze_start,
      freeze_end: s.freeze_end,
      pop_url: s.pop_url,
    }));
    setSubscriptions(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [memberId]);

  const active = subscriptions.find(s => s.status === 'active' || s.status === 'frozen');
  const history = subscriptions.filter(s => s.status !== 'active' && s.status !== 'frozen');
  const today = new Date();

  const handleUpload = async (file: File, sub: Subscription) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${memberId}/${sub.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('gym-pop')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('gym-pop').getPublicUrl(path);
      const popUrl = urlData.publicUrl + `?t=${Date.now()}`;

      const { error: updateError } = await (supabase
        .from('gym_member_subscriptions' as any)
        .update({ pop_url: popUrl })
        .eq('id', sub.id) as any);

      if (updateError) throw updateError;

      toast.success('Proof of payment uploaded!');
      await fetchSubscriptions();
    } catch (err: any) {
      console.error(err);
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-lg font-bold text-foreground pt-2">Billing & Payment</h2>

      {/* Active subscription */}
      {active ? (
        <div className="space-y-3">
          {/* Plan info card */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{active.plan_name || 'Membership Plan'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(parseISO(active.start_date), 'dd MMM yyyy')} — {format(parseISO(active.end_date), 'dd MMM yyyy')}
                  </p>
                </div>
                <Badge
                  variant={active.status === 'frozen' ? 'secondary' : 'default'}
                  className="capitalize shrink-0"
                >
                  {active.status}
                </Badge>
              </div>

              {/* Progress */}
              {(() => {
                const start = parseISO(active.start_date);
                const end = parseISO(active.end_date);
                const total = Math.max(differenceInDays(end, start), 1);
                const remaining = Math.max(differenceInDays(end, today), 0);
                const elapsed = Math.round(((total - remaining) / total) * 100);
                return (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{remaining} days remaining</span>
                      <span>{elapsed}% elapsed</span>
                    </div>
                    <Progress value={elapsed} className="h-2" />
                  </div>
                );
              })()}

              {/* Amount + payment status */}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Amount Paid</p>
                  <p className={cn(
                    'text-xl font-bold mt-0.5',
                    active.payment_status === 'paid' ? 'text-green-600' : 'text-destructive'
                  )}>
                    {active.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <Badge
                    variant={active.payment_status === 'paid' ? 'default' : 'destructive'}
                    className="capitalize mt-0.5"
                  >
                    {active.payment_status === 'paid' ? '✓ Paid' : active.payment_status}
                  </Badge>
                </div>
              </div>

              {active.status === 'frozen' && active.freeze_start && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Snowflake className="h-4 w-4" />
                  <span>Frozen since {format(parseISO(active.freeze_start), 'dd MMM yyyy')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proof of Payment section */}
          <Card className={cn(
            'border-2 transition-colors',
            active.pop_url ? 'border-green-500/30 bg-green-500/5' : 'border-dashed border-border'
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Proof of Payment</p>
                </div>
                {active.pop_url && (
                  <Badge variant="outline" className="text-green-600 border-green-500/40 bg-green-500/10 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Submitted
                  </Badge>
                )}
              </div>

              {active.pop_url ? (
                <div className="space-y-3">
                  {/* Thumbnail */}
                  <div
                    className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer border border-border"
                    onClick={() => { setProofSub(active); setProofOpen(true); }}
                  >
                    <img
                      src={active.pop_url}
                      alt="Proof of payment"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Eye className="h-8 w-8 text-white drop-shadow" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => { setProofSub(active); setProofOpen(true); }}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      Show as Proof
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1.5" />
                      Replace
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    Attach a photo of your payment receipt so the gym can verify your payment.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading…</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" />Attach Proof of Payment</>
                    )}
                  </Button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, active);
                  e.target.value = '';
                }}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No active membership.</p>
            <p className="text-xs mt-1">Contact the gym to renew your plan.</p>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">History</h3>
          {history.map(s => (
            <Card key={s.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.plan_name || 'Plan'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {format(parseISO(s.start_date), 'dd MMM yy')} — {format(parseISO(s.end_date), 'dd MMM yy')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="secondary" className="capitalize text-xs">{s.status}</Badge>
                    {s.amount_paid > 0 && (
                      <p className="text-xs font-medium text-muted-foreground">
                        {s.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full-screen Proof Modal */}
      <Dialog open={proofOpen} onOpenChange={setProofOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <div className="bg-primary p-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60 font-semibold">Proof of Payment</p>
                <p className="font-bold text-lg leading-tight">{proofSub?.plan_name || 'Membership'}</p>
              </div>
              <button
                className="h-8 w-8 rounded-full bg-primary-foreground/15 flex items-center justify-center"
                onClick={() => setProofOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-wider">Member</p>
                <p className="font-medium">{member.first_name} {member.last_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-wider">Member #</p>
                <p className="font-medium">{member.member_number}</p>
              </div>
              <div>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-wider">Amount Paid</p>
                <p className="font-bold text-base">
                  {proofSub?.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-wider">Status</p>
                <p className="font-medium capitalize">{proofSub?.payment_status}</p>
              </div>
              {proofSub && (
                <div className="col-span-2">
                  <p className="text-[10px] text-primary-foreground/50 uppercase tracking-wider">Period</p>
                  <p className="font-medium">
                    {format(parseISO(proofSub.start_date), 'dd MMM yyyy')} — {format(parseISO(proofSub.end_date), 'dd MMM yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* POP image */}
          {proofSub?.pop_url ? (
            <div className="p-3 bg-muted/50">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Payment Receipt Photo</p>
              <img
                src={proofSub.pop_url}
                alt="Payment receipt"
                className="w-full rounded-lg border border-border object-contain max-h-64"
              />
            </div>
          ) : (
            <div className="p-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Payment on Record</p>
              <p className="text-xs text-muted-foreground mt-1">
                No receipt photo attached yet. Upload one to show gym staff.
              </p>
            </div>
          )}

          <div className="p-3 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Present this screen to gym staff as proof of payment
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
