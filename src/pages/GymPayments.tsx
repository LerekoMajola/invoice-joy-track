import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGymMemberSubscriptions } from '@/hooks/useGymMemberSubscriptions';
import { useGymMembers } from '@/hooks/useGymMembers';
import { useCurrency } from '@/hooks/useCurrency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, CheckCircle, Clock, DollarSign, Search, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  paid:    { label: 'Paid',    className: 'bg-[hsl(var(--chart-2)/0.15)] text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2)/0.3)]' },
  pending: { label: 'Pending', className: 'bg-[hsl(var(--chart-4)/0.15)] text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4)/0.3)]' },
  overdue: { label: 'Overdue', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const subStatusConfig: Record<string, { label: string; className: string }> = {
  active:    { label: 'Active',    className: 'bg-primary/10 text-primary border-primary/30' },
  frozen:    { label: 'Frozen',    className: 'bg-[hsl(var(--chart-1)/0.15)] text-[hsl(var(--chart-1))] border-[hsl(var(--chart-1)/0.3)]' },
  expired:   { label: 'Expired',   className: 'bg-muted text-muted-foreground border-border' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-border' },
};

export default function GymPayments() {
  const { subscriptions, isLoading, updateSubscription } = useGymMemberSubscriptions();
  const { members } = useGymMembers();
  const { fc } = useCurrency();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  // Build member lookup map
  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach(m => map.set(m.id, `${m.firstName} ${m.lastName}`));
    return map;
  }, [members]);

  // Stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const revenueThisMonth = useMemo(() =>
    subscriptions
      .filter(s => s.startDate >= monthStart)
      .reduce((sum, s) => sum + s.amountPaid, 0),
    [subscriptions, monthStart]
  );

  const allTimeRevenue = useMemo(() =>
    subscriptions.reduce((sum, s) => sum + s.amountPaid, 0),
    [subscriptions]
  );

  const paidCount = useMemo(() =>
    subscriptions.filter(s => s.paymentStatus === 'paid').length,
    [subscriptions]
  );

  const pendingOverdueCount = useMemo(() =>
    subscriptions.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'overdue').length,
    [subscriptions]
  );

  // Filtered list
  const filtered = useMemo(() => {
    return subscriptions.filter(s => {
      const memberName = memberMap.get(s.memberId) ?? '';
      const matchesSearch =
        search === '' ||
        memberName.toLowerCase().includes(search.toLowerCase()) ||
        (s.planName ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, statusFilter, search, memberMap]);

  const handleMarkPaid = async (id: string) => {
    setMarkingPaid(id);
    await updateSubscription(id, { payment_status: 'paid' });
    setMarkingPaid(null);
  };

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gym Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">All member subscription payments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Revenue This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {isLoading ? <Skeleton className="h-7 w-24" /> :
                <p className="text-xl font-bold text-foreground">{fc(revenueThisMonth)}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> All-Time Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {isLoading ? <Skeleton className="h-7 w-24" /> :
                <p className="text-xl font-bold text-foreground">{fc(allTimeRevenue)}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--chart-2))]" /> Total Paid
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {isLoading ? <Skeleton className="h-7 w-10" /> :
                <p className="text-xl font-bold text-[hsl(var(--chart-2))]">{paidCount}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[hsl(var(--chart-4))]" /> Pending / Overdue
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {isLoading ? <Skeleton className="h-7 w-10" /> :
                <p className="text-xl font-bold text-[hsl(var(--chart-4))]">{pendingOverdueCount}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search member or plan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No payments found</p>
            <p className="text-sm">Assign a membership plan to a member to record a payment.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(sub => {
              const memberName = memberMap.get(sub.memberId) ?? 'Unknown Member';
              const pCfg = paymentStatusConfig[sub.paymentStatus] ?? paymentStatusConfig.pending;
              const sCfg = subStatusConfig[sub.status] ?? subStatusConfig.active;
              const isPending = sub.paymentStatus !== 'paid';

              return (
                <Card key={sub.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground truncate">{memberName}</p>
                          <Badge variant="outline" className={`text-[10px] px-2 py-0 ${pCfg.className}`}>
                            {pCfg.label}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] px-2 py-0 ${sCfg.className}`}>
                            {sCfg.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{sub.planName ?? '—'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="font-bold text-foreground">{fc(sub.amountPaid)}</p>
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2)/0.4)] hover:bg-[hsl(var(--chart-2)/0.1)]"
                            onClick={() => handleMarkPaid(sub.id)}
                            disabled={markingPaid === sub.id}
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
