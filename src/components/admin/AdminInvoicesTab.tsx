import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Eye, Send, CreditCard, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAdminInvoices, AdminInvoice } from '@/hooks/useAdminInvoices';
import { GenerateAdminInvoiceDialog } from './GenerateAdminInvoiceDialog';
import { AdminInvoicePreview } from './AdminInvoicePreview';
import { RecordAdminPaymentDialog } from './RecordAdminPaymentDialog';
import { formatMaluti } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-600 text-white',
  paid: 'bg-green-600 text-white',
  overdue: 'bg-red-600 text-white',
};

export function AdminInvoicesTab() {
  const { invoices, isLoading, deleteInvoice } = useAdminInvoices();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<AdminInvoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<AdminInvoice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.company_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSendInvoice = async (invoice: AdminInvoice) => {
    if (!invoice.tenant_email) {
      toast.error('No email address for this tenant');
      return;
    }
    setSending(invoice.id);
    try {
      const { error } = await supabase.functions.invoke('send-admin-invoice', {
        body: { invoiceId: invoice.id },
      });
      if (error) throw error;
      toast.success('Invoice sent successfully');
    } catch (err) {
      console.error('Send invoice error:', err);
      toast.error('Failed to send invoice');
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Invoice
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.company_name}</TableCell>
                  <TableCell>{formatMaluti(inv.total)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[inv.status] || ''}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(inv.issue_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(inv.due_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setPreviewInvoice(inv)} title="Preview">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {inv.status !== 'paid' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSendInvoice(inv)}
                            disabled={sending === inv.id}
                            title="Send Email"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setPaymentInvoice(inv)} title="Record Payment">
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {inv.status === 'draft' && (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(inv.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <GenerateAdminInvoiceDialog open={generateOpen} onOpenChange={setGenerateOpen} />

      <AdminInvoicePreview
        invoice={previewInvoice}
        open={!!previewInvoice}
        onOpenChange={(open) => !open && setPreviewInvoice(null)}
      />

      <RecordAdminPaymentDialog
        invoice={paymentInvoice}
        open={!!paymentInvoice}
        onOpenChange={(open) => !open && setPaymentInvoice(null)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteInvoice.mutate(deleteId); setDeleteId(null); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
