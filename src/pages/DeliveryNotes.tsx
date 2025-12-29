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
import { Truck, MoreHorizontal, Eye, CheckCircle, Download, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DeliveryNote {
  id: string;
  noteNumber: string;
  clientName: string;
  date: string;
  deliveryAddress: string;
  items: number;
  status: 'pending' | 'delivered';
}

const deliveryNotes: DeliveryNote[] = [
  {
    id: '1',
    noteNumber: 'DN-0156',
    clientName: 'Acme Corporation',
    date: 'Dec 20, 2024',
    deliveryAddress: '123 Business Ave, New York',
    items: 5,
    status: 'delivered',
  },
  {
    id: '2',
    noteNumber: 'DN-0155',
    clientName: 'TechStart Inc',
    date: 'Dec 19, 2024',
    deliveryAddress: '456 Innovation Blvd, San Francisco',
    items: 12,
    status: 'pending',
  },
  {
    id: '3',
    noteNumber: 'DN-0154',
    clientName: 'Global Solutions Ltd',
    date: 'Dec 18, 2024',
    deliveryAddress: '789 Enterprise St, Chicago',
    items: 3,
    status: 'delivered',
  },
  {
    id: '4',
    noteNumber: 'DN-0153',
    clientName: 'StartUp Labs',
    date: 'Dec 17, 2024',
    deliveryAddress: '321 Venture Way, Austin',
    items: 8,
    status: 'pending',
  },
  {
    id: '5',
    noteNumber: 'DN-0152',
    clientName: 'Innovation Hub',
    date: 'Dec 16, 2024',
    deliveryAddress: '654 Tech Park, Seattle',
    items: 2,
    status: 'delivered',
  },
];

const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  delivered: 'bg-success/10 text-success border-success/20',
};

export default function DeliveryNotes() {
  return (
    <DashboardLayout>
      <Header 
        title="Delivery Notes" 
        subtitle="Track deliveries and shipments"
        action={{
          label: 'New Delivery Note',
          onClick: () => {},
        }}
      />
      
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {[
            { label: 'Total Deliveries', value: '156', color: 'text-primary' },
            { label: 'Pending', value: '12', color: 'text-warning' },
            { label: 'Delivered', value: '144', color: 'text-success' },
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

        {/* Delivery Notes Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
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
                  <TableCell className="text-muted-foreground">{note.date}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {note.deliveryAddress}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{note.items}</Badge>
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Delivered
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
