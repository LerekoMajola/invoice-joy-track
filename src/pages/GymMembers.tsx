import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, UserCheck, Snowflake, AlertTriangle, Plus, Search, CreditCard } from 'lucide-react';
import { useGymMembers, type GymMember } from '@/hooks/useGymMembers';
import { useGymMembershipPlans } from '@/hooks/useGymMembershipPlans';
import { useGymMemberSubscriptions } from '@/hooks/useGymMemberSubscriptions';
import { useCurrency } from '@/hooks/useCurrency';
import { AddMemberDialog } from '@/components/gym/AddMemberDialog';
import { MemberDetailDialog } from '@/components/gym/MemberDetailDialog';
import { MemberCard } from '@/components/gym/MemberCard';
import { AddMembershipPlanDialog } from '@/components/gym/AddMembershipPlanDialog';
import { differenceInDays, parseISO } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

const statusColors: Record<string, string> = {
  prospect: 'bg-muted text-muted-foreground',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  frozen: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function GymMembers() {
  const { members, isLoading, updateMember } = useGymMembers();
  const { plans, updatePlan, deletePlan } = useGymMembershipPlans();
  const { subscriptions } = useGymMemberSubscriptions();
  const { fc } = useCurrency();
  const isMobile = useIsMobile();

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GymMember | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'active').length;
    const frozen = members.filter(m => m.status === 'frozen').length;
    const today = new Date();
    const expiringThisMonth = subscriptions.filter(s => {
      if (s.status !== 'active') return false;
      const end = parseISO(s.endDate);
      const days = differenceInDays(end, today);
      return days >= 0 && days <= 30;
    }).length;
    return { total, active, frozen, expiringThisMonth };
  }, [members, subscriptions]);

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = !search || `${m.firstName} ${m.lastName} ${m.memberNumber} ${m.email || ''} ${m.phone || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage gym members and subscriptions</p>
          </div>
          <Button onClick={() => setAddMemberOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />Add Member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Members" value={String(stats.total)} icon={Users} />
          <StatCard title="Active" value={String(stats.active)} icon={UserCheck} />
          <StatCard title="Expiring Soon" value={String(stats.expiringThisMonth)} icon={AlertTriangle} />
          <StatCard title="Frozen" value={String(stats.frozen)} icon={Snowflake} />
        </div>

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="plans">Membership Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading members...</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1">No members found</h3>
                <p className="text-muted-foreground text-sm">Add your first gym member to get started.</p>
              </div>
            ) : isMobile ? (
              <div className="space-y-3">
                {filtered.map(m => (
                  <MemberCard key={m.id} member={m} onClick={() => setSelectedMember(m)} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(m => (
                      <TableRow key={m.id} className="cursor-pointer" onClick={() => setSelectedMember(m)}>
                        <TableCell className="font-mono text-xs">{m.memberNumber}</TableCell>
                        <TableCell className="font-medium">{m.firstName} {m.lastName}</TableCell>
                        <TableCell>{m.phone || '—'}</TableCell>
                        <TableCell>{m.email || '—'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[m.status]} variant="secondary">{m.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{m.joinDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setAddPlanOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />Add Plan
              </Button>
            </div>
            {plans.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1">No plans yet</h3>
                <p className="text-muted-foreground text-sm">Create your first membership plan.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map(p => (
                  <div key={p.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      {!p.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">{fc(p.price)}</span>
                      <span className="text-sm text-muted-foreground">/ {p.durationDays} days</span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{p.category.replace('_', ' ')}</span>
                      <span>Max freezes: {p.maxFreezes}</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePlan(p.id, { isActive: !p.isActive })}
                      >
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddMemberDialog open={addMemberOpen} onOpenChange={setAddMemberOpen} />
      <AddMembershipPlanDialog open={addPlanOpen} onOpenChange={setAddPlanOpen} />
      {selectedMember && (
        <MemberDetailDialog
          open={!!selectedMember}
          onOpenChange={open => { if (!open) setSelectedMember(null); }}
          member={selectedMember}
          onUpdate={updateMember}
        />
      )}
    </DashboardLayout>
  );
}
