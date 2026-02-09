import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatMaluti } from '@/lib/currency';
import { IncomeStatement } from './IncomeStatement';
import { BalanceSheet } from './BalanceSheet';
import { VATReport } from './VATReport';
import { useAccountingStats } from '@/hooks/useAccountingStats';

type ReportType = 'income-statement' | 'expense-report' | 'cash-flow' | 'balance-sheet' | 'vat-report';

export function ReportsTab() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('income-statement');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { stats, expensesByCategory, periodStart, periodEnd } = useAccountingStats(
    dateRange.from,
    dateRange.to
  );

  const reportOptions = [
    { id: 'income-statement' as const, name: 'Income Statement', icon: FileText },
    { id: 'balance-sheet' as const, name: 'Balance Sheet', icon: FileText },
    { id: 'expense-report' as const, name: 'Expense Report', icon: FileText },
    { id: 'cash-flow' as const, name: 'Cash Flow', icon: FileText },
    { id: 'vat-report' as const, name: 'VAT Report', icon: FileText },
  ];

  const quickDateRanges = [
    { label: 'This Month', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    { label: 'Last Month', from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) },
    { label: 'Last 3 Months', from: startOfMonth(subMonths(new Date(), 2)), to: endOfMonth(new Date()) },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range & Report Selection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap">
          {reportOptions.map((report) => (
            <Button
              key={report.id}
              variant={selectedReport === report.id ? 'default' : 'outline'}
              onClick={() => setSelectedReport(report.id)}
            >
              <report.icon className="mr-2 h-4 w-4" />
              {report.name}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {quickDateRanges.map((range) => (
              <Button
                key={range.label}
                variant="ghost"
                size="sm"
                onClick={() => setDateRange({ from: range.from, to: range.to })}
                className={cn(
                  dateRange.from.getTime() === range.from.getTime() &&
                    dateRange.to.getTime() === range.to.getTime() &&
                    'bg-muted'
                )}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'income-statement' && (
        <IncomeStatement
          stats={stats}
          expensesByCategory={expensesByCategory}
          periodStart={dateRange.from}
          periodEnd={dateRange.to}
        />
      )}

      {selectedReport === 'expense-report' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Expense Report</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Period: {format(dateRange.from, 'MMMM d, yyyy')} -{' '}
                {format(dateRange.to, 'MMMM d, yyyy')}
              </p>
              {expensesByCategory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No expenses recorded for this period.
                </p>
              ) : (
                <div className="space-y-3">
                  {expensesByCategory.map((cat) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="font-medium">{cat.name}</span>
                      <span className="font-bold">
                        M{cat.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg font-bold">
                    <span>Total Expenses</span>
                    <span>
                      M
                      {expensesByCategory
                        .reduce((sum, c) => sum + c.total, 0)
                        .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === 'balance-sheet' && (
        <BalanceSheet periodEnd={dateRange.to} />
      )}

      {selectedReport === 'cash-flow' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cash Flow Statement</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Period: {format(dateRange.from, 'MMMM d, yyyy')} -{' '}
                {format(dateRange.to, 'MMMM d, yyyy')}
              </p>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-green-600 mb-3">Cash Inflows</h4>
                  <div className="flex justify-between">
                    <span>Sales Revenue (Paid Invoices)</span>
                    <span className="font-medium">
                      {formatMaluti(stats.totalRevenue)}
                    </span>
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>Total Inflows</span>
                    <span className="text-green-600">
                      {formatMaluti(stats.totalRevenue)}
                    </span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-red-600 mb-3">Cash Outflows</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Operating Expenses</span>
                      <span className="font-medium">
                        {formatMaluti(stats.totalExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payroll</span>
                      <span className="font-medium">
                        {formatMaluti(stats.payrollCosts)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>Total Outflows</span>
                    <span className="text-red-600">
                      {formatMaluti(stats.totalExpenses + stats.payrollCosts)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Net Cash Flow</span>
                    <span className={stats.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatMaluti(stats.netCashFlow)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === 'vat-report' && (
        <VATReport periodStart={dateRange.from} periodEnd={dateRange.to} />
      )}
    </div>
  );
}
