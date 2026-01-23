import { useState } from 'react';
import { useLeads, Lead, LEAD_STATUSES } from '@/hooks/useLeads';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatMaluti } from '@/lib/currency';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import { 
  Building2, 
  DollarSign, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { LeadDetailDialog } from '@/components/leads/LeadDetailDialog';
import { AddActivityDialog } from '@/components/leads/AddActivityDialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function PipelineTab() {
  const { leads, isLoading, updateLead } = useLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  // Group leads by status
  const leadsByStatus = LEAD_STATUSES.reduce((acc, status) => {
    acc[status.value] = leads.filter(l => l.status === status.value);
    return acc;
  }, {} as Record<string, Lead[]>);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== newStatus) {
      await updateLead({ id: draggedLead.id, status: newStatus });
    }
    setDraggedLead(null);
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailDialogOpen(true);
  };

  const getStageValue = (status: string) => {
    return leadsByStatus[status]?.reduce((sum, l) => sum + (l.estimated_value || 0), 0) || 0;
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
      {/* Pipeline Overview */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {LEAD_STATUSES.map((status, index) => (
          <div key={status.value} className="flex items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span className="text-sm font-medium whitespace-nowrap">
                {status.label}
              </span>
              <Badge variant="outline" className="ml-1">
                {leadsByStatus[status.value]?.length || 0}
              </Badge>
            </div>
            {index < LEAD_STATUSES.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4" style={{ minWidth: `${LEAD_STATUSES.length * 280}px` }}>
          {LEAD_STATUSES.map((status) => (
            <div
              key={status.value}
              className="flex-1 min-w-[260px] max-w-[320px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status.value)}
            >
              <Card className={`h-full ${draggedLead?.status !== status.value ? 'ring-2 ring-transparent hover:ring-primary/20' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status.color}`} />
                      <CardTitle className="text-base">{status.label}</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      {leadsByStatus[status.value]?.length || 0}
                    </Badge>
                  </div>
                  {getStageValue(status.value) > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatMaluti(getStageValue(status.value))}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {leadsByStatus[status.value]?.map((lead) => {
                    const isOverdue = lead.next_follow_up && isPast(parseISO(lead.next_follow_up));
                    const daysInStage = differenceInDays(new Date(), parseISO(lead.updated_at));

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onClick={() => handleViewDetails(lead)}
                        className={`
                          p-3 rounded-lg border bg-background cursor-pointer
                          hover:shadow-md transition-all
                          ${draggedLead?.id === lead.id ? 'opacity-50' : ''}
                          ${isOverdue ? 'border-destructive/50' : ''}
                          ${lead.priority === 'high' ? 'border-l-4 border-l-orange-500' : ''}
                        `}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm leading-tight">{lead.name}</p>
                            {lead.priority === 'high' && (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                                Hot
                              </Badge>
                            )}
                          </div>

                          {lead.company && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {lead.company}
                            </p>
                          )}

                          {lead.estimated_value && (
                            <p className="text-sm font-medium text-primary flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatMaluti(lead.estimated_value)}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            {lead.next_follow_up && (
                              <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}>
                                {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {format(parseISO(lead.next_follow_up), 'MMM d')}
                              </span>
                            )}
                            {daysInStage > 0 && (
                              <span className="flex items-center gap-1">
                                {daysInStage}d in stage
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {(!leadsByStatus[status.value] || leadsByStatus[status.value].length === 0) && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No leads
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Dialogs */}
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
