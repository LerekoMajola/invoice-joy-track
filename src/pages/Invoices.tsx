import { useState, useEffect } from 'react';
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
import { Receipt, MoreHorizontal, Eye, Send, Download, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  sourceQuoteNumber?: string;
  clientName: string;
  clientAddress?: string;
  date: string;
  dueDate: string;
  description?: string;
  lineItems: LineItem[];
  taxRate: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

const invoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-0024',
    sourceQuoteNumber: 'QT-0024',
    clientName: 'Acme Corporation',
    clientAddress: '123 Business Park\nMaseru, Lesotho',
    date: 'Dec 20, 2024',
    dueDate: 'Jan 20, 2025',
    description: 'Website development and design services',
    lineItems: [
      { id: '1', description: 'Website Design', quantity: 1, unitPrice: 2500 },
      { id: '2', description: 'Frontend Development', quantity: 1, unitPrice: 2000 },
    ],
    taxRate: 15,
    total: 5175,
    status: 'sent',
  },
  {
    id: '2',
    invoiceNumber: 'INV-0023',
    sourceQuoteNumber: 'QT-0023',
    clientName: 'TechStart Inc',
    clientAddress: '456 Tech Avenue\nMaseru, Lesotho',
    date: 'Dec 15, 2024',
    dueDate: 'Jan 15, 2025',
    description: 'E-commerce platform development',
    lineItems: [
      { id: '1', description: 'E-commerce Platform Setup', quantity: 1, unitPrice: 8000 },
      { id: '2', description: 'Payment Integration', quantity: 1, unitPrice: 3130.43 },
    ],
    taxRate: 15,
    total: 12800,
    status: 'paid',
  },
  {
    id: '3',
    invoiceNumber: 'INV-0022',
    clientName: 'Global Solutions Ltd',
    clientAddress: '789 Corporate Center\nMaseru, Lesotho',
    date: 'Dec 10, 2024',
    dueDate: 'Dec 25, 2024',
    description: 'Mobile app development',
    lineItems: [
      { id: '1', description: 'Mobile App Development', quantity: 1, unitPrice: 2782.61 },
    ],
    taxRate: 15,
    total: 3200,
    status: 'overdue',
  },
  {
    id: '4',
    invoiceNumber: 'INV-0021',
    sourceQuoteNumber: 'QT-0021',
    clientName: 'StartUp Labs',
    clientAddress: '321 Innovation Hub\nMaseru, Lesotho',
    date: 'Dec 5, 2024',
    dueDate: 'Jan 5, 2025',
    description: 'Full-stack web application',
    lineItems: [
      { id: '1', description: 'Backend Development', quantity: 1, unitPrice: 5000 },
      { id: '2', description: 'API Integration', quantity: 1, unitPrice: 2739.13 },
    ],
    taxRate: 15,
    total: 8900,
    status: 'paid',
  },
  {
    id: '5',
    invoiceNumber: 'INV-0020',
    clientName: 'Innovation Hub',
    clientAddress: '654 Creative Space\nMaseru, Lesotho',
    date: 'Dec 1, 2024',
    dueDate: 'Dec 31, 2024',
    description: 'UI/UX Design Services',
    lineItems: [
      { id: '1', description: 'UI/UX Design', quantity: 1, unitPrice: 1826.09 },
    ],
    taxRate: 15,
    total: 2100,
    status: 'draft',
  },
];

const statusStyles = {
  draft: 'bg-muted text-muted-foreground border-border',
  sent: 'bg-info/10 text-info border-info/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Invoices() {
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(invoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Check for new invoice from quote conversion
  useEffect(() => {
    const newInvoiceData = sessionStorage.getItem('newInvoiceFromQuote');
    if (newInvoiceData) {
      const data = JSON.parse(newInvoiceData);
      const subtotal = data.lineItems.reduce((sum: number, item: LineItem) => sum + (item.quantity * item.unitPrice), 0);
      const total = subtotal * (1 + data.taxRate / 100);
      
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: data.invoiceNumber,
        sourceQuoteNumber: data.sourceQuoteNumber,
        clientName: data.clientName,
        clientAddress: data.clientAddress,
        date: data.date,
        dueDate: data.dueDate,
        description: data.description,
        lineItems: data.lineItems,
        taxRate: data.taxRate,
        total,
        status: 'draft',
      };
      
      setInvoicesList(prev => [newInvoice, ...prev]);
      setSelectedInvoice(newInvoice);
      setPreviewOpen(true);
      sessionStorage.removeItem('newInvoiceFromQuote');
    }
  }, []);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPreviewOpen(true);
  };

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
            { label: 'Total Invoiced', value: formatMaluti(48250), color: 'text-primary' },
            { label: 'Paid', value: formatMaluti(39830), color: 'text-success' },
            { label: 'Pending', value: formatMaluti(5220), color: 'text-info' },
            { label: 'Overdue', value: formatMaluti(3200), color: 'text-destructive' },
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
              {invoicesList.map((invoice, index) => (
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
                  <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                  <TableCell className="text-muted-foreground">{invoice.dueDate}</TableCell>
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
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
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
        </div>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[240mm] max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <InvoicePreview 
              invoice={selectedInvoice}
              onClose={() => setPreviewOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
