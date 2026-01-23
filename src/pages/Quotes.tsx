import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, MoreHorizontal, Eye, Send, Copy, Trash2, Plus, X, Receipt, Loader2, CheckCircle, XCircle, RotateCcw, ArrowRightLeft, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { QuotePreview } from '@/components/quotes/QuotePreview';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useQuotes, Quote, LineItem } from '@/hooks/useQuotes';
import { useClients } from '@/hooks/useClients';
import { useInvoices } from '@/hooks/useInvoices';
import { toast } from 'sonner';

const statusStyles = {
  draft: 'bg-muted text-muted-foreground border-border',
  sent: 'bg-info/10 text-info border-info/20',
  accepted: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Quotes() {
  const navigate = useNavigate();
  const { profile } = useCompanyProfile();
  const { quotes, isLoading, createQuote, updateQuote, deleteQuote } = useQuotes();
  const { clients } = useClients();
  const { invoices } = useInvoices();

  // Create a set of quote IDs that have been converted to invoices
  const convertedQuoteIds = new Set(
    invoices
      .filter(inv => inv.sourceQuoteId)
      .map(inv => inv.sourceQuoteId)
  );

  // Get invoice number for a converted quote
  const getLinkedInvoiceNumber = (quoteId: string) => {
    const invoice = invoices.find(inv => inv.sourceQuoteId === quoteId);
    return invoice?.invoiceNumber || null;
  };
  const [isOpen, setIsOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<{ id: string; description: string; quantity: number; unitPrice: number; costPrice: number; inputMode: 'price' | 'margin'; marginPercent: number }[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, costPrice: 0, inputMode: 'price', marginPercent: 0 }
  ]);
  const [validityDays, setValidityDays] = useState(profile?.default_validity_days ?? 90);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const { confirmDialog, openConfirmDialog, closeConfirmDialog, handleConfirm } = useConfirmDialog();

  const defaultTaxRate = profile?.vat_enabled ? (profile.default_tax_rate || 15) : 0;
  const defaultTerms = profile?.default_terms || 'Payment is due within 30 days of invoice date.';

  const handleConvertToInvoice = (quote: Quote) => {
    openConfirmDialog({
      title: 'Convert to Invoice',
      description: `Convert ${quote.quoteNumber} to an invoice? This will create a new invoice based on this quote.`,
      confirmLabel: 'Convert',
      action: () => {
        const client = clients.find(c => c.id === quote.clientId);
        
        const invoiceData = {
          sourceQuoteId: quote.id,
          clientId: quote.clientId,
          clientName: quote.clientName,
          clientAddress: client?.address || '',
          description: quote.description || '',
          lineItems: quote.lineItems,
          taxRate: quote.taxRate,
        };
        
        sessionStorage.setItem('newInvoiceFromQuote', JSON.stringify(invoiceData));
        toast.success(`Converting ${quote.quoteNumber} to invoice`);
        navigate('/invoices');
      },
    });
  };

  const handleDeleteQuote = (quoteId: string, quoteNumber: string) => {
    openConfirmDialog({
      title: 'Delete Quote',
      description: `Are you sure you want to delete ${quoteNumber}? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      action: async () => { await deleteQuote(quoteId); },
    });
  };

  const handleStatusChangeWithConfirm = (quoteId: string, newStatus: Quote['status'], quoteNumber: string) => {
    if (newStatus === 'accepted' || newStatus === 'rejected') {
      openConfirmDialog({
        title: `Mark as ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        description: `Are you sure you want to mark ${quoteNumber} as ${newStatus}? This indicates the final client decision.`,
        confirmLabel: `Mark as ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        action: () => handleStatusChange(quoteId, newStatus),
      });
    } else {
      handleStatusChange(quoteId, newStatus);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, costPrice: 0, inputMode: 'price', marginPercent: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: string, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // If cost price changes, recalculate based on current mode
      if (field === 'costPrice') {
        const costPrice = value as number;
        if (item.inputMode === 'margin' && item.marginPercent > 0) {
          // Recalculate sell price from margin
          updated.unitPrice = item.marginPercent >= 100 
            ? costPrice * 10 
            : Math.round((costPrice / (1 - item.marginPercent / 100)) * 100) / 100;
        } else {
          // Recalculate margin from price
          updated.marginPercent = item.unitPrice > 0 
            ? Math.round(((item.unitPrice - costPrice) / item.unitPrice) * 1000) / 10 
            : 0;
        }
      }
      
      return updated;
    }));
  };

  const updateMargin = (id: string, margin: number) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;
      
      // Calculate sell price from cost and margin
      const sellPrice = margin >= 100 
        ? item.costPrice * 10  // Cap at 10x if margin is 100%+
        : item.costPrice / (1 - margin / 100);
      
      return {
        ...item,
        marginPercent: margin,
        unitPrice: Math.round(sellPrice * 100) / 100
      };
    }));
  };

  const updateSellPrice = (id: string, price: number) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;
      
      // Calculate margin from cost and sell price
      const margin = price > 0 ? ((price - item.costPrice) / price) * 100 : 0;
      
      return {
        ...item,
        unitPrice: price,
        marginPercent: Math.round(margin * 10) / 10
      };
    }));
  };

  const toggleInputMode = (id: string) => {
    setLineItems(lineItems.map(item => 
      item.id === id 
        ? { ...item, inputMode: item.inputMode === 'price' ? 'margin' : 'price' } 
        : item
    ));
  };

  const moveLineItemUp = (itemId: string) => {
    const index = lineItems.findIndex(item => item.id === itemId);
    if (index <= 0) return;
    const newItems = [...lineItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setLineItems(newItems);
  };

  const moveLineItemDown = (itemId: string) => {
    const index = lineItems.findIndex(item => item.id === itemId);
    if (index === -1 || index >= lineItems.length - 1) return;
    const newItems = [...lineItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setLineItems(newItems);
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const resetForm = () => {
    setIsOpen(false);
    setEditingQuote(null);
    setSelectedClientId('');
    setQuoteDescription('');
    setLeadTime('');
    setNotes('');
    setLineItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, costPrice: 0, inputMode: 'price', marginPercent: 0 }]);
    setValidityDays(profile?.default_validity_days ?? 90);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setSelectedClientId(quote.clientId || '');
    setQuoteDescription(quote.description || '');
    setLeadTime(quote.leadTime || '');
    setNotes(quote.notes || '');
    setLineItems(quote.lineItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      costPrice: item.costPrice,
      inputMode: 'price' as const,
      marginPercent: item.unitPrice > 0 
        ? ((item.unitPrice - item.costPrice) / item.unitPrice) * 100 
        : 0,
    })));
    // Calculate validity days from dates
    const dateStart = new Date(quote.date);
    const dateEnd = new Date(quote.validUntil);
    const diffDays = Math.ceil((dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24));
    setValidityDays(diffDays > 0 ? diffDays : 90);
    setIsOpen(true);
  };

  const handleSaveEditedQuote = async () => {
    if (!editingQuote) return;
    
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    const today = new Date(editingQuote.date);
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + validityDays);

    await updateQuote(editingQuote.id, {
      clientId: client.id,
      clientName: client.company,
      date: editingQuote.date,
      validUntil: validUntil.toISOString().split('T')[0],
      description: quoteDescription || undefined,
      leadTime: leadTime || undefined,
      notes: notes || undefined,
      lineItems: lineItems.map(({ id, description, quantity, unitPrice, costPrice }) => ({ 
        id, description, quantity, unitPrice, costPrice 
      })),
    });

    resetForm();
  };

  const handleSaveDraft = async () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + validityDays);

    // Filter out completely empty line items, but allow partial ones
    const validLineItems = lineItems.filter(item => 
      item.description.trim() !== '' || item.quantity > 0 || item.unitPrice > 0 || item.costPrice > 0
    );

    await createQuote({
      clientId: client.id,
      clientName: client.company,
      date: today.toISOString().split('T')[0],
      validUntil: validUntil.toISOString().split('T')[0],
      status: 'draft',
      taxRate: defaultTaxRate,
      termsAndConditions: defaultTerms,
      description: quoteDescription || undefined,
      leadTime: leadTime || undefined,
      notes: notes || undefined,
      lineItems: validLineItems.length > 0 
        ? validLineItems.map(({ description, quantity, unitPrice, costPrice }) => ({ description, quantity, unitPrice, costPrice }))
        : [{ description: '', quantity: 1, unitPrice: 0, costPrice: 0 }],
    });

    toast.success('Quote saved as draft');
    resetForm();
  };

  const handleCreateQuote = async () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + validityDays);

    await createQuote({
      clientId: client.id,
      clientName: client.company,
      date: today.toISOString().split('T')[0],
      validUntil: validUntil.toISOString().split('T')[0],
      status: 'draft',
      taxRate: defaultTaxRate,
      termsAndConditions: defaultTerms,
      description: quoteDescription || undefined,
      leadTime: leadTime || undefined,
      notes: notes || undefined,
      lineItems: lineItems.map(({ description, quantity, unitPrice, costPrice }) => ({ description, quantity, unitPrice, costPrice })),
    });

    resetForm();
  };

  const handleViewQuote = (quote: Quote) => {
    setPreviewQuote(quote);
  };

  const handleUpdateQuote = async (updatedData: { 
    lineItems: LineItem[]; 
    taxRate: number; 
    termsAndConditions: string; 
    date: string; 
    dueDate: string; 
    description?: string;
    leadTime?: string;
    notes?: string;
    client?: { address?: string } | null;
  }) => {
    if (!previewQuote) return;
    
    await updateQuote(previewQuote.id, {
      lineItems: updatedData.lineItems.map(item => ({
        ...item,
        costPrice: item.costPrice || 0,
      })),
      taxRate: updatedData.taxRate,
      termsAndConditions: updatedData.termsAndConditions,
      date: updatedData.date,
      validUntil: updatedData.dueDate,
      description: updatedData.description,
      leadTime: updatedData.leadTime,
      notes: updatedData.notes,
    });
  };

  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleStatusChange = async (quoteId: string, newStatus: Quote['status']) => {
    await updateQuote(quoteId, { status: newStatus });
    toast.success(`Quote marked as ${newStatus}`);
  };

  return (
    <DashboardLayout>
      <Header 
        title="Quotes" 
        subtitle="Create and manage your quotations"
        action={{ label: 'New Quote', onClick: () => setIsOpen(true) }}
      />
      
      <div className="p-4 md:p-6">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
          {[
            { label: 'Total Quotes', value: quotes.length.toString(), color: 'text-primary' },
            { label: 'Pending', value: quotes.filter(q => q.status === 'sent').length.toString(), color: 'text-info' },
            { label: 'Accepted', value: quotes.filter(q => q.status === 'accepted').length.toString(), color: 'text-success' },
            { label: 'Rejected', value: quotes.filter(q => q.status === 'rejected').length.toString(), color: 'text-destructive' },
          ].map((stat, index) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-3 md:p-4 shadow-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn('text-xl md:text-2xl font-display font-semibold mt-1', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No quotes yet</p>
              <p className="text-sm">Create your first quote to get started</p>
            </div>
          ) : (
            <>
            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-border">
              {quotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  convertedQuoteIds={convertedQuoteIds}
                  getLinkedInvoiceNumber={getLinkedInvoiceNumber}
                  onView={handleViewQuote}
                  onEdit={handleEditQuote}
                  onConvert={handleConvertToInvoice}
                  onStatusChange={handleStatusChange}
                  onDelete={deleteQuote}
                />
              ))}
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold">Quote</TableHead>
                  <TableHead className="font-semibold">Client</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Reference</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote, index) => (
                  <TableRow key={quote.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{quote.quoteNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{quote.clientName}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDisplayDate(quote.date)}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate" title={quote.description || ''}>{quote.description || '-'}</TableCell>
                    <TableCell className="text-right font-semibold">{formatMaluti(quote.total)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="focus:outline-none">
                            <Badge variant="outline" className={cn('capitalize cursor-pointer hover:opacity-80 transition-opacity', statusStyles[quote.status])}>
                              {quote.status}
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-popover">
                          <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'draft')} disabled={quote.status === 'draft'}>
                            <Badge variant="outline" className={cn('mr-2', statusStyles.draft)}>Draft</Badge>
                            Set as Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'sent')} disabled={quote.status === 'sent'}>
                            <Badge variant="outline" className={cn('mr-2', statusStyles.sent)}>Sent</Badge>
                            Set as Sent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChangeWithConfirm(quote.id, 'accepted', quote.quoteNumber)} disabled={quote.status === 'accepted'}>
                            <Badge variant="outline" className={cn('mr-2', statusStyles.accepted)}>Accepted</Badge>
                            Set as Accepted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChangeWithConfirm(quote.id, 'rejected', quote.quoteNumber)} disabled={quote.status === 'rejected'}>
                            <Badge variant="outline" className={cn('mr-2', statusStyles.rejected)}>Rejected</Badge>
                            Set as Rejected
                          </DropdownMenuItem>
                          {quote.status === 'accepted' && !convertedQuoteIds.has(quote.id) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)} className="text-success">
                                <Receipt className="h-4 w-4 mr-2" />Convert to Invoice
                              </DropdownMenuItem>
                            </>
                          )}
                          {quote.status === 'accepted' && convertedQuoteIds.has(quote.id) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled className="text-muted-foreground">
                                <CheckCircle className="h-4 w-4 mr-2" />Converted to {getLinkedInvoiceNumber(quote.id)}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => handleViewQuote(quote)}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditQuote(quote)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteQuote(quote.id, quote.quoteNumber)}>
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
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsOpen(true); }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingQuote ? `Edit Quote: ${editingQuote.quoteNumber}` : 'Create New Quote'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Quote Number</Label>
                <div className="mt-1 text-lg font-semibold text-primary">Auto-generated</div>
              </div>
              <div className="flex-1">
                <Label htmlFor="validity">Valid for (days)</Label>
                <Input id="validity" type="number" value={validityDays} onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Select Client Organisation</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a client..." /></SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{client.company}</span>
                        <span className="text-xs text-muted-foreground">{client.contactPerson}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Quote Description</Label>
              <Input 
                id="description" 
                placeholder="e.g., Laptop Supply, Website Development, etc."
                value={quoteDescription}
                onChange={(e) => setQuoteDescription(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Brief description of what this quote is for</p>
            </div>
            <div>
              <Label htmlFor="leadTime" className="text-sm font-medium">
                Lead Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="leadTime"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                placeholder="e.g., 2-3 weeks, 30 days from order confirmation"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Estimated delivery or completion time for this quote
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes for this quote..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label>Line Items</Label>
                  <p className="text-xs text-muted-foreground">Cost price is internal only - never shown to clients</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground mb-1">
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2 text-amber-600">Cost Price</div>
                  <div className="col-span-3">Sell Price / Margin</div>
                  <div className="col-span-1"></div>
                  <div className="col-span-1"></div>
                </div>
                {lineItems.map((item) => {
                  const lineMargin = item.unitPrice > 0 ? ((item.unitPrice - item.costPrice) / item.unitPrice) * 100 : 0;
                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3"><Input placeholder="Description" value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} /></div>
                      <div className="col-span-2"><Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)} className="text-center" min="1" /></div>
                      <div className="col-span-2"><Input type="number" placeholder="Cost" value={item.costPrice} onChange={(e) => updateLineItem(item.id, 'costPrice', parseFloat(e.target.value) || 0)} className="border-amber-200 bg-amber-50/50" /></div>
                      <div className="col-span-3 flex items-center gap-1">
                        {item.inputMode === 'price' ? (
                          <>
                            <Input 
                              type="number" 
                              placeholder="Sell Price" 
                              value={item.unitPrice} 
                              onChange={(e) => updateSellPrice(item.id, parseFloat(e.target.value) || 0)} 
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              onClick={() => toggleInputMode(item.id)}
                              title="Switch to margin input"
                              className="shrink-0 h-8 w-8"
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className={`text-sm font-medium w-12 text-right ${lineMargin >= 25 ? 'text-success' : lineMargin >= 10 ? 'text-info' : lineMargin > 0 ? 'text-warning' : 'text-destructive'}`}>
                              {lineMargin.toFixed(0)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <Input 
                              type="number" 
                              placeholder="Margin %" 
                              value={item.marginPercent || ''} 
                              onChange={(e) => updateMargin(item.id, parseFloat(e.target.value) || 0)}
                              className="w-16"
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              onClick={() => toggleInputMode(item.id)}
                              title="Switch to price input"
                              className="shrink-0 h-8 w-8"
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-sm font-medium text-primary flex-1 text-right">
                              = M{item.unitPrice.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="col-span-1 flex flex-col items-center justify-center gap-0">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => moveLineItemUp(item.id)}
                          disabled={lineItems.indexOf(item) === 0}
                          className="h-5 w-5 text-muted-foreground hover:text-primary"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => moveLineItemDown(item.id)}
                          disabled={lineItems.indexOf(item) === lineItems.length - 1}
                          className="h-5 w-5 text-muted-foreground hover:text-primary"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="col-span-1 flex justify-center"><Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(item.id)} disabled={lineItems.length === 1} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></Button></div>
                    </div>
                  );
                })}
              </div>
              
              {/* Profit Summary */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground">Internal Cost Summary</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-medium text-rose-600">M{lineItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Profit:</span>
                      <span className="font-semibold text-emerald-600">
                        M{(calculateTotal() - lineItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Margin:</span>
                      <span className={`font-semibold ${
                        calculateTotal() > 0 
                          ? ((calculateTotal() - lineItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)) / calculateTotal() * 100) >= 25 
                            ? 'text-emerald-600' 
                            : 'text-amber-600'
                          : 'text-muted-foreground'
                      }`}>
                        {calculateTotal() > 0 
                          ? ((calculateTotal() - lineItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)) / calculateTotal() * 100).toFixed(1) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <p className="text-sm text-muted-foreground">Client Total</p>
                    <p className="text-2xl font-display font-semibold text-primary">M{calculateTotal().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            {editingQuote ? (
              <Button 
                onClick={handleSaveEditedQuote} 
                disabled={!selectedClientId || lineItems.every(item => !item.description)}
              >
                Save Changes
              </Button>
            ) : (
              <>
                <Button 
                  variant="secondary" 
                  onClick={handleSaveDraft} 
                  disabled={!selectedClientId}
                >
                  Save as Draft
                </Button>
                <Button 
                  onClick={handleCreateQuote} 
                  disabled={!selectedClientId || lineItems.every(item => !item.description)}
                >
                  Create Quote
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {previewQuote && (() => {
        const client = clients.find(c => c.id === previewQuote.clientId);
        return (
          <QuotePreview
            quoteData={{
              quoteNumber: previewQuote.quoteNumber,
              date: previewQuote.date,
              dueDate: previewQuote.validUntil,
              status: previewQuote.status,
              client: client ? { 
                id: client.id, 
                company: client.company, 
                contactPerson: client.contactPerson || '', 
                email: client.email || '',
                phone: client.phone || undefined,
                address: client.address || undefined,
              } : null,
              lineItems: previewQuote.lineItems,
              taxRate: previewQuote.taxRate,
              termsAndConditions: previewQuote.termsAndConditions || '',
              description: previewQuote.description || undefined,
              leadTime: previewQuote.leadTime || undefined,
              notes: previewQuote.notes || undefined,
            }}
          isConverted={convertedQuoteIds.has(previewQuote.id)}
          linkedInvoiceNumber={getLinkedInvoiceNumber(previewQuote.id)}
          onUpdate={handleUpdateQuote}
          onStatusChange={async (newStatus) => {
            await handleStatusChange(previewQuote.id, newStatus);
            setPreviewQuote({ ...previewQuote, status: newStatus });
          }}
          onConvertToInvoice={() => handleConvertToInvoice(previewQuote)}
          onClose={() => setPreviewQuote(null)}
          />
        );
      })()}

      <ConfirmDialog
        open={confirmDialog?.open ?? false}
        onOpenChange={closeConfirmDialog}
        title={confirmDialog?.title ?? ''}
        description={confirmDialog?.description ?? ''}
        onConfirm={handleConfirm}
        variant={confirmDialog?.variant}
        confirmLabel={confirmDialog?.confirmLabel}
      />
    </DashboardLayout>
  );
}

// Mobile Quote Card Component
interface QuoteCardProps {
  quote: Quote;
  convertedQuoteIds: Set<string | undefined>;
  getLinkedInvoiceNumber: (quoteId: string) => string | null;
  onView: (quote: Quote) => void;
  onEdit: (quote: Quote) => void;
  onConvert: (quote: Quote) => void;
  onStatusChange: (quoteId: string, status: Quote['status']) => void;
  onDelete: (quoteId: string) => void;
}

function QuoteCard({
  quote,
  convertedQuoteIds,
  getLinkedInvoiceNumber,
  onView,
  onEdit,
  onConvert,
  onStatusChange,
  onDelete,
}: QuoteCardProps) {
  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-4 hover:bg-accent/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{quote.quoteNumber}</span>
              <Badge variant="outline" className={cn('capitalize text-xs', statusStyles[quote.status])}>
                {quote.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{quote.clientName}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatDisplayDate(quote.date)}</p>
            {quote.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{quote.description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="font-semibold text-sm">{formatMaluti(quote.total)}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => onView(quote)}>
                <Eye className="h-4 w-4 mr-2" />View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(quote)}>
                <Pencil className="h-4 w-4 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusChange(quote.id, 'draft')} disabled={quote.status === 'draft'}>
                Set as Draft
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(quote.id, 'sent')} disabled={quote.status === 'sent'}>
                Set as Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(quote.id, 'accepted')} disabled={quote.status === 'accepted'}>
                Set as Accepted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(quote.id, 'rejected')} disabled={quote.status === 'rejected'}>
                Set as Rejected
              </DropdownMenuItem>
              {quote.status === 'accepted' && !convertedQuoteIds.has(quote.id) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onConvert(quote)} className="text-success">
                    <Receipt className="h-4 w-4 mr-2" />Convert to Invoice
                  </DropdownMenuItem>
                </>
              )}
              {quote.status === 'accepted' && convertedQuoteIds.has(quote.id) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    <CheckCircle className="h-4 w-4 mr-2" />Converted to {getLinkedInvoiceNumber(quote.id)}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(quote.id)}>
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
