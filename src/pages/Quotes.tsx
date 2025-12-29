import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { FileText, MoreHorizontal, Eye, Send, Copy, Trash2, Plus, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  validUntil: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

// Mock clients - in production this would come from shared state/database
const clients: Client[] = [
  { id: '1', company: 'Acme Corporation', contactPerson: 'John Smith', email: 'john@acmecorp.com' },
  { id: '2', company: 'TechStart Inc', contactPerson: 'Sarah Johnson', email: 'sarah@techstart.io' },
  { id: '3', company: 'Global Solutions Ltd', contactPerson: 'Michael Chen', email: 'michael@globalsolutions.com' },
  { id: '4', company: 'StartUp Labs', contactPerson: 'Emily Davis', email: 'emily@startuplabs.co' },
];

const initialQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'QT-0089',
    clientId: '1',
    clientName: 'Acme Corporation',
    date: 'Dec 20, 2024',
    validUntil: 'Jan 20, 2025',
    total: 4500,
    status: 'accepted',
  },
  {
    id: '2',
    quoteNumber: 'QT-0088',
    clientId: '2',
    clientName: 'TechStart Inc',
    date: 'Dec 18, 2024',
    validUntil: 'Jan 18, 2025',
    total: 12800,
    status: 'sent',
  },
  {
    id: '3',
    quoteNumber: 'QT-0087',
    clientId: '3',
    clientName: 'Global Solutions Ltd',
    date: 'Dec 15, 2024',
    validUntil: 'Jan 15, 2025',
    total: 3200,
    status: 'sent',
  },
  {
    id: '4',
    quoteNumber: 'QT-0086',
    clientId: '4',
    clientName: 'StartUp Labs',
    date: 'Dec 12, 2024',
    validUntil: 'Jan 12, 2025',
    total: 8900,
    status: 'draft',
  },
  {
    id: '5',
    quoteNumber: 'QT-0085',
    clientId: '1',
    clientName: 'Innovation Hub',
    date: 'Dec 10, 2024',
    validUntil: 'Jan 10, 2025',
    total: 2100,
    status: 'rejected',
  },
];

const statusStyles = {
  draft: 'bg-muted text-muted-foreground border-border',
  sent: 'bg-info/10 text-info border-info/20',
  accepted: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);
  const [validityDays, setValidityDays] = useState(30);

  const generateQuoteNumber = () => {
    const lastQuote = quotes.reduce((max, quote) => {
      const num = parseInt(quote.quoteNumber.replace('QT-', ''));
      return num > max ? num : max;
    }, 0);
    return `QT-${String(lastQuote + 1).padStart(4, '0')}`;
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleCreateQuote = () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + validityDays);

    const newQuote: Quote = {
      id: Date.now().toString(),
      quoteNumber: generateQuoteNumber(),
      clientId: client.id,
      clientName: client.company,
      date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      validUntil: validUntil.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      total: calculateTotal(),
      status: 'draft',
    };

    setQuotes([newQuote, ...quotes]);
    setIsOpen(false);
    setSelectedClientId('');
    setLineItems([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
  };

  return (
    <DashboardLayout>
      <Header 
        title="Quotes" 
        subtitle="Create and manage your quotations"
        action={{
          label: 'New Quote',
          onClick: () => setIsOpen(true),
        }}
      />
      
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[
            { label: 'Total Quotes', value: quotes.length.toString(), color: 'text-primary' },
            { label: 'Pending', value: quotes.filter(q => q.status === 'sent').length.toString(), color: 'text-info' },
            { label: 'Accepted', value: quotes.filter(q => q.status === 'accepted').length.toString(), color: 'text-success' },
            { label: 'Rejected', value: quotes.filter(q => q.status === 'rejected').length.toString(), color: 'text-destructive' },
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

        {/* Quotes Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
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
                <TableRow 
                  key={quote.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{quote.quoteNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{quote.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">{quote.date}</TableCell>
                  <TableCell className="text-muted-foreground">{quote.validUntil}</TableCell>
                  <TableCell className="text-right font-semibold">
                    M{quote.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize', statusStyles[quote.status])}>
                      {quote.status}
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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

      {/* New Quote Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Create New Quote</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Quote Number */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Quote Number</Label>
                <div className="mt-1 text-lg font-semibold text-primary">
                  {generateQuoteNumber()}
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="validity">Valid for (days)</Label>
                <Input
                  id="validity"
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Client Selection */}
            <div>
              <Label>Select Client Organisation</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
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

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-6">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-end mt-4 pt-4 border-t border-border">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-display font-semibold text-primary">
                    M{calculateTotal().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateQuote}
              disabled={!selectedClientId || lineItems.every(item => !item.description)}
            >
              Create Quote
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
