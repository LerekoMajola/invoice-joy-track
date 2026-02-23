import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, ArrowRight, Package, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { usePackageChangeRequests, PackageChangeRequest } from '@/hooks/usePackageChangeRequests';
import { usePackageTiers } from '@/hooks/usePackageTiers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatMaluti } from '@/lib/currency';

export function PackageChangeRequests() {
  const { requests, isLoading, updateRequest } = usePackageChangeRequests(true);
  const { getTierById } = usePackageTiers();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending');

  const handleApprove = async (req: PackageChangeRequest) => {
    setProcessingId(req.id);
    try {
      const requestedTier = getTierById(req.requested_tier_id);
      if (!requestedTier) throw new Error('Requested tier not found');

      // Update subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          package_tier_id: req.requested_tier_id,
          plan: requestedTier.name as any,
        })
        .eq('user_id', req.user_id);
      if (subError) throw subError;

      // Update request status
      await updateRequest.mutateAsync({ id: req.id, status: 'approved' });

      // Notify the tenant
      await supabase.from('notifications').insert({
        user_id: req.user_id,
        type: 'payment',
        title: 'Package Switch Approved',
        message: `Your request to switch to "${requestedTier.display_name}" has been approved.`,
        link: '/billing',
      });

      toast.success(`Approved switch to ${requestedTier.display_name} for ${req.company_name}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req: PackageChangeRequest) => {
    setProcessingId(req.id);
    try {
      const note = rejectNote[req.id] || '';
      await updateRequest.mutateAsync({ id: req.id, status: 'rejected', adminNote: note });

      const requestedTier = getTierById(req.requested_tier_id);
      await supabase.from('notifications').insert({
        user_id: req.user_id,
        type: 'payment',
        title: 'Package Switch Declined',
        message: `Your request to switch to "${requestedTier?.display_name || 'new package'}" was declined.${note ? ` Reason: ${note}` : ''}`,
        link: '/billing',
      });

      toast.success('Request rejected');
      setShowRejectInput(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) return null;
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No package change requests yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Pending Requests ({pendingRequests.length})</h3>
          {pendingRequests.map((req) => {
            const currentTier = req.current_tier_id ? getTierById(req.current_tier_id) : null;
            const requestedTier = getTierById(req.requested_tier_id);
            const isProcessing = processingId === req.id;

            return (
              <Card key={req.id} className="border-warning/30 bg-warning/5">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="font-semibold text-foreground">{req.company_name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{currentTier?.display_name || 'Custom'}</Badge>
                        <ArrowRight className="h-3 w-3" />
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/30">{requestedTier?.display_name || 'Unknown'}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{currentTier ? formatMaluti(currentTier.bundle_price) : '—'} → {requestedTier ? formatMaluti(requestedTier.bundle_price) : '—'}/mo</span>
                        <span>•</span>
                        <span>{format(new Date(req.created_at), 'MMM d, yyyy HH:mm')}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-white"
                          disabled={isProcessing}
                          onClick={() => handleApprove(req)}
                        >
                          {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          disabled={isProcessing}
                          onClick={() => setShowRejectInput(showRejectInput === req.id ? null : req.id)}
                        >
                          <X className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </div>
                      {showRejectInput === req.id && (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Reason (optional)..."
                            value={rejectNote[req.id] || ''}
                            onChange={(e) => setRejectNote(prev => ({ ...prev, [req.id]: e.target.value }))}
                            className="text-xs h-16"
                          />
                          <Button size="sm" variant="destructive" className="w-full" disabled={isProcessing} onClick={() => handleReject(req)}>
                            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            Confirm Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pastRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Past Requests</h3>
          {pastRequests.slice(0, 10).map((req) => {
            const currentTier = req.current_tier_id ? getTierById(req.current_tier_id) : null;
            const requestedTier = getTierById(req.requested_tier_id);
            return (
              <Card key={req.id} className="opacity-70">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{req.company_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {currentTier?.display_name || 'Custom'} → {requestedTier?.display_name || '?'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={req.status === 'approved'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                    }>
                      {req.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(req.updated_at), 'MMM d')}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
