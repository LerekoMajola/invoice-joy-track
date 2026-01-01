import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { FileText, MoreHorizontal, Eye, Send, Copy, Trash2, Plus, X, Receipt, Loader2, CheckCircle, XCircle, RotateCcw, ArrowRightLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [selectedClientId, setSelectedClientId] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [lineItems, setLineItems] = useState<{ id: string; description: string; quantity: number; unitPrice: number; costPrice: number; inputMode: 'price' | 'margin'; marginPercent: number }[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, costPrice: 0, inputMode: 'price', marginPercent: 0 }
  ]);
  const [validityDays, setValidityDays] = useState(30);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);

  const defaultTaxRate = profile?.vat_enabled ? (profile.default_tax_rate || 15) : 0;
  const defaultTerms = profile?.default_terms || 'Payment is due within 30 days of invoice date.';

  const handleConvertToInvoice = (quote: Quote) => {
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

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
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
      lineItems: lineItems.map(({ description, quantity, unitPrice, costPrice }) => ({ description, quantity, unitPrice, costPrice })),
    });

    setIsOpen(false);
    setSelectedClientId('');
    setQuoteDescription('');
    setLineItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, costPrice: 0, inputMode: 'price', marginPercent: 0 }]);
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
      
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[
            { label: 'Total Quotes', value: quotes.length.toString(), color: 'text-primary' },
            { label: 'Pending', value: quotes.filter(q => q.status === 'sent').length.toString(), color: 'text-info' },
            { label: 'Accepted', value: quotes.filter(q => q.status === 'accepted').length.toString(), color: 'text-success' },
            { label: 'Rejected', value: quotes.filter(q => q.status === 'rejected').length.toString(), color: 'text-destructive' },
          ].map((stat, index) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn('text-2xl font-display font-semibold mt-1', stat.color)}>{stat.value}</p>
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
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold">Quote</TableHead>
                  <TableHead className="font-semibold">Client</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Valid Until</TableHead>
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
                    <TableCell className="text-muted-foreground">{formatDisplayDate(quote.validUntil)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatMaluti(quote.total)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('capitalize', statusStyles[quote.status])}>{quote.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewQuote(quote)}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                          <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                          
                          {/* Status Actions */}
                          <DropdownMenuSeparator />
                          {quote.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'sent')}>
                              <Send className="h-4 w-4 mr-2" />Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {quote.status === 'sent' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'accepted')} className="text-success">
                                <CheckCircle className="h-4 w-4 mr-2" />Mark as Accepted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'rejected')} className="text-destructive">
                                <XCircle className="h-4 w-4 mr-2" />Mark as Rejected
                              </DropdownMenuItem>
                            </>
                          )}
                          {quote.status === 'rejected' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'draft')}>
                              <RotateCcw className="h-4 w-4 mr-2" />Revise (Back to Draft)
                            </DropdownMenuItem>
                          )}
                          {quote.status === 'accepted' && !convertedQuoteIds.has(quote.id) && (
                            <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)} className="text-success">
                              <Receipt className="h-4 w-4 mr-2" />Convert to Invoice
                            </DropdownMenuItem>
                          )}
                          {quote.status === 'accepted' && convertedQuoteIds.has(quote.id) && (
                            <DropdownMenuItem disabled className="text-muted-foreground">
                              <CheckCircle className="h-4 w-4 mr-2" />Converted to {getLinkedInvoiceNumber(quote.id)}
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteQuote(quote.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />Delete
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Create New Quote</DialogTitle></DialogHeader>
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
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label>Line Items</Label>
                  <p className="text-xs text-muted-foreground">Cost price is internal only - never shown to clients</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground mb-1">
                  <div className="col-span-4">Description</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-2 text-amber-600">Cost Price</div>
                  <div className="col-span-4">Sell Price / Margin</div>
                  <div className="col-span-1"></div>
                </div>
                {lineItems.map((item) => {
                  const lineMargin = item.unitPrice > 0 ? ((item.unitPrice - item.costPrice) / item.unitPrice) * 100 : 0;
                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4"><Input placeholder="Description" value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} /></div>
                      <div className="col-span-1"><Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)} className="text-center" /></div>
                      <div className="col-span-2"><Input type="number" placeholder="Cost" value={item.costPrice} onChange={(e) => updateLineItem(item.id, 'costPrice', parseFloat(e.target.value) || 0)} className="border-amber-200 bg-amber-50/50" /></div>
                      <div className="col-span-4 flex items-center gap-1">
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
                            <span className={`text-sm font-medium w-14 text-right ${lineMargin >= 25 ? 'text-emerald-600' : lineMargin >= 10 ? 'text-sky-600' : lineMargin > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
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
                              className="w-20"
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
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateQuote} disabled={!selectedClientId || lineItems.every(item => !item.description)}>Create Quote</Button>
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
    </DashboardLayout>
  );
}
