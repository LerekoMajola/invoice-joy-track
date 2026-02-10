import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { Receipt, MoreHorizontal, Eye, Send, Download, Trash2, Loader2, CheckCircle, Truck, FileText, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { RecordPaymentDialog } from '@/components/invoices/RecordPaymentDialog';
import { ReceiptPreview } from '@/components/invoices/ReceiptPreview';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useDeliveryNotes } from '@/hooks/useDeliveryNotes';
import { useRecurringDocuments } from '@/hooks/useRecurringDocuments';
import { SetRecurringDialog } from '@/components/shared/SetRecurringDialog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const statusStyles = {
  draft: 'bg-muted text-muted-foreground border-border',
  sent: 'bg-info/10 text-info border-info/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

// Mobile Invoice Card Component
function InvoiceCard({
  invoice,
  onView,
  onStatusChange,
  onGenerateDeliveryNote,
  onViewReceipt,
  onDelete,
  onSetRecurring,
  hasDeliveryNote,
  isRecurring,
}: {
  invoice: Invoice;
  onView: () => void;
  onStatusChange: (status: Invoice['status']) => void;
  onGenerateDeliveryNote: () => void;
  onViewReceipt: () => void;
  onDelete: () => void;
  onSetRecurring: () => void;
  hasDeliveryNote: boolean;
  isRecurring: boolean;
}) {
  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="mobile-card animate-slide-up" onClick={onView}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 flex-shrink-0">
            <Receipt className="h-5 w-5 text-success" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-card-foreground">{invoice.invoiceNumber}</p>
              {isRecurring && <RefreshCw className="h-3.5 w-3.5 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground truncate">{invoice.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className={cn('capitalize text-xs', statusStyles[invoice.status])}>
            {invoice.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                <Eye className="h-4 w-4 mr-2" />View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {invoice.status === 'draft' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('sent'); }}>
                  <Send className="h-4 w-4 mr-2" />Mark as Sent
                </DropdownMenuItem>
              )}
              {invoice.status === 'sent' && (
                <>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange('paid'); }} className="text-success">
                    <CheckCircle className="h-4 w-4 mr-2" />Mark as Paid
                  </DropdownMenuItem>
                  {!hasDeliveryNote && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onGenerateDeliveryNote(); }}>
                      <Truck className="h-4 w-4 mr-2" />Generate Delivery Note
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {invoice.status === 'paid' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewReceipt(); }}>
                  <FileText className="h-4 w-4 mr-2" />View Receipt
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetRecurring(); }}>
                <RefreshCw className="h-4 w-4 mr-2" />{isRecurring ? 'Manage Recurring' : 'Set as Recurring'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>{formatDisplayDate(invoice.date)}</span>
          <span>→</span>
          <span>{formatDisplayDate(invoice.dueDate)}</span>
        </div>
        <span className="font-semibold text-foreground">{formatMaluti(invoice.total)}</span>
      </div>
    </div>
  );
}

