import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useLeads, Lead, LEAD_STATUSES } from '@/hooks/useLeads';
import { LeadCard } from '@/components/leads/LeadCard';
import { AddLeadDialog } from '@/components/leads/AddLeadDialog';
import { AddActivityDialog } from '@/components/leads/AddActivityDialog';
import { LeadDetailDialog } from '@/components/leads/LeadDetailDialog';
import { formatMaluti } from '@/lib/currency';
import { Plus, Target, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';

export function LeadsPipeline() {
  const { leads, isLoading } = useLeads();
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [addActivityLead, setAddActivityLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  // Calculate stats
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status)).length;
  const wonLeads = leads.filter(l => l.status === 'won');
  const totalPipelineValue = leads
    .filter(l => !['won', 'lost'].includes(l.status))
    .reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const overdueFollowups = leads.filter(l => 
    l.next_follow_up && isPast(parseISO(l.next_follow_up)) && !['won', 'lost'].includes(l.status)
  ).length;

  // Group leads by status
  const leadsByStatus = LEAD_STATUSES.reduce((acc, status) => {
    acc[status.value] = leads.filter(l => l.status === status.value);
    return acc;
  }, {} as Record<string, Lead[]>);

  const handleViewDetails = (lead: Lead) => {
    setDetailLead(lead);
  };

  const handleAddActivity = (lead: Lead) => {
    setAddActivityLead(lead);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Leads Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading leads...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Leads Pipeline
            </CardTitle>
            <Button size="sm" onClick={() => setAddLeadOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Lead
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50">
              <div className="p-1.5 md:p-2 rounded-full bg-primary/10 shrink-0">
                <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold">{activeLeads}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">Active Leads</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50">
              <div className="p-1.5 md:p-2 rounded-full bg-blue-500/10 shrink-0">
                <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold truncate">{formatMaluti(totalPipelineValue)}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">Pipeline Value</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50">
              <div className="p-1.5 md:p-2 rounded-full bg-green-500/10 shrink-0">
                <Target className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold">{wonLeads.length}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">Won ({formatMaluti(wonValue)})</p>
              </div>
            </div>
            {overdueFollowups > 0 && (
              <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-destructive/10">
                <div className="p-1.5 md:p-2 rounded-full bg-destructive/20 shrink-0">
                  <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-destructive" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-destructive">{overdueFollowups}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">Overdue Follow-ups</p>
                </div>
              </div>
            )}
          </div>

          {/* Pipeline Status Summary - Horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide pb-1">
            {LEAD_STATUSES.map((status) => {
              const count = leadsByStatus[status.value]?.length || 0;
              return (
                <Badge
                  key={status.value}
                  variant="outline"
                  className="flex items-center gap-1.5 shrink-0 text-xs"
                >
                  <div className={`w-2 h-2 rounded-full ${status.color}`} />
                  {status.label}: {count}
                </Badge>
              );
            })}
          </div>

          {/* Leads Grid */}
          {totalLeads === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No leads yet</p>
              <p className="text-sm">Add your first lead to start tracking potential deals.</p>
              <Button className="mt-4" onClick={() => setAddLeadOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Your First Lead
              </Button>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                {leads
                  .filter(l => !['won', 'lost'].includes(l.status))
                  .slice(0, 8)
                  .map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onViewDetails={handleViewDetails}
                      onAddActivity={handleAddActivity}
                    />
                  ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

          {activeLeads > 8 && (
            <div className="text-center">
              <Button variant="outline" size="sm">
                View All {activeLeads} Leads
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddLeadDialog open={addLeadOpen} onOpenChange={setAddLeadOpen} />
      <AddActivityDialog 
        open={!!addActivityLead} 
        onOpenChange={(open) => !open && setAddActivityLead(null)} 
        lead={addActivityLead} 
      />
      <LeadDetailDialog
        open={!!detailLead}
        onOpenChange={(open) => !open && setDetailLead(null)}
        lead={detailLead}
        onAddActivity={() => {
          if (detailLead) {
            setAddActivityLead(detailLead);
          }
        }}
      />
    </>
  );
}
