import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, CheckCircle, TrendingUp, FileText, Plus, Car, Clock } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { useJobCards } from '@/hooks/useJobCards';
import { useQuotes } from '@/hooks/useQuotes';
import { useInvoices } from '@/hooks/useInvoices';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorkshopDashboard() {
  const { jobCards, isLoading: jobCardsLoading } = useJobCards();
  const { quotes, isLoading: quotesLoading } = useQuotes();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const navigate = useNavigate();

  const isLoading = jobCardsLoading || quotesLoading || invoicesLoading;

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeCards = jobCards.filter(jc => !['completed', 'cancelled'].includes(jc.status));
    const completedThisMonth = jobCards.filter(jc =>
      jc.status === 'completed' && jc.completedAt && new Date(jc.completedAt) >= startOfMonth
    );
    const revenueThisMonth = invoices
      .filter(i => i.status === 'paid' && new Date(i.date) >= startOfMonth)
      .reduce((sum, i) => sum + (i.total || 0), 0);
    const pendingQuotes = quotes.filter(q => q.status === 'sent');

    return {
      activeCards: activeCards.length,
      completedThisMonth: completedThisMonth.length,
      revenueThisMonth,
      pendingQuotes: pendingQuotes.length,
    };
  }, [jobCards, quotes, invoices]);

  const activeRepairs = useMemo(() => {
    return jobCards
      .filter(jc => !['completed', 'cancelled'].includes(jc.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [jobCards]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-info/10 text-info';
      case 'diagnosed': return 'bg-warning/10 text-warning';
      case 'in_progress': return 'bg-primary/10 text-primary';
      case 'awaiting_parts': return 'bg-coral/10 text-coral';
      case 'ready': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <Header
        title="Workshop Dashboard"
        subtitle="Track repairs, job cards, and workshop performance."
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-safe">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Active Job Cards"
            value={isLoading ? '...' : stats.activeCards.toString()}
            change="In progress"
            changeType="neutral"
            icon={Wrench}
            iconColor="bg-coral/10 text-coral"
          />
          <StatCard
            title="Completed This Month"
            value={isLoading ? '...' : stats.completedThisMonth.toString()}
            change="Jobs done"
            changeType="positive"
            icon={CheckCircle}
            iconColor="bg-success/10 text-success"
          />
          <StatCard
            title="Revenue This Month"
            value={isLoading ? '...' : formatMaluti(stats.revenueThisMonth)}
            change="Paid invoices"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-primary/10 text-primary"
          />
          <StatCard
            title="Pending Quotes"
            value={isLoading ? '...' : stats.pendingQuotes.toString()}
            change="Awaiting response"
            changeType="neutral"
            icon={FileText}
            iconColor="bg-warning/10 text-warning"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button variant="gradient" onClick={() => navigate('/workshop')} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Create Job Card
          </Button>
          <Button variant="outline" onClick={() => navigate('/quotes')} className="rounded-xl">
            <FileText className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
          <Button variant="outline" onClick={() => navigate('/invoices')} className="rounded-xl">
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Car className="h-5 w-5 text-coral" />
              Active Repairs Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : activeRepairs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active repairs. Create a job card to get started.</p>
            ) : (
              <div className="space-y-3">
                {activeRepairs.map((jc) => (
                  <div
                    key={jc.id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/workshop')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{jc.jobCardNumber}</span>
                        <Badge variant="secondary" className={getStatusColor(jc.status)}>
                          {jc.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm mt-1 truncate">{jc.clientName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[jc.vehicleMake, jc.vehicleModel, jc.vehicleReg].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    {jc.estimatedCompletion && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-3">
                        <Clock className="h-3 w-3" />
                        {new Date(jc.estimatedCompletion).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
