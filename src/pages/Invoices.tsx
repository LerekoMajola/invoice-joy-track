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
import { cn } from '@/lib/utils';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  dueDate: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

const invoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-0024',
    clientName: 'Acme Corporation',
    date: 'Dec 20, 2024',
    dueDate: 'Jan 20, 2025',
    total: 4500,
    status: 'sent',
  },
  {
    id: '2',
    invoiceNumber: 'INV-0023',
    clientName: 'TechStart Inc',
    date: 'Dec 15, 2024',
    dueDate: 'Jan 15, 2025',
    total: 12800,
    status: 'paid',
  },
  {
    id: '3',
    invoiceNumber: 'INV-0022',
    clientName: 'Global Solutions Ltd',
    date: 'Dec 10, 2024',
    dueDate: 'Dec 25, 2024',
    total: 3200,
    status: 'overdue',
  },
  {
    id: '4',
    invoiceNumber: 'INV-0021',
    clientName: 'StartUp Labs',
    date: 'Dec 5, 2024',
    dueDate: 'Jan 5, 2025',
    total: 8900,
    status: 'paid',
  },
  {
    id: '5',
    invoiceNumber: 'INV-0020',
    clientName: 'Innovation Hub',
    date: 'Dec 1, 2024',
    dueDate: 'Dec 31, 2024',
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
            { label: 'Total Invoiced', value: '$48,250', color: 'text-primary' },
            { label: 'Paid', value: '$39,830', color: 'text-success' },
            { label: 'Pending', value: '$5,220', color: 'text-info' },
            { label: 'Overdue', value: '$3,200', color: 'text-destructive' },
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
              {invoices.map((invoice, index) => (
                <TableRow 
                  key={invoice.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                    ${invoice.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize', statusStyles[invoice.status])}>
                      {invoice.status}
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
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
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
    </DashboardLayout>
  );
}
