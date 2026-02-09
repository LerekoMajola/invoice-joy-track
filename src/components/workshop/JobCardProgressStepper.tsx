import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { JobCardStatus } from '@/hooks/useJobCards';

const stages = [
  { key: 'intake', label: 'Intake' },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'quote', label: 'Quote' },
  { key: 'work', label: 'Work' },
  { key: 'complete', label: 'Complete' },
  { key: 'invoice', label: 'Invoice' },
] as const;

type Stage = (typeof stages)[number]['key'];

const statusToStage: Record<JobCardStatus, Stage> = {
  received: 'intake',
  diagnosing: 'diagnosis',
  diagnosed: 'diagnosis',
  quoted: 'quote',
  approved: 'quote',
  in_progress: 'work',
  awaiting_parts: 'work',
  quality_check: 'complete',
  completed: 'complete',
  invoiced: 'invoice',
  collected: 'invoice',
};

function getStageIndex(status: JobCardStatus): number {
  const stage = statusToStage[status];
  return stages.findIndex((s) => s.key === stage);
}

interface Props {
  status: JobCardStatus;
}

export function JobCardProgressStepper({ status }: Props) {
  const currentIndex = getStageIndex(status);

  return (
    <div className="flex items-center gap-0.5 w-full px-1">
      {stages.map((stage, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={stage.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors shrink-0',
                  isCompleted && 'bg-success text-success-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-[9px] mt-0.5 truncate max-w-full text-center',
                  isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                )}
              >
                {stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 min-w-1 mx-0.5 rounded-full -mt-3',
                  i < currentIndex ? 'bg-success' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