export default function Invoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { invoices, isLoading, createInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const { deliveryNotes } = useDeliveryNotes();
  const { getRecurringBySource, setRecurring, stopRecurring } = useRecurringDocuments();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [isCreatingFromQuote, setIsCreatingFromQuote] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [recurringTargetInvoice, setRecurringTargetInvoice] = useState<Invoice | null>(null);
  const { confirmDialog, openConfirmDialog, closeConfirmDialog, handleConfirm } = useConfirmDialog();

  const invoicesWithDeliveryNotes = new Set(
    deliveryNotes.filter(dn => dn.invoiceId).map(dn => dn.invoiceId)
  );

  useEffect(() => {
    // Handle invoice from quote
    const newInvoiceData = sessionStorage.getItem('newInvoiceFromQuote');
    // Handle invoice from job card
    const newInvoiceFromJobCard = sessionStorage.getItem('newInvoiceFromJobCard');
    
    const invoiceSource = newInvoiceData || newInvoiceFromJobCard;
    
    if (invoiceSource && !isCreatingFromQuote) {
      setIsCreatingFromQuote(true);
      const data = JSON.parse(invoiceSource);
      sessionStorage.removeItem('newInvoiceFromQuote');
      sessionStorage.removeItem('newInvoiceFromJobCard');
      
      createInvoice({
        sourceQuoteId: data.sourceQuoteId || undefined,
        clientId: data.clientId,
        clientName: data.clientName,
        clientAddress: data.clientAddress || '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: data.description || '',
        taxRate: data.taxRate || 0,
        lineItems: data.lineItems,
        status: 'draft',
      }).then((newInvoice) => {
        if (newInvoice) {
          setSelectedInvoice(newInvoice);
          setPreviewOpen(true);
        }
        setIsCreatingFromQuote(false);
      });
    }
  }, [user]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPreviewOpen(true);
  };

  const handleUpdateInvoice = async (updatedData: {
    invoiceNumber: string;
    clientName: string;
    clientAddress?: string;
    date: string;
    dueDate: string;
    description?: string;
    lineItems: { id: string; description: string; quantity: number; unitPrice: number; costPrice: number }[];
    taxRate: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    purchaseOrderNumber?: string;
  }) => {
    if (!selectedInvoice) return;
    
    await updateInvoice(selectedInvoice.id, {
      clientName: updatedData.clientName,
      clientAddress: updatedData.clientAddress,
      date: updatedData.date,
      dueDate: updatedData.dueDate,
      description: updatedData.description,
      taxRate: updatedData.taxRate,
      status: updatedData.status,
      purchaseOrderNumber: updatedData.purchaseOrderNumber,
      lineItems: updatedData.lineItems,
    });
    
    const updatedInvoice = invoices.find(i => i.id === selectedInvoice.id);
    if (updatedInvoice) {
      setSelectedInvoice(updatedInvoice);
    }
  };

  const handleDeleteInvoice = async (id: string, invoiceNumber: string) => {
    openConfirmDialog({
      title: 'Delete Invoice',
      description: `Are you sure you want to delete ${invoiceNumber}? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      action: async () => { await deleteInvoice(id); },
    });
  };

  const handleStatusChange = async (invoiceId: string, newStatus: Invoice['status']) => {
    await updateInvoice(invoiceId, { status: newStatus });
    toast.success(`Invoice marked as ${newStatus}`);
    if (selectedInvoice?.id === invoiceId) {
      setSelectedInvoice({ ...selectedInvoice, status: newStatus });
    }
  };

  const handleStatusChangeWithConfirm = async (invoiceId: string, newStatus: Invoice['status'], invoiceNumber: string) => {
    if (newStatus === 'paid') {
      const inv = invoices.find(i => i.id === invoiceId) || null;
      setPaymentInvoice(inv);
      setPaymentDialogOpen(true);
    } else {
      await handleStatusChange(invoiceId, newStatus);
    }
  };

  const handleRecordPayment = async (data: { paymentMethod: string; paymentDate: string; paymentReference: string }) => {
    if (!paymentInvoice) return;
    await updateInvoice(paymentInvoice.id, {
      status: 'paid',
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate,
      paymentReference: data.paymentReference || undefined,
    });
    toast.success(`Payment recorded for ${paymentInvoice.invoiceNumber}`);
    if (selectedInvoice?.id === paymentInvoice.id) {
      setSelectedInvoice({ ...selectedInvoice, status: 'paid', paymentMethod: data.paymentMethod, paymentDate: data.paymentDate, paymentReference: data.paymentReference });
    }
    setPaymentDialogOpen(false);
    setPaymentInvoice(null);
  };

  const handleViewReceipt = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setReceiptOpen(true);
  };

  const handleGenerateDeliveryNoteWithConfirm = (invoice: Invoice) => {
    openConfirmDialog({
      title: 'Generate Delivery Note',
      description: `Create a delivery note for ${invoice.invoiceNumber}? This will track the delivery of items.`,
      confirmLabel: 'Generate',
      action: () => handleGenerateDeliveryNote(invoice),
    });
  };

  const handleGenerateDeliveryNote = (invoice: Invoice) => {
    const deliveryNoteData = {
      invoiceId: invoice.id,
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      deliveryAddress: invoice.clientAddress || '',
      items: invoice.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
      })),
    };
    
    sessionStorage.setItem('newDeliveryNoteFromInvoice', JSON.stringify(deliveryNoteData));
    toast.success('Creating delivery note from invoice');
    navigate('/delivery-notes');
  };

  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const paidTotal = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingTotal = invoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((sum, i) => sum + i.total, 0);
  const overdueTotal = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

  return (
    <DashboardLayout>
      <Header 
        title="Invoices" 
        subtitle="Track and manage your invoices"
        action={{ label: 'New Invoice', onClick: () => {} }}
      />
      
      <div className="p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {[
            { label: 'Total Invoiced', value: formatMaluti(totalInvoiced), color: 'text-primary' },
            { label: 'Paid', value: formatMaluti(paidTotal), color: 'text-success' },
            { label: 'Pending', value: formatMaluti(pendingTotal), color: 'text-info' },
            { label: 'Overdue', value: formatMaluti(overdueTotal), color: 'text-destructive' },
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
        ) : invoices.length === 0 ? (
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Receipt className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No invoices yet</p>
              <p className="text-sm">Create a quote and convert it to an invoice</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onView={() => handleViewInvoice(invoice)}
                  onStatusChange={(status) => handleStatusChangeWithConfirm(invoice.id, status, invoice.invoiceNumber)}
                  onGenerateDeliveryNote={() => handleGenerateDeliveryNoteWithConfirm(invoice)}
                  onViewReceipt={() => handleViewReceipt(invoice)}
                  onDelete={() => handleDeleteInvoice(invoice.id, invoice.invoiceNumber)}
                  onSetRecurring={() => { setRecurringTargetInvoice(invoice); setRecurringDialogOpen(true); }}
                  hasDeliveryNote={invoicesWithDeliveryNotes.has(invoice.id)}
                  isRecurring={!!getRecurringBySource('invoice', invoice.id)?.isActive}
                />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="font-semibold">Invoice</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Due Date</TableHead>
                    <TableHead className="font-semibold text-right">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice, index) => (
                    <TableRow 
                      key={invoice.id}
                      className="animate-slide-up cursor-pointer hover:bg-muted/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                            <Receipt className="h-5 w-5 text-success" />
                          </div>
                          <span className="font-medium">{invoice.invoiceNumber}</span>
                          {getRecurringBySource('invoice', invoice.id)?.isActive && <RefreshCw className="h-3.5 w-3.5 text-primary" />}
                        </div>
                      </TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDisplayDate(invoice.date)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDisplayDate(invoice.dueDate)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatMaluti(invoice.total)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('capitalize', statusStyles[invoice.status])}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice); }}>
                              <Eye className="h-4 w-4 mr-2" />View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {invoice.status === 'draft' && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(invoice.id, 'sent'); }}>
                                <Send className="h-4 w-4 mr-2" />Mark as Sent
                              </DropdownMenuItem>
                            )}
                            {invoice.status === 'sent' && (
                              <>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChangeWithConfirm(invoice.id, 'paid', invoice.invoiceNumber); }} className="text-success">
                                  <CheckCircle className="h-4 w-4 mr-2" />Mark as Paid
                                </DropdownMenuItem>
                                {!invoicesWithDeliveryNotes.has(invoice.id) && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleGenerateDeliveryNoteWithConfirm(invoice); }}>
                                    <Truck className="h-4 w-4 mr-2" />Generate Delivery Note
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            {invoice.status === 'paid' && !invoicesWithDeliveryNotes.has(invoice.id) && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleGenerateDeliveryNoteWithConfirm(invoice); }}>
                                <Truck className="h-4 w-4 mr-2" />Generate Delivery Note
                              </DropdownMenuItem>
                            )}
                            {invoice.status === 'paid' && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewReceipt(invoice); }}>
                                <FileText className="h-4 w-4 mr-2" />View Receipt
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRecurringTargetInvoice(invoice); setRecurringDialogOpen(true); }}>
                              <RefreshCw className="h-4 w-4 mr-2" />{getRecurringBySource('invoice', invoice.id)?.isActive ? 'Manage Recurring' : 'Set as Recurring'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Download className="h-4 w-4 mr-2" />Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(invoice.id, invoice.invoiceNumber); }}>
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[240mm] max-h-[90vh] overflow-y-auto max-w-[calc(100%-1rem)] md:max-w-[240mm]">
          {selectedInvoice && (
            <InvoicePreview 
              invoice={{
                invoiceNumber: selectedInvoice.invoiceNumber,
                sourceQuoteNumber: undefined,
                clientName: selectedInvoice.clientName,
                clientAddress: selectedInvoice.clientAddress || undefined,
                date: selectedInvoice.date,
                dueDate: selectedInvoice.dueDate,
                description: selectedInvoice.description || undefined,
                lineItems: selectedInvoice.lineItems,
                taxRate: selectedInvoice.taxRate,
                status: selectedInvoice.status,
                purchaseOrderNumber: selectedInvoice.purchaseOrderNumber || undefined,
                paymentMethod: selectedInvoice.paymentMethod || undefined,
                paymentDate: selectedInvoice.paymentDate || undefined,
                paymentReference: selectedInvoice.paymentReference || undefined,
              }}
              hasDeliveryNote={invoicesWithDeliveryNotes.has(selectedInvoice.id)}
              onUpdate={handleUpdateInvoice}
              onStatusChange={(newStatus) => {
                if (newStatus === 'paid') {
                  handleStatusChangeWithConfirm(selectedInvoice.id, 'paid', selectedInvoice.invoiceNumber);
                } else {
                  handleStatusChange(selectedInvoice.id, newStatus);
                }
              }}
              onGenerateDeliveryNote={() => handleGenerateDeliveryNote(selectedInvoice)}
              onViewReceipt={() => handleViewReceipt(selectedInvoice)}
              onClose={() => setPreviewOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-[240mm] max-h-[90vh] overflow-y-auto max-w-[calc(100%-1rem)] md:max-w-[240mm]">
          {selectedInvoice && selectedInvoice.status === 'paid' && (
            <ReceiptPreview
              receipt={{
                invoiceNumber: selectedInvoice.invoiceNumber,
                clientName: selectedInvoice.clientName,
                clientAddress: selectedInvoice.clientAddress || undefined,
                total: selectedInvoice.total,
                paymentMethod: selectedInvoice.paymentMethod || 'cash',
                paymentDate: selectedInvoice.paymentDate || selectedInvoice.date,
                paymentReference: selectedInvoice.paymentReference || undefined,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        invoiceNumber={paymentInvoice?.invoiceNumber || ''}
        onSubmit={handleRecordPayment}
      />

      <ConfirmDialog
        open={confirmDialog?.open ?? false}
        onOpenChange={closeConfirmDialog}
        title={confirmDialog?.title ?? ''}
        description={confirmDialog?.description ?? ''}
        onConfirm={handleConfirm}
        variant={confirmDialog?.variant}
        confirmLabel={confirmDialog?.confirmLabel}
      />

      {recurringTargetInvoice && (
        <SetRecurringDialog
          open={recurringDialogOpen}
          onOpenChange={setRecurringDialogOpen}
          documentNumber={recurringTargetInvoice.invoiceNumber}
          existing={getRecurringBySource('invoice', recurringTargetInvoice.id)}
          onSetRecurring={(freq) => setRecurring('invoice', recurringTargetInvoice.id, freq)}
          onStopRecurring={() => {
            const rec = getRecurringBySource('invoice', recurringTargetInvoice.id);
            if (rec) stopRecurring(rec.id);
          }}
        />
      )}
    </DashboardLayout>
  );
}
