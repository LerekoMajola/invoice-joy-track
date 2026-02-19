import { useState } from 'react';
import { AdminProspect, ProspectStatus } from '@/hooks/useAdminProspects';
import { ProspectCard } from './ProspectCard';
import { AddProspectDialog } from './AddProspectDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProspectKanbanProps {
  prospects: AdminProspect[];
  onCardClick: (prospect: AdminProspect) => void;
  moveProspect: (id: string, status: ProspectStatus) => Promise<void>;
  createProspect: (data: Omit<AdminProspect, 'id' | 'created_at' | 'updated_at'>) => Promise<AdminProspect | null>;
}

const STAGES: { key: ProspectStatus; label: string; color: string; headerColor: string }[] = [
  { key: 'lead',        label: 'Lead',          color: 'border-t-blue-500',    headerColor: 'text-blue-600' },
  { key: 'contacted',   label: 'Contacted',     color: 'border-t-purple-500',  headerColor: 'text-purple-600' },
  { key: 'demo',        label: 'Demo Booked',   color: 'border-t-teal-500',    headerColor: 'text-teal-600' },
  { key: 'proposal',    label: 'Proposal Sent', color: 'border-t-yellow-500',  headerColor: 'text-yellow-600' },
  { key: 'negotiation', label: 'Negotiation',   color: 'border-t-orange-500',  headerColor: 'text-orange-600' },
  { key: 'won',         label: 'Won',           color: 'border-t-green-500',   headerColor: 'text-green-600' },
  { key: 'lost',        label: 'Lost',          color: 'border-t-red-500',     headerColor: 'text-red-600' },
];

export function ProspectKanban({ prospects, onCardClick, moveProspect, createProspect }: ProspectKanbanProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ProspectStatus | null>(null);
  const [addDialogStage, setAddDialogStage] = useState<ProspectStatus | null>(null);

  const byStage = (stage: ProspectStatus) => prospects.filter(p => p.status === stage);

  const handleDrop = (e: React.DragEvent, stage: ProspectStatus) => {
    e.preventDefault();
    if (draggingId) moveProspect(draggingId, stage);
    setDraggingId(null);
    setDragOverStage(null);
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
        {STAGES.map(stage => {
          const cards = byStage(stage.key);
          const stageValue = cards.reduce((sum, p) => sum + (p.estimated_value || 0), 0);
          const isOver = dragOverStage === stage.key;

          return (
            <div
              key={stage.key}
              className={`flex flex-col shrink-0 w-64 bg-muted/30 rounded-xl border-t-4 ${stage.color} border border-border/50 transition-colors ${isOver ? 'bg-primary/5 border-primary/30' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOverStage(stage.key); }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={e => handleDrop(e, stage.key)}
            >
              {/* Column Header */}
              <div className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-sm ${stage.headerColor}`}>{stage.label}</span>
                  <span className="bg-muted text-muted-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">{cards.length}</span>
                </div>
                {stageValue > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">${stageValue.toLocaleString()}</p>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 px-3 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)]">
                {cards.map(prospect => (
                  <ProspectCard
                    key={prospect.id}
                    prospect={prospect}
                    onClick={() => onCardClick(prospect)}
                    onDragStart={e => {
                      setDraggingId(prospect.id);
                      e.dataTransfer.setData('text/plain', prospect.id);
                    }}
                  />
                ))}
                {cards.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    Drop here
                  </div>
                )}
              </div>

              {/* Add button */}
              <div className="px-3 pb-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-foreground h-7 text-xs"
                  onClick={() => setAddDialogStage(stage.key)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <AddProspectDialog
        open={addDialogStage !== null}
        onOpenChange={open => !open && setAddDialogStage(null)}
        defaultStatus={addDialogStage || 'lead'}
        createProspect={createProspect}
      />
    </>
  );
}
