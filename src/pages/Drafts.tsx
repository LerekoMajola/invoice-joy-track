import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuotes, Quote } from '@/hooks/useQuotes';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useCurrency } from '@/hooks/useCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Receipt, Eye, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function Drafts() {
  const navigate = useNavigate();
  const { quotes, deleteQuote } = useQuotes();
  const { invoices, deleteInvoice } = useInvoices();
  const { fc } = useCurrency();
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; description: string; action: () => void }>({ open: false, title: '', description: '', action: () => {} });

  const draftQuotes = (quotes || []).filter((q: Quote) => q.status === 'draft');
  const draftInvoices = (invoices || []).filter((i: Invoice) => i.status === 'draft');
  const totalDrafts = draftQuotes.length + draftInvoices.length;

  const handleEditQuote = (quote: Quote) => {
    sessionStorage.setItem('open-quote-id', quote.id);
    navigate('/quotes');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    sessionStorage.setItem('open-invoice-id', invoice.id);
    navigate('/invoices');
  };

  const handleDeleteQuote = (quote: Quote) => {
    setConfirmState({ open: true, title: 'Delete Draft Quote', description: `Delete draft ${quote.quoteNumber}? This cannot be undone.`, action: () => deleteQuote(quote.id) });
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setConfirmState({ open: true, title: 'Delete Draft Invoice', description: `Delete draft ${invoice.invoiceNumber}? This cannot be undone.`, action: () => deleteInvoice(invoice.id) });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Drafts</h1>
            <p className="text-muted-foreground">Unfinished quotes and invoices</p>
          </div>
          <Badge variant="secondary" className="text-base px-3 py-1">
            {totalDrafts} draft{totalDrafts !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Draft Quotes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Draft Quotes ({draftQuotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {draftQuotes.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No draft quotes</p>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                  {draftQuotes.map((q) => (
                    <div key={q.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{q.quoteNumber}</p>
                          <p className="text-sm text-muted-foreground">{q.clientName}</p>
                        </div>
                        <p className="font-semibold">{fc(q.total)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">{format(new Date(q.date), 'dd MMM yyyy')}</p>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEditQuote(q)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteQuote(q)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quote #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draftQuotes.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="font-medium">{q.quoteNumber}</TableCell>
                          <TableCell>{q.clientName}</TableCell>
                          <TableCell>{format(new Date(q.date), 'dd MMM yyyy')}</TableCell>
                          <TableCell className="text-right">{fc(q.total)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEditQuote(q)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteQuote(q)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Draft Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-primary" />
              Draft Invoices ({draftInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {draftInvoices.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No draft invoices</p>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                  {draftInvoices.map((inv) => (
                    <div key={inv.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{inv.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">{inv.clientName}</p>
                        </div>
                        <p className="font-semibold">{fc(inv.total)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">{format(new Date(inv.date), 'dd MMM yyyy')}</p>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleViewInvoice(inv)}><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteInvoice(inv)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draftInvoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                          <TableCell>{inv.clientName}</TableCell>
                          <TableCell>{format(new Date(inv.date), 'dd MMM yyyy')}</TableCell>
                          <TableCell className="text-right">{fc(inv.total)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleViewInvoice(inv)}><Eye className="h-4 w-4 mr-1" /> View</Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteInvoice(inv)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState(s => ({ ...s, open }))}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.action}
        variant="destructive"
        confirmLabel="Delete"
      />
    </DashboardLayout>
  );
}
