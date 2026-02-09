import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useAccountingTransactions, type CreateTransactionData } from '@/hooks/useAccountingTransactions';
import { format } from 'date-fns';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const { activeAccounts } = useBankAccounts();
  const { createTransaction } = useAccountingTransactions();

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    transaction_type: 'expense',
    bank_account_id: '',
    description: '',
    reference_type: 'manual',
    reference_id: '',
    is_reconciled: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;

    const data: CreateTransactionData = {
      date: form.date,
      amount,
      transaction_type: form.transaction_type,
      bank_account_id: form.bank_account_id || null,
      description: form.description || null,
      reference_type: form.reference_type || null,
      reference_id: form.reference_id || null,
      is_reconciled: form.is_reconciled,
    };

    createTransaction.mutate(data, {
      onSuccess: () => {
        setForm({
          date: format(new Date(), 'yyyy-MM-dd'),
          amount: '',
          transaction_type: 'expense',
          bank_account_id: '',
          description: '',
          reference_type: 'manual',
          reference_id: '',
          is_reconciled: false,
        });
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="txn-date">Date</Label>
              <Input
                id="txn-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="txn-amount">Amount (M)</Label>
              <Input
                id="txn-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.transaction_type}
                onValueChange={(v) => setForm((f) => ({ ...f, transaction_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select
                value={form.bank_account_id}
                onValueChange={(v) => setForm((f) => ({ ...f, bank_account_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="txn-desc">Description</Label>
            <Textarea
              id="txn-desc"
              placeholder="Transaction description..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reference Type</Label>
              <Select
                value={form.reference_type}
                onValueChange={(v) => setForm((f) => ({ ...f, reference_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="txn-ref">Reference Number</Label>
              <Input
                id="txn-ref"
                placeholder="e.g. INV-0001"
                value={form.reference_id}
                onChange={(e) => setForm((f) => ({ ...f, reference_id: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Reconciled</Label>
              <p className="text-xs text-muted-foreground">Mark as reconciled with bank statement</p>
            </div>
            <Switch
              checked={form.is_reconciled}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_reconciled: v }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTransaction.isPending}>
              {createTransaction.isPending ? 'Saving...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
