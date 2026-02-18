import { useState } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import { AdminInvoice } from '@/hooks/useAdminInvoices';
import { useAdminInvoices } from '@/hooks/useAdminInvoices';
import { formatMaluti } from '@/lib/currency';

interface RecordAdminPaymentDialogProps {
  invoice: AdminInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordAdminPaymentDialog({ invoice, open, onOpenChange }: RecordAdminPaymentDialogProps) {
  const { recordPayment } = useAdminInvoices();
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');

  if (!invoice) return null;

  const handleSave = async () => {
    await recordPayment.mutateAsync({
      id: invoice.id,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Record Payment</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            Recording payment for <strong>{invoice.invoice_number}</strong> — {formatMaluti(invoice.total)}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Payment Date</Label>
            <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Reference</Label>
            <Input
              placeholder="Payment reference..."
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={recordPayment.isPending}>
            {recordPayment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Mark as Paid
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
