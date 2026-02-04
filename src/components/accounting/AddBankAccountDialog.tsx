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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBankAccounts, CreateBankAccountData } from '@/hooks/useBankAccounts';

interface AddBankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId?: string | null;
}

export function AddBankAccountDialog({ open, onOpenChange, accountId }: AddBankAccountDialogProps) {
  const { accounts, createAccount, updateAccount } = useBankAccounts();

  const existingAccount = accountId ? accounts.find((a) => a.id === accountId) : null;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateBankAccountData>({
    defaultValues: {
      account_name: '',
      account_type: 'checking',
      currency: 'LSL',
      opening_balance: 0,
      is_primary: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (existingAccount) {
      reset({
        account_name: existingAccount.account_name,
        account_number: existingAccount.account_number,
        bank_name: existingAccount.bank_name,
        account_type: existingAccount.account_type,
        currency: existingAccount.currency,
        opening_balance: existingAccount.opening_balance,
        current_balance: existingAccount.current_balance,
        is_primary: existingAccount.is_primary,
        is_active: existingAccount.is_active,
      });
    } else {
      reset({
        account_name: '',
        account_type: 'checking',
        currency: 'LSL',
        opening_balance: 0,
        is_primary: false,
        is_active: true,
      });
    }
  }, [existingAccount, reset]);

  const onSubmit = (data: CreateBankAccountData) => {
    if (existingAccount) {
      updateAccount.mutate({ id: existingAccount.id, ...data }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createAccount.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'mobile_money', label: 'Mobile Money' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existingAccount ? 'Edit Bank Account' : 'Add Bank Account'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name *</Label>
            <Input
              id="account_name"
              {...register('account_name', { required: true })}
              placeholder="e.g., Business Checking"
            />
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select
              value={watch('account_type') || 'checking'}
              onValueChange={(val) => setValue('account_type', val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              {...register('bank_name')}
              placeholder="e.g., Standard Lesotho Bank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              {...register('account_number')}
              placeholder="Enter account number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opening_balance">Opening Balance</Label>
              <Input
                id="opening_balance"
                type="number"
                step="0.01"
                {...register('opening_balance', { valueAsNumber: true })}
              />
            </div>
            {existingAccount && (
              <div className="space-y-2">
                <Label htmlFor="current_balance">Current Balance</Label>
                <Input
                  id="current_balance"
                  type="number"
                  step="0.01"
                  {...register('current_balance', { valueAsNumber: true })}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Primary Account</Label>
              <p className="text-sm text-muted-foreground">
                Set as your default account
              </p>
            </div>
            <Switch
              checked={watch('is_primary') || false}
              onCheckedChange={(checked) => setValue('is_primary', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">
                Include in balance calculations
              </p>
            </div>
            <Switch
              checked={watch('is_active') ?? true}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAccount.isPending || updateAccount.isPending}>
              {existingAccount ? 'Update' : 'Add'} Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
