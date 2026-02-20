import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGymMemberSubscriptions } from '@/hooks/useGymMemberSubscriptions';
import { useGymMembers } from '@/hooks/useGymMembers';
import { useCurrency } from '@/hooks/useCurrency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft, ChevronRight, Search, CheckCircle2, AlertCircle,
  TrendingUp, DollarSign, Users, Clock, CheckCheck
} from 'lucide-react';
import {
  format, parseISO,
  startOfMonth, endOfMonth, addMonths, subMonths,
  startOfWeek, endOfWeek, addWeeks, subWeeks,
} from 'date-fns';

type Granularity = 'month' | 'week';

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function getPeriodBounds(anchor: Date, gran: Granularity) {
  if (gran === 'month') {
    return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  }
  return {
    start: startOfWeek(anchor, { weekStartsOn: 1 }),
    end: endOfWeek(anchor, { weekStartsOn: 1 }),
  };
}

function formatPeriodLabel(anchor: Date, gran: Granularity) {
  if (gran === 'month') return format(anchor, 'MMMM yyyy');
  const { start, end } = getPeriodBounds(anchor, gran);
  return `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;
}

function stepBack(anchor: Date, gran: Granularity) {
  return gran === 'month' ? subMonths(anchor, 1) : subWeeks(anchor, 1);
}
function stepForward(anchor: Date, gran: Granularity) {
  return gran === 'month' ? addMonths(anchor, 1) : addWeeks(anchor, 1);
}

export default function GymPayments() {
  const { subscriptions, isLoading, updateSubscription } = useGymMemberSubscriptions();
  const { members } = useGymMembers();
  const { fc } = useCurrency();

  const [granularity, setGranularity] = useState<Granularity>('month');
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [search, setSearch] = useState('');
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  const memberMap = useMemo(() => {
    const map = new Map<string, { name: string; memberId?: string }>();
    members.forEach(m => map.set(m.id, {
      name: `${m.firstName} ${m.lastName}`,
      memberId: (m as any).memberId ?? (m as any).member_id,
    }));
    return map;
  }, [members]);

  const { start: periodStart, end: periodEnd } = getPeriodBounds(anchor, granularity);

  const inPeriod = useMemo(() => {
    return subscriptions.filter(s => {
      const d = parseISO(s.startDate);
      return d >= periodStart && d <= periodEnd;
    });
  }, [subscriptions, periodStart, periodEnd]);

  const filtered = useMemo(() => {
    if (!search.trim()) return inPeriod;
    const q = search.toLowerCase();
    return inPeriod.filter(s => {
      const info = memberMap.get(s.memberId);
      return (
        (info?.name ?? '').toLowerCase().includes(q) ||
        (s.planName ?? '').toLowerCase().includes(q)
      );
    });
  }, [inPeriod, search, memberMap]);

  const unpaid = useMemo(() => filtered.filter(s => s.paymentStatus !== 'paid'), [filtered]);
  const paid   = useMemo(() => filtered.filter(s => s.paymentStatus === 'paid'),  [filtered]);

  const collected    = useMemo(() => inPeriod.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + s.amountPaid, 0), [inPeriod]);
  const outstanding  = useMemo(() => inPeriod.filter(s => s.paymentStatus !== 'paid').reduce((sum, s) => sum + (s.planPrice ?? s.amountPaid), 0), [inPeriod]);
  const paidCount    = useMemo(() => inPeriod.filter(s => s.paymentStatus === 'paid').length, [inPeriod]);
  const unpaidCount  = useMemo(() => inPeriod.filter(s => s.paymentStatus !== 'paid').length, [inPeriod]);

  const handleMarkPaid = async (id: string) => {
    setMarkingPaid(id);
    await updateSubscription(id, { payment_status: 'paid' });
    setMarkingPaid(null);
  };

  const fmtDate = (d: string) => {
    try { return format(parseISO(d), 'd MMM yyyy'); } catch { return d; }
  };

  const isCurrentPeriod = (() => {
    const now = new Date();
    const { start, end } = getPeriodBounds(now, granularity);
    return anchor >= start && anchor <= end;
  })();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gym Payments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track subscription payments by billing period</p>
        </div>

        {/* Period Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 flex-1 bg-muted/40 rounded-xl px-1 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setAnchor(a => stepBack(a, granularity))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="font-semibold text-foreground text-sm">
                {formatPeriodLabel(anchor, granularity)}
              </span>
              {isCurrentPeriod && (
                <span className="ml-2 text-[10px] font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  Current
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setAnchor(a => stepForward(a, granularity))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select value={granularity} onValueChange={v => setGranularity(v as Granularity)}>
            <SelectTrigger className="w-28 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Collected',
              icon: <TrendingUp className="h-3.5 w-3.5" />,
              value: isLoading ? null : fc(collected),
              color: 'text-foreground',
            },
            {
              label: 'Outstanding',
              icon: <DollarSign className="h-3.5 w-3.5" />,
              value: isLoading ? null : fc(outstanding),
              color: outstanding > 0 ? 'text-destructive' : 'text-foreground',
            },
            {
              label: 'Paid Members',
              icon: <Users className="h-3.5 w-3.5 text-[hsl(var(--chart-2))]" />,
              value: isLoading ? null : String(paidCount),
              color: 'text-[hsl(var(--chart-2))]',
            },
            {
              label: 'Unpaid',
              icon: <Clock className="h-3.5 w-3.5 text-[hsl(var(--chart-4))]" />,
              value: isLoading ? null : String(unpaidCount),
              color: unpaidCount > 0 ? 'text-[hsl(var(--chart-4))]' : 'text-foreground',
            },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1.5">
                  {stat.icon}
                  <span className="font-medium">{stat.label}</span>
                </div>
                {stat.value === null
                  ? <Skeleton className="h-7 w-20" />
                  : <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                }
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search member or plan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No subscriptions in this period</p>
            <p className="text-sm">Navigate to a different period or assign membership plans to members.</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Unpaid Section */}
            {unpaid.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive uppercase tracking-wide">
                    Unpaid ({unpaid.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {unpaid.map(sub => {
                    const info = memberMap.get(sub.memberId);
                    const name = info?.name ?? 'Unknown Member';
                    return (
                      <Card key={sub.id} className="border-destructive/20 bg-destructive/5">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="h-9 w-9 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-destructive">{getInitials(name)}</span>
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-sm truncate">{name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {sub.planName ?? '—'} · {fmtDate(sub.startDate)} → {fmtDate(sub.endDate)}
                              </p>
                            </div>
                            {/* Amount + Action */}
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <p className="font-bold text-foreground text-sm">{fc(sub.amountPaid || sub.planPrice || 0)}</p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-[hsl(var(--chart-2)/0.5)] text-[hsl(var(--chart-2))] hover:bg-[hsl(var(--chart-2)/0.1)] hover:border-[hsl(var(--chart-2))]"
                                onClick={() => handleMarkPaid(sub.id)}
                                disabled={markingPaid === sub.id}
                              >
                                <CheckCheck className="h-3.5 w-3.5" />
                                {markingPaid === sub.id ? 'Saving…' : 'Mark Paid'}
                              </Button>
                            </div>
                          </div>
                          {/* Status badges */}
                          <div className="flex gap-1.5 mt-2 ml-12">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30">
                              {sub.paymentStatus === 'overdue' ? 'Overdue' : 'Pending'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-border capitalize">
                              {sub.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Paid Section */}
            {paid.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                  <span className="text-sm font-semibold text-[hsl(var(--chart-2))] uppercase tracking-wide">
                    Paid ({paid.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {paid.map(sub => {
                    const info = memberMap.get(sub.memberId);
                    const name = info?.name ?? 'Unknown Member';
                    return (
                      <Card key={sub.id} className="border-[hsl(var(--chart-2)/0.2)] bg-[hsl(var(--chart-2)/0.04)]">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="h-9 w-9 rounded-full bg-[hsl(var(--chart-2)/0.15)] flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-[hsl(var(--chart-2))]">{getInitials(name)}</span>
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-sm truncate">{name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {sub.planName ?? '—'} · {fmtDate(sub.startDate)} → {fmtDate(sub.endDate)}
                              </p>
                            </div>
                            {/* Amount + Check */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <p className="font-bold text-foreground text-sm">{fc(sub.amountPaid)}</p>
                              <div className="flex items-center gap-1 text-[hsl(var(--chart-2))]">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">Paid</span>
                              </div>
                            </div>
                          </div>
                          {/* Sub status badge */}
                          <div className="flex gap-1.5 mt-2 ml-12">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-[hsl(var(--chart-2)/0.1)] text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2)/0.3)]">
                              Paid
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-border capitalize">
                              {sub.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
