import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AutoSaveStatus } from '@/hooks/useAutoSaveDraft';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}

export function AutoSaveIndicator({ status, lastSavedAt, className }: AutoSaveIndicatorProps) {
  const formatTime = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  let content: React.ReactNode = null;
  let toneClass = 'text-muted-foreground';

  if (status === 'saving') {
    content = (
      <>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Saving…</span>
      </>
    );
  } else if (status === 'error') {
    toneClass = 'text-destructive';
    content = (
      <>
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Save failed — will retry</span>
      </>
    );
  } else if (status === 'saved' && lastSavedAt) {
    toneClass = 'text-success';
    content = (
      <>
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Saved {formatTime(lastSavedAt)}</span>
      </>
    );
  } else {
    content = <span className="opacity-60">Auto-save on</span>;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium',
        toneClass,
        className
      )}
      aria-live="polite"
    >
      {content}
    </div>
  );
}
