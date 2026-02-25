import { useState } from 'react';
import { useAdminProspects, AdminProspect } from '@/hooks/useAdminProspects';
import { useAdminLeadStats } from '@/hooks/useAdminLeadStats';
import { ProspectKanban } from './ProspectKanban';
import { ProspectDetailSheet } from './ProspectDetailSheet';
import { AddProspectDialog } from './AddProspectDialog';
import { ImportProspectsDialog } from './ImportProspectsDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Kanban, List, DollarSign, TrendingUp, TrendingDown, Users, Bell, Upload, Target } from 'lucide-react';
import { format } from 'date-fns';
import { formatMaluti } from '@/lib/currency';

const statusColors: Record<string, string> = {
  lead:        'bg-blue-100 text-blue-700',
  contacted:   'bg-purple-100 text-purple-700',
  demo:        'bg-teal-100 text-teal-700',
  proposal:    'bg-yellow-100 text-yellow-700',
  negotiation: 'bg-orange-100 text-orange-700',
  won:         'bg-green-100 text-green-700',
  lost:        'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  lead: 'Lead', contacted: 'Contacted', demo: 'Demo Booked',
  proposal: 'Proposal Sent', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};

const priorityBadge: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-destructive/10 text-destructive',
};

export function AdminCRMTab() {
  const { prospects, loading, stats, createProspect, updateProspect, deleteProspect, moveProspect, fetchActivities, addActivity, fetchProspects } = useAdminProspects();
  const { stats: leadStats, loading: leadStatsLoading } = useAdminLeadStats();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProspect, setSelectedProspect] = useState<AdminProspect | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const filtered = prospects.filter(p => {
    const matchSearch =
      !search ||
      p.company_name.toLowerCase().includes(search.toLowerCase()) ||
      p.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openDetail = (prospect: AdminProspect) => {
    setSelectedProspect(prospect);
    setSheetOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const leadStatCards = [
    { title: 'Total Leads', value: leadStats.totalLeads.toLocaleString(), desc: 'All tenant leads', icon: Users },
    { title: 'Won Deals', value: leadStats.wonCount.toLocaleString(), desc: 'Converted leads', icon: TrendingUp },
    { title: 'Lost Deals', value: leadStats.lostCount.toLocaleString(), desc: 'Lost leads', icon: TrendingDown },
    { title: 'Active Pipeline', value: formatMaluti(leadStats.totalPipelineValue), desc: 'Est. value', icon: DollarSign },
    { title: 'Conversion Rate', value: `${leadStats.conversionRate.toFixed(1)}%`, desc: 'Won / (Won + Lost)', icon: Target },
  ];

  const prospectStatCards = [
    { title: 'Pipeline Value', value: `$${stats.totalPipelineValue.toLocaleString()}`, desc: 'Prospect pipeline', icon: DollarSign },
    { title: 'Weighted Value', value: `$${Math.round(stats.weightedValue).toLocaleString()}`, desc: 'Probability-adjusted', icon: TrendingUp },
    { title: 'Active Prospects', value: stats.activeCount.toLocaleString(), desc: 'In pipeline', icon: Users },
    { title: 'Follow-ups Due', value: stats.followUpsDueToday.toLocaleString(), desc: 'Due today', icon: Bell },
  ];

  return (
    <div className="space-y-5">
      {/* Platform Lead Stats */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Platform Lead Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {leadStatCards.map(card => (
            <div
              key={card.title}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/80">{card.title}</span>
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-xl font-bold">{leadStatsLoading ? '…' : card.value}</div>
              <p className="text-xs text-white/70 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prospect Stats */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Prospect Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {prospectStatCards.map(card => (
            <div
              key={card.title}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/80">{card.title}</span>
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-xl font-bold">{card.value}</div>
              <p className="text-xs text-white/70 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prospects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
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
        <div className="flex gap-2 items-center">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={view === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setView('kanban')}
            >
              <Kanban className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-1" /> Import CSV
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Prospect
          </Button>
        </div>
      </div>

      {/* Views */}
      {view === 'kanban' ? (
        <ProspectKanban
          prospects={filtered}
          onCardClick={openDetail}
          moveProspect={moveProspect}
          createProspect={createProspect}
        />
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Win %</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead>Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No prospects found. Add your first prospect!
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(p => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => openDetail(p)}>
                    <TableCell className="font-medium">{p.company_name}</TableCell>
                    <TableCell>
                      <div>{p.contact_name}</div>
                      {p.email && <div className="text-xs text-muted-foreground">{p.email}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusColors[p.status]}`} variant="secondary">
                        {statusLabels[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs capitalize ${priorityBadge[p.priority]}`} variant="secondary">
                        {p.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>${(p.estimated_value || 0).toLocaleString()}</TableCell>
                    <TableCell>{p.win_probability}%</TableCell>
                    <TableCell>
                      {p.next_follow_up ? (
                        <span className={p.next_follow_up <= new Date().toISOString().split('T')[0] ? 'text-destructive font-medium' : ''}>
                          {format(new Date(p.next_follow_up), 'dd MMM yyyy')}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{p.interested_plan || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ProspectDetailSheet
        prospect={selectedProspect}
        open={sheetOpen}
        onOpenChange={open => {
          setSheetOpen(open);
          if (!open) setSelectedProspect(null);
        }}
        updateProspect={updateProspect}
        deleteProspect={deleteProspect}
        fetchActivities={fetchActivities}
        addActivity={addActivity}
      />

      <AddProspectDialog open={addOpen} onOpenChange={setAddOpen} createProspect={createProspect} />
      <ImportProspectsDialog open={importOpen} onOpenChange={setImportOpen} onImported={fetchProspects} />
    </div>
  );
}
