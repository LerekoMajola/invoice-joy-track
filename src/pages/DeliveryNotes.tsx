import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AddDeliveryNoteDialog } from '@/components/delivery-notes/AddDeliveryNoteDialog';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Truck, MoreHorizontal, Eye, CheckCircle, Download, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { cn } from '@/lib/utils';
import { useDeliveryNotes, DeliveryNote, DeliveryNoteItem } from '@/hooks/useDeliveryNotes';
import { useInvoices } from '@/hooks/useInvoices';
import { toast } from 'sonner';
import { DeliveryNotePreview } from '@/components/delivery-notes/DeliveryNotePreview';

const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  delivered: 'bg-success/10 text-success border-success/20',
};

// Mobile Delivery Note Card
function DeliveryNoteCard({
  note,
  onView,
  onMarkDelivered,
  onDelete,
}: {
  note: DeliveryNote;
  onView: () => void;
  onMarkDelivered: () => void;
  onDelete: () => void;
}) {
  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="mobile-card animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 flex-shrink-0">
            <Truck className="h-5 w-5 text-info" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-card-foreground">{note.noteNumber}</p>
            <p className="text-sm text-muted-foreground truncate">{note.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className={cn('capitalize text-xs', statusStyles[note.status])}>
            {note.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />View
              </DropdownMenuItem>
              {note.status === 'pending' && (
                <DropdownMenuItem onClick={onMarkDelivered}>
                  <CheckCircle className="h-4 w-4 mr-2" />Mark Delivered
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onView}>
                <Download className="h-4 w-4 mr-2" />Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{formatDisplayDate(note.date)}</span>
        <Badge variant="secondary" className="text-xs">{note.items.length} items</Badge>
      </div>
      
      {note.deliveryAddress && (
        <p className="mt-2 text-xs text-muted-foreground truncate">{note.deliveryAddress}</p>
      )}
    </div>
  );
}

export default function DeliveryNotes() {
  const { deliveryNotes, isLoading, createDeliveryNote, updateDeliveryNote, markAsDelivered, deleteDeliveryNote } = useDeliveryNotes();
  const { invoices } = useInvoices();
  const [isCreatingFromInvoice, setIsCreatingFromInvoice] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { confirmDialog, openConfirmDialog, closeConfirmDialog, handleConfirm } = useConfirmDialog();

  const handleUpdateNote = async (data: {
    id: string;
    note_number: string;
    client_name: string;
    date: string;
    delivery_address: string | null;
    status: string | null;
    invoice_id: string | null;
    items?: { id: string; description: string; quantity: number | null }[];
  }) => {
    const success = await updateDeliveryNote(data.id, {
      clientName: data.client_name,
      date: data.date,
      deliveryAddress: data.delivery_address || undefined,
      status: data.status as 'pending' | 'delivered',
      items: data.items?.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity || 1,
      })) as DeliveryNoteItem[],
    });
    
    if (success) {
      // Update local selected note state with new data
      const updatedNote = deliveryNotes.find(n => n.id === data.id);
      if (updatedNote) {
        setSelectedNote({
          ...updatedNote,
          clientName: data.client_name,
          date: data.date,
          deliveryAddress: data.delivery_address,
          status: (data.status as 'pending' | 'delivered') || updatedNote.status,
          items: data.items?.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity || 1,
          })) || updatedNote.items,
        });
      }
    }
  };

  useEffect(() => {
    const newDeliveryNoteData = sessionStorage.getItem('newDeliveryNoteFromInvoice');
    if (newDeliveryNoteData && !isCreatingFromInvoice) {
      setIsCreatingFromInvoice(true);
      const data = JSON.parse(newDeliveryNoteData);
      sessionStorage.removeItem('newDeliveryNoteFromInvoice');
      
      createDeliveryNote({
        invoiceId: data.invoiceId,
        clientId: data.clientId,
        clientName: data.clientName,
        date: new Date().toISOString().split('T')[0],
        deliveryAddress: data.deliveryAddress || '',
        status: 'pending',
        items: data.items,
      }).then(() => {
        toast.success('Delivery note created from invoice');
        setIsCreatingFromInvoice(false);
      });
    }
  }, []);

  const handleMarkDelivered = async (id: string, noteNumber: string) => {
    openConfirmDialog({
      title: 'Mark as Delivered',
      description: `Mark ${noteNumber} as delivered? This will update the delivery status.`,
      confirmLabel: 'Mark Delivered',
      action: async () => { await markAsDelivered(id); },
    });
  };

  const handleDelete = async (id: string, noteNumber: string) => {
    openConfirmDialog({
      title: 'Delete Delivery Note',
      description: `Are you sure you want to delete ${noteNumber}? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      action: async () => { await deleteDeliveryNote(id); },
    });
  };

  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInvoiceNumber = (invoiceId: string | null) => {
    if (!invoiceId) return undefined;
    const invoice = invoices.find(inv => inv.id === invoiceId);
    return invoice?.invoiceNumber;
  };

  const handleView = (note: DeliveryNote) => {
    setSelectedNote(note);
  };

  const totalDeliveries = deliveryNotes.length;
  const pendingCount = deliveryNotes.filter(n => n.status === 'pending').length;
  const deliveredCount = deliveryNotes.filter(n => n.status === 'delivered').length;

  return (
    <DashboardLayout>
      <Header 
        title="Delivery Notes" 
        subtitle="Track deliveries and shipments"
        action={{ label: 'New Delivery Note', onClick: () => setShowCreateDialog(true) }}
      />
      
      <div className="p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            { label: 'Total', value: totalDeliveries.toString(), color: 'text-primary' },
            { label: 'Pending', value: pendingCount.toString(), color: 'text-warning' },
            { label: 'Delivered', value: deliveredCount.toString(), color: 'text-success' },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="rounded-xl border border-border bg-card p-3 md:p-4 shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn('text-lg md:text-2xl font-display font-semibold mt-1', stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : deliveryNotes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Truck className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No delivery notes yet</p>
              <p className="text-sm">Create your first delivery note to get started</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {deliveryNotes.map((note) => (
                <DeliveryNoteCard
                  key={note.id}
                  note={note}
                  onView={() => handleView(note)}
                  onMarkDelivered={() => handleMarkDelivered(note.id, note.noteNumber)}
                  onDelete={() => handleDelete(note.id, note.noteNumber)}
                />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="font-semibold">Delivery Note</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Delivery Address</TableHead>
                    <TableHead className="font-semibold text-center">Items</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryNotes.map((note, index) => (
                    <TableRow 
                      key={note.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                            <Truck className="h-5 w-5 text-info" />
                          </div>
                          <span className="font-medium">{note.noteNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>{note.clientName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDisplayDate(note.date)}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {note.deliveryAddress || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{note.items.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize', statusStyles[note.status])}>
                          {note.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(note)}>
                              <Eye className="h-4 w-4 mr-2" />View
                            </DropdownMenuItem>
                            {note.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleMarkDelivered(note.id, note.noteNumber)}>
                                <CheckCircle className="h-4 w-4 mr-2" />Mark Delivered
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleView(note)}>
                              <Download className="h-4 w-4 mr-2" />Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(note.id, note.noteNumber)}>
                              <Trash2 className="h-4 w-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {selectedNote && (
        <DeliveryNotePreview
          deliveryNote={{
            id: selectedNote.id,
            note_number: selectedNote.noteNumber,
            client_name: selectedNote.clientName,
            date: selectedNote.date,
            delivery_address: selectedNote.deliveryAddress,
            status: selectedNote.status,
            invoice_id: selectedNote.invoiceId,
            items: selectedNote.items.map(item => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
            })),
          }}
          invoiceNumber={getInvoiceNumber(selectedNote.invoiceId)}
          onClose={() => setSelectedNote(null)}
          onUpdate={handleUpdateNote}
        />
      )}

      <ConfirmDialog
        open={confirmDialog?.open ?? false}
        onOpenChange={closeConfirmDialog}
        title={confirmDialog?.title ?? ''}
        description={confirmDialog?.description ?? ''}
        onConfirm={handleConfirm}
        variant={confirmDialog?.variant}
        confirmLabel={confirmDialog?.confirmLabel}
      />

      <AddDeliveryNoteDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </DashboardLayout>
  );
}
