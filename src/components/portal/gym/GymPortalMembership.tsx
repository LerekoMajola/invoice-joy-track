import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CreditCard, Snowflake, Loader2, Upload, CheckCircle2,
  X, Paperclip
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

      toast.success('Receipt uploaded!');
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
    <div className="p-4 space-y-4">

      {/* Active subscription — hero card */}
      {active ? (() => {
        const start = parseISO(active.start_date);
        const end = parseISO(active.end_date);
        const total = Math.max(differenceInDays(end, start), 1);
        const remaining = Math.max(differenceInDays(end, today), 0);
        const elapsed = Math.round(((total - remaining) / total) * 100);

        return (
          <div className="space-y-3">
            {/* Hero card */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-primary/70 p-5 text-white shadow-xl">
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                      {active.status === 'frozen' ? 'Frozen' : 'Active Plan'}
                    </span>
                    {active.status === 'frozen' && (
                      <Snowflake className="h-3 w-3 text-blue-300" />
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white">
                    {active.plan_name || 'Membership'}
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    {format(start, 'dd MMM yyyy')} — {format(end, 'dd MMM yyyy')}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
              </div>

              {/* Days remaining + progress */}
              <div className="space-y-2 mb-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white">{remaining}</span>
                  <span className="text-xs text-white/40">{elapsed}% elapsed</span>
                </div>
                <p className="text-xs text-white/50 -mt-1">days remaining</p>
                {/* Slim progress strip */}
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-green-400 transition-all"
                    style={{ width: `${Math.max(100 - elapsed, 2)}%` }}
                  />
                </div>
              </div>

              {/* Investment */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-0.5">
                  Invested in your health
                </p>
                <p className={cn(
                  'text-2xl font-extrabold',
                  active.payment_status === 'paid' ? 'text-green-400' : 'text-red-400'
                )}>
                  {active.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                {active.payment_status !== 'paid' && (
                  <Badge variant="destructive" className="mt-1 text-xs capitalize">
                    {active.payment_status}
                  </Badge>
                )}
              </div>

              {active.status === 'frozen' && active.freeze_start && (
                <p className="mt-3 text-xs text-blue-300 flex items-center gap-1.5">
                  <Snowflake className="h-3 w-3" />
                  Frozen since {format(parseISO(active.freeze_start), 'dd MMM yyyy')}
                </p>
              )}
            </div>

            {/* Receipt chip — compact, no image preview */}
            <div className="flex items-center gap-2">
              {active.pop_url ? (
                <>
                  <button
                    onClick={() => { setProofSub(active); setProofOpen(true); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors"
                  >
                    <Paperclip className="h-3 w-3" />
                    Receipt attached ✓
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    Replace
                  </button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-full text-xs"
                >
                  {uploading ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Uploading…</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5 mr-1.5" />Attach Receipt</>
                  )}
                </Button>
              )}
            </div>

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
          </div>
        );
      })() : (
        <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
          <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No active membership</p>
          <p className="text-xs mt-1 opacity-60">Contact the gym to renew your plan.</p>
        </div>
      )}

      {/* Compact history */}
      {history.length > 0 && (
        <div className="pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Past Plans</p>
          <div className="space-y-0 divide-y divide-border">
            {history.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2.5 gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{s.plan_name || 'Plan'}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {format(parseISO(s.start_date), 'MMM yy')}–{format(parseISO(s.end_date), 'MMM yy')}
                  </span>
                </div>
                <Badge variant="secondary" className="capitalize text-xs shrink-0">{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-screen Proof Modal — unchanged */}
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
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-wider">Invested</p>
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
                No receipt photo attached yet.
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
