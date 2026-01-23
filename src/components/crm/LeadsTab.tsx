import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2, 
  UserPlus,
  Filter,
  Loader2,
  Target
} from 'lucide-react';
import { useLeads, Lead, LEAD_STATUSES, LEAD_PRIORITIES, LEAD_SOURCES } from '@/hooks/useLeads';
import { formatMaluti } from '@/lib/currency';
import { format, isPast, parseISO } from 'date-fns';
import { AddLeadDialog } from '@/components/leads/AddLeadDialog';
import { LeadDetailDialog } from '@/components/leads/LeadDetailDialog';
import { AddActivityDialog } from '@/components/leads/AddActivityDialog';

export function LeadsTab() {
  const { leads, isLoading, deleteLead, convertToClient } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (lead.phone?.includes(searchQuery) || false);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = LEAD_STATUSES.find(s => s.value === status);
    return (
      <Badge variant="secondary" className={`${statusConfig?.color} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority}
      </Badge>
    );
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailDialogOpen(true);
  };

  const handleAddActivity = (lead: Lead) => {
    setSelectedLead(lead);
    setActivityDialogOpen(true);
  };

  const handleConvert = async (lead: Lead) => {
    await convertToClient(lead);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {LEAD_PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[130px] hidden lg:flex">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {LEAD_SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Target className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No leads found</p>
            <p className="text-sm">
              {leads.length === 0 ? 'Add your first lead to get started' : 'Try adjusting your filters'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredLeads.map((lead) => (
              <div 
                key={lead.id} 
                className="mobile-card cursor-pointer"
                onClick={() => handleViewDetails(lead)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-card-foreground truncate">{lead.name}</p>
                      {getPriorityBadge(lead.priority)}
                    </div>
                    {lead.company && (
                      <p className="text-sm text-muted-foreground">{lead.company}</p>
                    )}
                  </div>
                  {getStatusBadge(lead.status)}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  {lead.estimated_value && (
                    <span className="font-medium text-primary">
                      {formatMaluti(lead.estimated_value)}
                    </span>
                  )}
                  {lead.next_follow_up && (
                    <span className={isPast(parseISO(lead.next_follow_up)) ? 'text-destructive' : ''}>
                      Follow-up: {format(parseISO(lead.next_follow_up), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold">Name / Company</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Value</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">Follow-up</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetails(lead)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        {lead.company && (
                          <p className="text-sm text-muted-foreground">{lead.company}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {lead.email && <p>{lead.email}</p>}
                        {lead.phone && <p className="text-muted-foreground">{lead.phone}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.estimated_value ? (
                        <span className="font-medium">{formatMaluti(lead.estimated_value)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
                    <TableCell>
                      {lead.next_follow_up ? (
                        <span className={isPast(parseISO(lead.next_follow_up)) ? 'text-destructive' : ''}>
                          {format(parseISO(lead.next_follow_up), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(lead)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddActivity(lead)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Add Note
                          </DropdownMenuItem>
                          {lead.status !== 'won' && lead.status !== 'lost' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleConvert(lead)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Convert to Client
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteLead(lead.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Leads</p>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">
            {leads.filter(l => !['won', 'lost'].includes(l.status)).length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pipeline Value</p>
          <p className="text-2xl font-bold">
            {formatMaluti(
              leads
                .filter(l => !['won', 'lost'].includes(l.status))
                .reduce((sum, l) => sum + (l.estimated_value || 0), 0)
            )}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Won This Month</p>
          <p className="text-2xl font-bold text-green-600">
            {leads.filter(l => l.status === 'won').length}
          </p>
        </div>
      </div>

      {/* Dialogs */}
      <AddLeadDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <LeadDetailDialog 
        open={detailDialogOpen} 
        onOpenChange={setDetailDialogOpen}
        lead={selectedLead}
        onAddActivity={() => {
          setDetailDialogOpen(false);
          setActivityDialogOpen(true);
        }}
      />
      <AddActivityDialog 
        open={activityDialogOpen} 
        onOpenChange={setActivityDialogOpen}
        lead={selectedLead}
      />
    </div>
  );
}
