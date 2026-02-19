import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Snowflake, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subscription {
  id: string;
  plan_name: string | null;
  start_date: string;
  end_date: string;
  status: string;
  payment_status: string;
  amount_paid: number;
  freeze_start: string | null;
  freeze_end: string | null;
}

interface GymPortalMembershipProps {
  memberId: string;
}

export function GymPortalMembership({ memberId }: GymPortalMembershipProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('gym_member_subscriptions')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSubscriptions((data as unknown as Subscription[]) || []);
        setLoading(false);
      });
  }, [memberId]);

  const active = subscriptions.find(s => s.status === 'active' || s.status === 'frozen');
  const history = subscriptions.filter(s => s.status !== 'active' && s.status !== 'frozen');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-foreground pt-2">Membership</h2>

      {active ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{active.plan_name || 'Membership Plan'}</p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(active.start_date), 'dd MMM yyyy')} — {format(parseISO(active.end_date), 'dd MMM yyyy')}
                </p>
              </div>
              <Badge variant={active.status === 'frozen' ? 'secondary' : 'default'} className="capitalize">
                {active.status}
              </Badge>
            </div>

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

            <div className="grid grid-cols-2 gap-3 text-sm pt-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <p className={cn('font-medium capitalize', active.payment_status === 'paid' ? 'text-success' : 'text-destructive')}>
                    {active.payment_status}
                  </p>
                </div>
              </div>
              {active.status === 'frozen' && active.freeze_start && (
                <div className="flex items-center gap-2">
                  <Snowflake className="h-4 w-4 text-info" />
                  <div>
                    <p className="text-xs text-muted-foreground">Frozen since</p>
                    <p className="font-medium">{format(parseISO(active.freeze_start), 'dd MMM')}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No active membership.</p>
            <p className="text-xs mt-1">Contact the gym to renew your plan.</p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">History</h3>
          {history.map(s => (
            <Card key={s.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.plan_name || 'Plan'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(s.start_date), 'dd MMM yy')} — {format(parseISO(s.end_date), 'dd MMM yy')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize text-xs">{s.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
