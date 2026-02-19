import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User, Calendar, Phone, Mail, Dumbbell, CalendarDays, MessageCircle, CreditCard, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GymPortalMember } from '@/hooks/usePortalSession';
import type { User as AuthUser } from '@supabase/supabase-js';

const statusColors: Record<string, string> = {
  active: 'bg-success/15 text-success border-success/20',
  frozen: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  expired: 'bg-warning/15 text-warning border-warning/20',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/20',
  prospect: 'bg-muted text-muted-foreground border-border',
};

interface GymMemberPortalProps {
  member: GymPortalMember;
  user: AuthUser;
}

interface Subscription {
  id: string;
  plan_name: string | null;
  start_date: string;
  end_date: string;
  status: string;
  payment_status: string;
  amount_paid: number;
}

export function GymMemberPortal({ member }: GymMemberPortalProps) {
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);

  useEffect(() => {
    supabase
      .from('gym_member_subscriptions')
      .select('*')
      .eq('member_id', member.id)
      .in('status', ['active', 'frozen'])
      .maybeSingle()
      .then(({ data }) => setActiveSub(data as unknown as Subscription));
  }, [member.id]);

  const today = new Date();
  const daysRemaining = activeSub
    ? Math.max(differenceInDays(parseISO(activeSub.end_date), today), 0)
    : null;

  const totalDays = activeSub
    ? Math.max(differenceInDays(parseISO(activeSub.end_date), parseISO(activeSub.start_date)), 1)
    : 1;

  const progressPct = daysRemaining !== null
    ? Math.max(5, Math.min(100, (daysRemaining / totalDays) * 100))
    : 0;

  const initials = `${member.first_name?.[0] ?? ''}${member.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/20 via-primary/5 to-background px-4 pt-6 pb-8">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shrink-0">
            <span className="text-xl font-bold text-primary-foreground">{initials || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Hi, {member.first_name}! 👋
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{member.member_number}</p>
          </div>
          <Badge
            className={cn('capitalize shrink-0 border text-xs font-medium', statusColors[member.status])}
            variant="outline"
          >
            {member.status}
          </Badge>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-4">
        {/* Membership Card */}
        {activeSub ? (
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="bg-gradient-to-br from-primary via-primary to-primary/80 p-5 text-primary-foreground">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-widest font-semibold mb-1">
                    Current Plan
                  </p>
                  <p className="text-xl font-bold leading-tight">{activeSub.plan_name || 'Membership'}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary-foreground/80" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider mb-0.5">Expires</p>
                  <p className="text-sm font-semibold">{format(parseISO(activeSub.end_date), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider mb-0.5">Days Left</p>
                  <p className={cn('text-sm font-semibold', daysRemaining !== null && daysRemaining <= 7 && 'text-yellow-200')}>
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] text-primary-foreground/50 mb-1">
                  <span>Plan progress</span>
                  <span>{Math.round(100 - progressPct)}% used</span>
                </div>
                <div className="h-1.5 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-foreground rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-5 text-center">
              <Dumbbell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No active membership plan</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Contact the gym to get started.</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: CalendarDays, label: 'Classes', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { icon: MessageCircle, label: 'Messages', color: 'text-green-500', bg: 'bg-green-500/10' },
            { icon: CreditCard, label: 'My Plan', color: 'text-primary', bg: 'bg-primary/10' },
          ].map(({ icon: Icon, label, color, bg }) => (
            <Card key={label} className="border-border/50">
              <CardContent className="p-3 flex flex-col items-center gap-2">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Info */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Your Profile</p>
            <div className="space-y-2.5">
              {member.email && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground truncate">{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{member.phone}</span>
                </div>
              )}
              {member.date_of_birth && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{format(parseISO(member.date_of_birth), 'dd MMM yyyy')}</span>
                </div>
              )}
              {member.gender && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground capitalize">{member.gender}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {member.emergency_contact_name && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <p className="text-xs font-semibold text-destructive uppercase tracking-wider">Emergency Contact</p>
              </div>
              <p className="text-sm font-medium text-foreground">{member.emergency_contact_name}</p>
              {member.emergency_contact_phone && (
                <p className="text-sm text-muted-foreground mt-0.5">{member.emergency_contact_phone}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
