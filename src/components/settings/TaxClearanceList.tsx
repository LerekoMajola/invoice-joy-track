import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Trash2, Plus, Loader2 } from 'lucide-react';
import { useTaxClearances, TaxClearanceDocument } from '@/hooks/useTaxClearances';
import { AddTaxClearanceDialog } from './AddTaxClearanceDialog';
import { differenceInDays, isPast, parseISO, format } from 'date-fns';
import { cn } from '@/lib/utils';
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

function getExpiryStatus(expiryDate: string) {
  const expiry = parseISO(expiryDate);
  const daysRemaining = differenceInDays(expiry, new Date());
  
  if (isPast(expiry)) {
    return { label: 'EXPIRED', className: 'bg-destructive text-destructive-foreground' };
  } else if (daysRemaining <= 30) {
    return { label: `Expires in ${daysRemaining} days`, className: 'bg-destructive/90 text-destructive-foreground' };
  } else if (daysRemaining <= 60) {
    return { label: `Expiring soon (${daysRemaining} days)`, className: 'bg-warning text-warning-foreground' };
  } else {
    return { label: 'Valid', className: 'bg-success text-success-foreground' };
  }
}

interface TaxClearanceItemProps {
  doc: TaxClearanceDocument;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function TaxClearanceItem({ doc, onDelete, isDeleting }: TaxClearanceItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const expiryStatus = getExpiryStatus(doc.expiry_date);

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-md bg-background border">
        <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{doc.activity_name}</p>
          <p className="text-xs text-muted-foreground">
            Expires: {format(parseISO(doc.expiry_date), 'PPP')}
          </p>
        </div>
        <Badge className={cn('whitespace-nowrap', expiryStatus.className)}>
          {expiryStatus.label}
        </Badge>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" asChild>
            <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Clearance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tax clearance for "{doc.activity_name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(doc.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function TaxClearanceList() {
  const { taxClearances, isLoading, deleteTaxClearance, isDeleting } = useTaxClearances();
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-16 bg-muted animate-pulse rounded-md" />
        <div className="h-16 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {taxClearances.length > 0 ? (
        taxClearances.map((doc) => (
          <TaxClearanceItem
            key={doc.id}
            doc={doc}
            onDelete={deleteTaxClearance}
            isDeleting={isDeleting}
          />
        ))
      ) : (
        <div className="flex items-center justify-center h-20 rounded-md border-2 border-dashed border-blue-200 dark:border-blue-800">
          <span className="text-sm text-muted-foreground">No tax clearance documents uploaded</span>
        </div>
      )}
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowAddDialog(true)}
        className="w-full sm:w-auto"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Tax Clearance
      </Button>

      <AddTaxClearanceDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
}
