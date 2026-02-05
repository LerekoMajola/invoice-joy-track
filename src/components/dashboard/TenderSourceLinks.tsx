import { useState } from 'react';
import { ExternalLink, Plus, Pencil, Trash2, Link2, AlertCircle, Sparkles } from 'lucide-react';
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
            "w-3.5 h-3.5 rounded-full shrink-0 transition-all shadow-lg",
            status.color === 'green' && "bg-gradient-to-br from-success to-accent shadow-glow-success",
            status.color === 'orange' && "bg-gradient-to-br from-amber-500 to-warning shadow-[0_0_10px_hsl(var(--warning)/0.5)]",
            status.color === 'red' && "bg-gradient-to-br from-destructive to-coral shadow-[0_0_10px_hsl(var(--destructive)/0.5)]",
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
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-elevated">
        {/* Header with title and legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-violet text-white shadow-lg">
              <Link2 className="h-4 w-4" />
            </div>
            <h3 className="font-display text-lg font-bold text-card-foreground">
              Tender Source Links
            </h3>
            {links.length > 0 && (() => {
              const urgentCount = links.filter(l => getVisitStatus(l.last_visited_at).urgent).length;
              return urgentCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-destructive/10 to-coral/10 text-destructive text-xs font-semibold animate-pulse">
                  <AlertCircle className="h-3 w-3 animate-bounce" />
                  {urgentCount} need{urgentCount > 1 ? '' : 's'} attention
                </span>
              ) : null;
            })()}
          </div>
          <div className="flex items-center gap-4">
            {/* Status legend */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-success to-accent" />
                <span>Fresh</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-500 to-warning" />
                <span>Stale</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-destructive to-coral" />
                <span>Urgent</span>
              </div>
            </div>
            <Button 
              variant="gradient" 
              size="sm" 
              className="gap-1.5 rounded-xl"
              onClick={openAddDialog}
            >
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-violet/10 p-5 mb-4">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <h4 className="font-medium text-card-foreground mb-1">No tender sources yet</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Add links to websites you frequently visit to check for tenders and RFQs.
            </p>
            <Button variant="gradient" size="sm" onClick={openAddDialog} className="rounded-xl">
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Link
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link, index) => {
              const status = getVisitStatus(link.last_visited_at);
              const handleLinkClick = () => {
                visitLink.mutate(link.id);
                window.open(link.url, '_blank', 'noopener,noreferrer');
              };

              return (
                <div
                  key={link.id}
                  className={cn(
                    "group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-slide-up",
                    status.color === 'green' && "border-success/30 hover:border-success/50",
                    status.color === 'orange' && "border-warning/30 hover:border-warning/50",
                    status.color === 'red' && "border-destructive/30 hover:border-destructive/50"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Status accent bar */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl",
                      status.color === 'green' && "bg-gradient-to-b from-success to-accent",
                      status.color === 'orange' && "bg-gradient-to-b from-amber-500 to-warning",
                      status.color === 'red' && "bg-gradient-to-b from-destructive to-coral"
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
                          <h4 className="font-bold text-foreground truncate group-hover/link:text-primary transition-colors">
                            {link.name}
                          </h4>
                        </button>
                      </div>
                      <button
                        onClick={handleLinkClick}
                        className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0 transition-all duration-200 hover:scale-110"
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
                        status.color === 'green' && "bg-success/10 text-success",
                        status.color === 'orange' && "bg-warning/10 text-warning",
                        status.color === 'red' && "bg-destructive/10 text-destructive"
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
                          className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10"
                          onClick={() => openEditDialog(link)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
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
        <DialogContent className="rounded-2xl">
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
                className="rounded-xl"
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
                className="rounded-xl"
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
                className="rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="gradient"
                className="rounded-xl"
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
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tender source link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
