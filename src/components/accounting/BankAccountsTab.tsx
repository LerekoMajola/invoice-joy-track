import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Building2, Wallet, Star, Edit, Trash2, CreditCard } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { AddBankAccountDialog } from './AddBankAccountDialog';

export function BankAccountsTab() {
  const { accounts, totalBalance, isLoading, deleteAccount } = useBankAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteAccount.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <Wallet className="h-5 w-5" />;
      case 'mobile_money':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  const maskAccountNumber = (num: string | null) => {
    if (!num) return null;
    if (num.length <= 4) return num;
    return '****' + num.slice(-4);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Balance (All Accounts)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{formatMaluti(totalBalance)}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Across {accounts.filter((a) => a.is_active).length} active accounts
          </p>
        </CardContent>
      </Card>

      {/* Add Account Button */}
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bank Account
        </Button>
      </div>

      {/* Account Cards Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Bank Accounts</h3>
            <p className="text-muted-foreground mb-4">
              Add your bank accounts to track balances and transactions.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className={`relative ${!account.is_active ? 'opacity-60' : ''}`}
            >
              {account.is_primary && (
                <Badge className="absolute top-3 right-3 gap-1" variant="secondary">
                  <Star className="h-3 w-3" /> Primary
                </Badge>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {getAccountTypeIcon(account.account_type)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{account.account_name}</CardTitle>
                    <CardDescription>
                      {account.bank_name || 'Bank Account'}
                      {account.account_number && ` • ${maskAccountNumber(account.account_number)}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold">{formatMaluti(account.current_balance)}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Opening Balance</span>
                    <span>{formatMaluti(account.opening_balance)}</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingAccount(account.id)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(account.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddBankAccountDialog
        open={dialogOpen || !!editingAccount}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingAccount(null);
        }}
        accountId={editingAccount}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bank account? All related transactions will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
