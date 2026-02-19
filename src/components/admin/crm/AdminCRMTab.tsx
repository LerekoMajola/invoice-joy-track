import { useState } from 'react';
import { useAdminProspects, AdminProspect } from '@/hooks/useAdminProspects';
import { ProspectKanban } from './ProspectKanban';
import { ProspectDetailSheet } from './ProspectDetailSheet';
import { AddProspectDialog } from './AddProspectDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Kanban, List, DollarSign, TrendingUp, Users, Bell } from 'lucide-react';
import { format } from 'date-fns';

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
  const { prospects, loading, stats, createProspect, updateProspect, deleteProspect, moveProspect, fetchActivities, addActivity } = useAdminProspects();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProspect, setSelectedProspect] = useState<AdminProspect | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

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
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/10"><DollarSign className="h-4 w-4 text-primary" /></div>
              <span className="text-xs text-muted-foreground">Pipeline Value</span>
            </div>
            <p className="text-xl font-bold">${stats.totalPipelineValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-success/10"><TrendingUp className="h-4 w-4 text-success" /></div>
              <span className="text-xs text-muted-foreground">Weighted Value</span>
            </div>
            <p className="text-xl font-bold">${Math.round(stats.weightedValue).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-accent"><Users className="h-4 w-4 text-accent-foreground" /></div>
              <span className="text-xs text-muted-foreground">Active Prospects</span>
            </div>
            <p className="text-xl font-bold">{stats.activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-destructive/10"><Bell className="h-4 w-4 text-destructive" /></div>
              <span className="text-xs text-muted-foreground">Follow-ups Due</span>
            </div>
            <p className="text-xl font-bold">{stats.followUpsDueToday}</p>
          </CardContent>
        </Card>
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
    </div>
  );
}
