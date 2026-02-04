import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { format } from 'date-fns';
import { useExpenses, useExpenseCategories, CreateExpenseData } from '@/hooks/useExpenses';
import { useBankAccounts } from '@/hooks/useBankAccounts';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseId?: string | null;
}

export function AddExpenseDialog({ open, onOpenChange, expenseId }: AddExpenseDialogProps) {
  const { expenses, createExpense, updateExpense } = useExpenses();
  const { categories } = useExpenseCategories();
  const { accounts } = useBankAccounts();

  const existingExpense = expenseId ? expenses.find((e) => e.id === expenseId) : null;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateExpenseData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: 0,
      description: '',
      status: 'pending',
    },
  });

  useEffect(() => {
    if (existingExpense) {
      reset({
        category_id: existingExpense.category_id,
        bank_account_id: existingExpense.bank_account_id,
        date: existingExpense.date,
        amount: existingExpense.amount,
        vendor_name: existingExpense.vendor_name,
        description: existingExpense.description,
        reference_number: existingExpense.reference_number,
        payment_method: existingExpense.payment_method,
        status: existingExpense.status,
      });
    } else {
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: 0,
        description: '',
        status: 'pending',
      });
    }
  }, [existingExpense, reset]);

  const onSubmit = (data: CreateExpenseData) => {
    if (existingExpense) {
      updateExpense.mutate({ id: existingExpense.id, ...data }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createExpense.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'card', label: 'Card' },
    { value: 'mobile_money', label: 'Mobile Money' },
  ];

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{existingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register('amount', { required: true, valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: true })}
              placeholder="What was this expense for?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={watch('category_id') || ''}
                onValueChange={(val) => setValue('category_id', val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor/Payee</Label>
              <Input
                id="vendor_name"
                {...register('vendor_name')}
                placeholder="Who was paid?"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={watch('payment_method') || ''}
                onValueChange={(val) => setValue('payment_method', val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select
                value={watch('bank_account_id') || ''}
                onValueChange={(val) => setValue('bank_account_id', val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                {...register('reference_number')}
                placeholder="Invoice/receipt #"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch('status') || 'pending'}
                onValueChange={(val) => setValue('status', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createExpense.isPending || updateExpense.isPending}>
              {existingExpense ? 'Update' : 'Add'} Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
