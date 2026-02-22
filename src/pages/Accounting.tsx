import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab, ExpensesTab, BankAccountsTab, ReportsTab, TransactionsTab } from '@/components/accounting';
import { Loader2, Lightbulb } from 'lucide-react';
import { useJobProfitability } from '@/hooks/useJobProfitability';
import { ProfitabilityStats } from '@/components/profitability/ProfitabilityStats';
import { ProfitabilityChart } from '@/components/profitability/ProfitabilityChart';
import { JobProfitabilityTable } from '@/components/profitability/JobProfitabilityTable';
import { ClientProfitabilityCard } from '@/components/profitability/ClientProfitabilityCard';
import { formatMaluti } from '@/lib/currency';

function ProfitabilityTab() {
  const { 
    jobProfitabilities, 
    stats, 
    monthlyData, 
    clientProfitability, 
    isLoading,
    targetMargin,
  } = useJobProfitability();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfitabilityStats stats={stats} targetMargin={targetMargin} />

      {stats.jobsTracked > 0 && (
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-emerald-500/5 p-4 shadow-card animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Quick Insights</h4>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                {stats.bestJob && (
                  <span>
                    🏆 Best performing job: <span className="font-medium text-foreground">{stats.bestJob.invoiceNumber}</span> ({stats.bestJob.marginPercent.toFixed(1)}% margin)
                  </span>
                )}
                {clientProfitability[0] && (
                  <span>
                    ⭐ Most profitable client: <span className="font-medium text-foreground">{clientProfitability[0].clientName}</span> ({formatMaluti(clientProfitability[0].grossProfit)} profit)
                  </span>
                )}
                {stats.averageMargin > 0 && (
                  <span>
                    📊 Your average margin is <span className={stats.averageMargin >= targetMargin ? 'text-emerald-500 font-medium' : 'text-amber-500 font-medium'}>{stats.averageMargin.toFixed(1)}%</span>
                    {stats.averageMargin >= targetMargin ? ' — exceeding target!' : ` — target is ${targetMargin}%`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfitabilityChart data={monthlyData} />
        </div>
        <div>
          <ClientProfitabilityCard clients={clientProfitability} />
        </div>
      </div>

      <JobProfitabilityTable jobs={jobProfitabilities} />
    </div>
  );
}

export default function Accounting() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounting</h1>
          <p className="text-muted-foreground">
            Bookkeeping, expenses, bank accounts, and financial reports.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Ledger</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpensesTab />
          </TabsContent>

          <TabsContent value="accounts">
            <BankAccountsTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="profitability">
            <ProfitabilityTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
