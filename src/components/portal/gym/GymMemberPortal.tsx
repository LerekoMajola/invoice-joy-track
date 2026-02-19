import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User, Calendar, Phone, Mail, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GymPortalMember } from '@/hooks/usePortalSession';
import type { User as AuthUser } from '@supabase/supabase-js';

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  frozen: 'bg-info/10 text-info',
  expired: 'bg-warning/10 text-warning',
  cancelled: 'bg-destructive/10 text-destructive',
  prospect: 'bg-muted text-muted-foreground',
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

  return (
    <div className="p-4 space-y-4">
      {/* Welcome Header */}
      <div className="pt-6 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Hi, {member.first_name}! 👋
            </h1>
            <p className="text-xs text-muted-foreground">{member.member_number}</p>
          </div>
          <Badge className={cn('ml-auto capitalize', statusColors[member.status])} variant="secondary">
            {member.status}
          </Badge>
        </div>
      </div>

      {/* Membership Card */}
      {activeSub ? (
        <Card className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-primary-foreground/70 uppercase tracking-wider font-medium">Current Plan</p>
                <p className="text-lg font-bold">{activeSub.plan_name || 'Membership'}</p>
              </div>
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 capitalize text-xs">
                {activeSub.status}
              </Badge>
            </div>
            <div className="border-t border-primary-foreground/20 pt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-primary-foreground/60 uppercase">Expires</p>
                <p className="text-sm font-semibold">{format(parseISO(activeSub.end_date), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-[10px] text-primary-foreground/60 uppercase">Days Left</p>
                <p className={cn('text-sm font-semibold', daysRemaining !== null && daysRemaining <= 7 && 'text-warning')}>
                  {daysRemaining} days
                </p>
              </div>
            </div>
            <div className="h-1.5 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-foreground rounded-full"
                style={{
                  width: `${Math.max(5, Math.min(100, (daysRemaining ?? 0) / Math.max(differenceInDays(parseISO(activeSub.end_date), parseISO(activeSub.start_date)), 1) * 100))}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No active membership plan.</p>
            <p className="text-xs mt-1">Contact the gym to get started.</p>
          </CardContent>
        </Card>
      )}

      {/* Profile Info */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Your Profile</h3>
          <div className="space-y-2 text-sm">
            {member.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span>{member.email}</span>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{member.phone}</span>
              </div>
            )}
            {member.date_of_birth && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{format(parseISO(member.date_of_birth), 'dd MMM yyyy')}</span>
              </div>
            )}
            {member.gender && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="capitalize">{member.gender}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {member.emergency_contact_name && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-destructive mb-1">Emergency Contact</p>
            <p className="text-sm text-foreground">{member.emergency_contact_name}</p>
            {member.emergency_contact_phone && (
              <p className="text-sm text-muted-foreground">{member.emergency_contact_phone}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
