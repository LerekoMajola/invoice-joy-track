import { useState } from 'react';
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
import { FileText, MoreHorizontal, Eye, Send, Copy, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Quote {
  id: string;
  quoteNumber: string;
  clientName: string;
  date: string;
  validUntil: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

const quotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'QT-0089',
    clientName: 'Acme Corporation',
    date: 'Dec 20, 2024',
    validUntil: 'Jan 20, 2025',
    total: 4500,
    status: 'accepted',
  },
  {
    id: '2',
    quoteNumber: 'QT-0088',
    clientName: 'TechStart Inc',
    date: 'Dec 18, 2024',
    validUntil: 'Jan 18, 2025',
    total: 12800,
    status: 'sent',
  },
  {
    id: '3',
    quoteNumber: 'QT-0087',
    clientName: 'Global Solutions Ltd',
    date: 'Dec 15, 2024',
    validUntil: 'Jan 15, 2025',
    total: 3200,
    status: 'sent',
  },
  {
    id: '4',
    quoteNumber: 'QT-0086',
    clientName: 'StartUp Labs',
    date: 'Dec 12, 2024',
    validUntil: 'Jan 12, 2025',
    total: 8900,
    status: 'draft',
  },
  {
    id: '5',
    quoteNumber: 'QT-0085',
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
  return (
    <DashboardLayout>
      <Header 
        title="Quotes" 
        subtitle="Create and manage your quotations"
        action={{
          label: 'New Quote',
          onClick: () => {},
        }}
      />
      
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[
            { label: 'Total Quotes', value: '89', color: 'text-primary' },
            { label: 'Pending', value: '12', color: 'text-info' },
            { label: 'Accepted', value: '52', color: 'text-success' },
            { label: 'Rejected', value: '8', color: 'text-destructive' },
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
                  <TableCell>{quote.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">{quote.date}</TableCell>
                  <TableCell className="text-muted-foreground">{quote.validUntil}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${quote.total.toLocaleString()}
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
    </DashboardLayout>
  );
}
