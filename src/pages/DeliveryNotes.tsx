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
import { Truck, MoreHorizontal, Eye, CheckCircle, Download, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useDeliveryNotes } from '@/hooks/useDeliveryNotes';

const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  delivered: 'bg-success/10 text-success border-success/20',
};

export default function DeliveryNotes() {
  const { deliveryNotes, isLoading, markAsDelivered, deleteDeliveryNote } = useDeliveryNotes();

  const handleMarkDelivered = async (id: string) => {
    await markAsDelivered(id);
  };

  const handleDelete = async (id: string) => {
    await deleteDeliveryNote(id);
  };

  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate summary stats
  const totalDeliveries = deliveryNotes.length;
  const pendingCount = deliveryNotes.filter(n => n.status === 'pending').length;
  const deliveredCount = deliveryNotes.filter(n => n.status === 'delivered').length;

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
            { label: 'Total Deliveries', value: totalDeliveries.toString(), color: 'text-primary' },
            { label: 'Pending', value: pendingCount.toString(), color: 'text-warning' },
            { label: 'Delivered', value: deliveredCount.toString(), color: 'text-success' },
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : deliveryNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Truck className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No delivery notes yet</p>
              <p className="text-sm">Create your first delivery note to get started</p>
            </div>
          ) : (
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
                    <TableCell className="text-muted-foreground">{formatDisplayDate(note.date)}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {note.deliveryAddress || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{note.items.length}</Badge>
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
                          {note.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleMarkDelivered(note.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Delivered
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(note.id)}
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
    </DashboardLayout>
  );
}
