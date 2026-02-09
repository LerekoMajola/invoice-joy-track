import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, CheckCircle2, Circle, Trash2, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { formatMaluti } from '@/lib/currency';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useAccountingTransactions } from '@/hooks/useAccountingTransactions';
import { AddTransactionDialog } from './AddTransactionDialog';

export function TransactionsTab() {
  const {
    filteredTransactions, isLoading, filters, setFilters,
    totalInflows, totalOutflows, netFlow,
    deleteTransaction, toggleReconciled, bulkReconcile,
  } = useAccountingTransactions();
  const { activeAccounts } = useBankAccounts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  const handleBulkReconcile = () => {
    const unreconciledIds = Array.from(selectedIds).filter(
      (id) => !filteredTransactions.find((t) => t.id === id)?.is_reconciled
    );
    if (unreconciledIds.length > 0) {
      bulkReconcile.mutate(unreconciledIds, {
        onSuccess: () => setSelectedIds(new Set()),
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTransaction.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'income':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
            <ArrowDownLeft className="h-3 w-3" /> Income
          </Badge>
        );
      case 'expense':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 gap-1">
            <ArrowUpRight className="h-3 w-3" /> Expense
          </Badge>
        );
      case 'transfer':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 gap-1">
            <ArrowLeftRight className="h-3 w-3" /> Transfer
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getRefBadge = (refType: string | null) => {
    if (!refType) return null;
    const labels: Record<string, string> = {
      invoice: 'Invoice',
      expense: 'Expense',
      payroll: 'Payroll',
      manual: 'Manual',
    };
    return <Badge variant="outline" className="text-xs">{labels[refType] || refType}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatMaluti(totalInflows)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Outflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatMaluti(totalOutflows)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatMaluti(netFlow)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={filters.search || ''}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.transactionType || 'all'}
            onValueChange={(v) => setFilters((f) => ({ ...f, transactionType: v }))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.bankAccountId || 'all'}
            onValueChange={(v) => setFilters((f) => ({ ...f, bankAccountId: v }))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Bank Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {activeAccounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.account_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.isReconciled === null || filters.isReconciled === undefined ? 'all' : filters.isReconciled ? 'yes' : 'no'}
            onValueChange={(v) =>
              setFilters((f) => ({
                ...f,
                isReconciled: v === 'all' ? null : v === 'yes',
              }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Reconciled" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Reconciled</SelectItem>
              <SelectItem value="no">Unreconciled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button variant="outline" onClick={handleBulkReconcile} disabled={bulkReconcile.isPending}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Reconcile ({selectedIds.size})
            </Button>
          )}
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={filteredTransactions.length > 0 && selectedIds.size === filteredTransactions.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bank Account</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Reconciled</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <BookOpen className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(txn.id)}
                        onCheckedChange={() => toggleSelect(txn.id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(txn.date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {txn.description || '-'}
                    </TableCell>
                    <TableCell>{getTypeBadge(txn.transaction_type)}</TableCell>
                    <TableCell className="text-sm">
                      {txn.bank_account?.account_name || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRefBadge(txn.reference_type)}
                        {txn.reference_id && (
                          <span className="text-xs text-muted-foreground">{txn.reference_id}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${txn.transaction_type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {txn.transaction_type === 'income' ? '+' : '-'}
                      {formatMaluti(txn.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() =>
                          toggleReconciled.mutate({
                            id: txn.id,
                            reconciled: !txn.is_reconciled,
                          })
                        }
                        className="inline-flex"
                      >
                        {txn.is_reconciled ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(txn.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the transaction and reverse any bank balance changes. This action cannot be undone.
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
