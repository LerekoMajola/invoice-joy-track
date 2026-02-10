import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import type { RecurringDocument } from '@/hooks/useRecurringDocuments';

type Frequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface SetRecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentNumber: string;
  existing: RecurringDocument | null;
  onSetRecurring: (frequency: Frequency) => void;
  onStopRecurring: () => void;
}

function computeNextDate(frequency: Frequency): string {
  const d = new Date();
  switch (frequency) {
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'quarterly': d.setMonth(d.getMonth() + 3); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function SetRecurringDialog({ open, onOpenChange, documentNumber, existing, onSetRecurring, onStopRecurring }: SetRecurringDialogProps) {
  const [frequency, setFrequency] = useState<Frequency>(existing?.frequency || 'monthly');

  const isActive = existing?.isActive;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <RefreshCw className="h-5 w-5 text-primary" />
            Recurring — {documentNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">Next document will be generated on:</p>
            <p className="text-sm font-medium mt-1">{computeNextDate(frequency)}</p>
          </div>

          {isActive && existing && (
            <div className="rounded-lg border border-success/20 bg-success/5 p-3">
              <p className="text-sm text-success font-medium">Currently active — {existing.frequency}</p>
              {existing.lastGeneratedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last generated: {new Date(existing.lastGeneratedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {isActive && (
            <Button variant="outline" className="text-destructive" onClick={() => { onStopRecurring(); onOpenChange(false); }}>
              Stop Recurring
            </Button>
          )}
          <Button onClick={() => { onSetRecurring(frequency); onOpenChange(false); }}>
            {isActive ? 'Update' : 'Set Recurring'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
