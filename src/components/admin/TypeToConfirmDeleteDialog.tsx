import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TypeToConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  onConfirm: () => void;
}

export function TypeToConfirmDeleteDialog({
  open,
  onOpenChange,
  companyName,
  onConfirm,
}: TypeToConfirmDeleteDialogProps) {
  const [typed, setTyped] = useState('');

  const isMatch = typed === companyName;

  const handleOpenChange = (val: boolean) => {
    if (!val) setTyped('');
    onOpenChange(val);
  };

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm();
      setTyped('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Tenant
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              This will soft-delete <strong className="text-foreground">{companyName}</strong> and
              their subscription. The data will be moved to the recycle bin for 90 days.
            </p>
            <p>
              To confirm, type the company name exactly:
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm font-mono font-semibold text-destructive select-all">
            {companyName}
          </div>
          <Input
            placeholder="Type company name to confirm..."
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!isMatch}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
