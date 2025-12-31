import { useState } from 'react';
import { ExternalLink, Plus, Pencil, Trash2, Link2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTenderSourceLinks, TenderSourceLink, TenderSourceLinkInput } from '@/hooks/useTenderSourceLinks';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Status calculation based on last visit
const getVisitStatus = (lastVisitedAt: string | null) => {
  if (!lastVisitedAt) {
    return { color: 'red' as const, label: 'Never checked', urgent: true, days: null };
  }
  
  const daysSinceVisit = differenceInDays(new Date(), new Date(lastVisitedAt));
  
  if (daysSinceVisit <= 2) {
    return { color: 'green' as const, label: 'Recently checked', urgent: false, days: daysSinceVisit };
  } else if (daysSinceVisit <= 5) {
    return { color: 'orange' as const, label: 'Check soon', urgent: false, days: daysSinceVisit };
  } else {
    return { color: 'red' as const, label: 'Needs attention', urgent: true, days: daysSinceVisit };
  }
};

// Status indicator component
const StatusIndicator = ({ status }: { status: ReturnType<typeof getVisitStatus> }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "w-3 h-3 rounded-full shrink-0 transition-all",
            status.color === 'green' && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
            status.color === 'orange' && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
            status.color === 'red' && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
            status.urgent && "animate-pulse"
          )}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-medium">{status.label}</p>
        {status.days !== null && (
          <p className="text-muted-foreground">
            {status.days === 0 ? 'Checked today' : `${status.days} day${status.days > 1 ? 's' : ''} ago`}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function TenderSourceLinks() {
  const { links, isLoading, createLink, updateLink, deleteLink, visitLink } = useTenderSourceLinks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<TenderSourceLink | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TenderSourceLinkInput>({
    name: '',
    url: '',
    description: '',
  });

  const openAddDialog = () => {
    setEditingLink(null);
    setFormData({ name: '', url: '', description: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (link: TenderSourceLink) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      description: link.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLink) {
      await updateLink.mutateAsync({ id: editingLink.id, ...formData });
    } else {
      await createLink.mutateAsync(formData);
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteLink.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        {/* Header with title and legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-lg font-semibold text-card-foreground">
              Tender Source Links
            </h3>
            {links.length > 0 && (() => {
              const urgentCount = links.filter(l => getVisitStatus(l.last_visited_at).urgent).length;
              return urgentCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-xs font-medium">
                  <AlertCircle className="h-3 w-3" />
                  {urgentCount} need{urgentCount > 1 ? '' : 's'} attention
                </span>
              ) : null;
            })()}
          </div>
          <div className="flex items-center gap-4">
            {/* Status legend */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Fresh</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Stale</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Urgent</span>
              </div>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="gap-1.5"
              onClick={openAddDialog}
            >
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Link2 className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-medium text-card-foreground mb-1">No tender sources yet</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Add links to websites you frequently visit to check for tenders and RFQs.
            </p>
            <Button variant="outline" size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Link
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => {
              const status = getVisitStatus(link.last_visited_at);
              const handleLinkClick = () => {
                visitLink.mutate(link.id);
                window.open(link.url, '_blank', 'noopener,noreferrer');
              };

              return (
                <div
                  key={link.id}
                  className={cn(
                    "group relative flex flex-col rounded-xl border bg-gradient-to-br from-background to-muted/30 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                    status.color === 'green' && "border-emerald-500/30 hover:border-emerald-500/50",
                    status.color === 'orange' && "border-amber-500/30 hover:border-amber-500/50",
                    status.color === 'red' && "border-red-500/30 hover:border-red-500/50"
                  )}
                >
                  {/* Status accent bar */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1",
                      status.color === 'green' && "bg-emerald-500",
                      status.color === 'orange' && "bg-amber-500",
                      status.color === 'red' && "bg-red-500"
                    )}
                  />

                  <div className="p-4 pl-5 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <StatusIndicator status={status} />
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={handleLinkClick}
                          className="w-full text-left group/link"
                        >
                          <h4 className="font-semibold text-foreground truncate group-hover/link:text-primary transition-colors">
                            {link.name}
                          </h4>
                        </button>
                      </div>
                      <button
                        onClick={handleLinkClick}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Description */}
                    {link.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2 pl-6">
                        {link.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-3 pl-6">
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        status.color === 'green' && "bg-emerald-500/10 text-emerald-600",
                        status.color === 'orange' && "bg-amber-500/10 text-amber-600",
                        status.color === 'red' && "bg-red-500/10 text-red-600"
                      )}>
                        {link.last_visited_at ? (
                          formatDistanceToNow(new Date(link.last_visited_at), { addSuffix: true })
                        ) : (
                          'Never visited'
                        )}
                      </span>
                      
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openEditDialog(link)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirmId(link.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLink ? 'Edit Link' : 'Add Tender Source Link'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Government eTenders"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/tenders"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief note about what tenders are found here..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createLink.isPending || updateLink.isPending}
              >
                {editingLink ? 'Save Changes' : 'Add Link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tender source link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
