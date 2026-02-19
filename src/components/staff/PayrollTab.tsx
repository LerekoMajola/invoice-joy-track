import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePayslips, Payslip, PayslipStatus } from '@/hooks/usePayslips';
import { useStaff } from '@/hooks/useStaff';
import { GeneratePayslipDialog } from './GeneratePayslipDialog';
import { PayslipPreview } from './PayslipPreview';
import { formatMaluti } from '@/lib/currency';
import { format } from 'date-fns';
import { Plus, Search, MoreVertical, Eye, CheckCircle, DollarSign, Trash2, FileText, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function PayrollTab() {
  const { payslips, isLoading, markAsPaid, deletePayslip, createPayslip, refetch } = usePayslips();
  const { staff } = useStaff();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const filteredPayslips = payslips.filter(p => {
    const matchesSearch = 
      p.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.staffDepartment?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PayslipStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-primary/80 hover:bg-primary">Approved</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-accent hover:bg-accent/90">Paid</Badge>;
    }
  };

  const thisMonthPayslips = payslips.filter(p => {
    const d = new Date(p.paymentDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const stats = {
    total: payslips.length,
    thisMonth: thisMonthPayslips.length,
    approved: payslips.filter(p => p.status === 'approved').length,
    paid: payslips.filter(p => p.status === 'paid').length,
    totalAmount: payslips.reduce((sum, p) => sum + p.netPay, 0),
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payslips</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMaluti(stats.totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowGenerateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Payslip
        </Button>
      </div>

      {/* Payslips Table */}
      {filteredPayslips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payslips found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {payslips.length === 0 
                ? "Generate your first payslip to get started"
                : "Try adjusting your filters"}
            </p>
            {payslips.length === 0 && (
              <Button onClick={() => setShowGenerateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Payslip
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="text-right">Gross Pay</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayslips.map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payslip.staffName}</div>
                      {payslip.staffDepartment && (
                        <div className="text-sm text-muted-foreground">{payslip.staffDepartment}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(payslip.payPeriodStart), 'dd MMM')} - {format(new Date(payslip.payPeriodEnd), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>{format(new Date(payslip.paymentDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-right">{formatMaluti(payslip.grossPay)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatMaluti(payslip.netPay)}</TableCell>
                  <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedPayslip(payslip)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Payslip
                        </DropdownMenuItem>
                        {payslip.status === 'approved' && (
                          <DropdownMenuItem onClick={() => markAsPaid(payslip.id)}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialogs */}
      <GeneratePayslipDialog 
        open={showGenerateDialog} 
        onOpenChange={setShowGenerateDialog}
        staff={staff.filter(s => s.status === 'active')}
        createPayslip={createPayslip}
        onSuccess={refetch}
      />
      
      <PayslipPreview
        payslip={selectedPayslip}
        open={!!selectedPayslip}
        onOpenChange={(open) => !open && setSelectedPayslip(null)}
      />
    </div>
  );
}
