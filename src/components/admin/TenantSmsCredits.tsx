import { useState } from 'react';
import { MessageSquare, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSmsCredits } from '@/hooks/useSmsCredits';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TenantSmsCreditsProps {
  tenantUserId: string;
}

export function TenantSmsCredits({ tenantUserId }: TenantSmsCreditsProps) {
  const { credits, creditsRemaining, creditsAllocated, creditsUsed, smsLogs, updateCredits } = useSmsCredits(tenantUserId);
  const [newAllocation, setNewAllocation] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  const handleUpdateCredits = () => {
    const val = parseInt(newAllocation);
    if (isNaN(val) || val < 0) {
      toast.error('Enter a valid number');
      return;
    }
    updateCredits.mutate({ allocatedCredits: val }, {
      onSuccess: () => {
        toast.success('SMS credits updated');
        setNewAllocation('');
      },
      onError: () => toast.error('Failed to update credits'),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <h4 className="font-medium">SMS Credits</h4>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-lg bg-muted">
          <div className="text-2xl font-bold">{creditsAllocated}</div>
          <div className="text-xs text-muted-foreground">Allocated</div>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <div className="text-2xl font-bold">{creditsUsed}</div>
          <div className="text-xs text-muted-foreground">Used</div>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <div className="text-2xl font-bold text-primary">{creditsRemaining}</div>
          <div className="text-xs text-muted-foreground">Remaining</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Set monthly allocation"
          value={newAllocation}
          onChange={(e) => setNewAllocation(e.target.value)}
          className="flex-1"
        />
        <Button size="sm" onClick={handleUpdateCredits} disabled={updateCredits.isPending}>
          Update
        </Button>
      </div>

      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowLogs(!showLogs)}>
        {showLogs ? 'Hide' : 'Show'} SMS History
      </Button>

      {showLogs && smsLogs && smsLogs.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {smsLogs.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted">
              <div className="truncate flex-1">
                <span className="text-muted-foreground">{log.phone_number}</span>
                <span className="mx-1">·</span>
                <span className="truncate">{log.message?.slice(0, 40)}</span>
              </div>
              <Badge variant={log.status === 'sent' ? 'default' : 'destructive'} className="ml-2 text-[10px]">
                {log.status}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {showLogs && (!smsLogs || smsLogs.length === 0) && (
        <p className="text-xs text-muted-foreground text-center py-2">No SMS sent this month</p>
      )}
    </div>
  );
}
