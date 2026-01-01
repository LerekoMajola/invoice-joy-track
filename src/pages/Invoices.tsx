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
import { Receipt, MoreHorizontal, Eye, Send, Download, Trash2, Loader2, CheckCircle, Truck } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useDeliveryNotes } from '@/hooks/useDeliveryNotes';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const statusStyles = {
  draft: 'bg-muted text-muted-foreground border-border',
  sent: 'bg-info/10 text-info border-info/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Invoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { invoices, isLoading, createInvoice, updateInvoice, deleteInvoice, refetch } = useInvoices();
  const { deliveryNotes } = useDeliveryNotes();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isCreatingFromQuote, setIsCreatingFromQuote] = useState(false);

  // Track which invoices have delivery notes
  const invoicesWithDeliveryNotes = new Set(
    deliveryNotes
      .filter(dn => dn.invoiceId)
      .map(dn => dn.invoiceId)
  );

  // Check for new invoice from quote conversion (auth can restore after mount)
  useEffect(() => {
    const newInvoiceData = sessionStorage.getItem('newInvoiceFromQuote');
    if (newInvoiceData && !isCreatingFromQuote) {
      setIsCreatingFromQuote(true);
      const data = JSON.parse(newInvoiceData);
      
      // Remove immediately to prevent duplicate creation
      sessionStorage.removeItem('newInvoiceFromQuote');
      
      // Create invoice in database
      createInvoice({
        sourceQuoteId: data.sourceQuoteId,
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
    
    // Update the selected invoice for the preview
    const updatedInvoice = invoices.find(i => i.id === selectedInvoice.id);
    if (updatedInvoice) {
      setSelectedInvoice(updatedInvoice);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    await deleteInvoice(id);
  };

  const handleStatusChange = async (invoiceId: string, newStatus: Invoice['status']) => {
    await updateInvoice(invoiceId, { status: newStatus });
    toast.success(`Invoice marked as ${newStatus}`);
    // Update selected invoice if it's the one being changed
    if (selectedInvoice?.id === invoiceId) {
      setSelectedInvoice({ ...selectedInvoice, status: newStatus });
    }
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

  // Calculate summary stats
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const paidTotal = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingTotal = invoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((sum, i) => sum + i.total, 0);
  const overdueTotal = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

  return (
    <DashboardLayout>
      <Header 
        title="Invoices" 
        subtitle="Track and manage your invoices"
        action={{
          label: 'New Invoice',
          onClick: () => {},
        }}
      />
      
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[
            { label: 'Total Invoiced', value: formatMaluti(totalInvoiced), color: 'text-primary' },
            { label: 'Paid', value: formatMaluti(paidTotal), color: 'text-success' },
            { label: 'Pending', value: formatMaluti(pendingTotal), color: 'text-info' },
            { label: 'Overdue', value: formatMaluti(overdueTotal), color: 'text-destructive' },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn('text-2xl font-display font-semibold mt-1', stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Receipt className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No invoices yet</p>
              <p className="text-sm">Create a quote and convert it to an invoice</p>
            </div>
          ) : (
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
                      </div>
                    </TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDisplayDate(invoice.date)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDisplayDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatMaluti(invoice.total)}
                    </TableCell>
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
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          
                          {/* Status Actions */}
                          <DropdownMenuSeparator />
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(invoice.id, 'sent'); }}>
                              <Send className="h-4 w-4 mr-2" />
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'sent' && (
                            <>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(invoice.id, 'paid'); }} className="text-success">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                              {!invoicesWithDeliveryNotes.has(invoice.id) && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleGenerateDeliveryNote(invoice); }}>
                                  <Truck className="h-4 w-4 mr-2" />
                                  Generate Delivery Note
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          {invoice.status === 'paid' && !invoicesWithDeliveryNotes.has(invoice.id) && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleGenerateDeliveryNote(invoice); }}>
                              <Truck className="h-4 w-4 mr-2" />
                              Generate Delivery Note
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(invoice.id); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[240mm] max-h-[90vh] overflow-y-auto">
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
              }}
              hasDeliveryNote={invoicesWithDeliveryNotes.has(selectedInvoice.id)}
              onUpdate={handleUpdateInvoice}
              onStatusChange={(newStatus) => handleStatusChange(selectedInvoice.id, newStatus)}
              onGenerateDeliveryNote={() => handleGenerateDeliveryNote(selectedInvoice)}
              onClose={() => setPreviewOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
