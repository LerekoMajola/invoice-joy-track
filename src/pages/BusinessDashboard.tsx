import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, TrendingUp, Receipt, Plus } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { useInvoices } from '@/hooks/useInvoices';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TenderSourceLinks } from '@/components/dashboard/TenderSourceLinks';
import { DashboardDateBanner } from '@/components/dashboard/DashboardDateBanner';

const businessQuotes = [
  "Success is not final, failure is not fatal — it is the courage to continue that counts.",
  "Every client interaction is an opportunity to build something great.",
  "Small daily improvements lead to stunning long-term results.",
  "Your hustle today is your empire tomorrow.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does — keep going.",
  "Great things in business are never done by one person. They're done by a team.",
  "Opportunities don't happen. You create them.",
  "The way to get started is to quit talking and begin doing.",
  "Stay hungry, stay foolish, stay consistent.",
  "Revenue is vanity, profit is sanity, cash is king.",
  "A satisfied customer is the best business strategy of all.",
  "In the middle of every difficulty lies opportunity.",
  "Quality means doing it right when no one is looking.",
  "Your most unhappy customers are your greatest source of learning.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Build something people want, and the rest will follow.",
  "Discipline is the bridge between goals and accomplishment.",
];

export default function BusinessDashboard() {
  const { clients, isLoading: clientsLoading } = useClients();
  const { quotes, isLoading: quotesLoading } = useQuotes();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const navigate = useNavigate();

  const isLoading = clientsLoading || quotesLoading || invoicesLoading;

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalClients = clients.length;
    const quotesThisMonth = quotes.filter(q => new Date(q.date) >= startOfMonth).length;
    const revenueThisMonth = invoices
      .filter(i => i.status === 'paid' && new Date(i.date) >= startOfMonth)
      .reduce((sum, i) => sum + (i.total || 0), 0);
    const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length;
    const pendingQuotes = quotes.filter(q => q.status === 'sent').length;
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;

    return {
      totalClients,
      quotesThisMonth,
      revenueThisMonth,
      pendingInvoices,
      pendingQuotes,
      acceptedQuotes,
    };
  }, [clients, quotes, invoices]);

  const recentQuotes = useMemo(() => {
    return [...quotes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [quotes]);

  const statusStyles: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    sent: 'bg-info/10 text-info',
    accepted: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <DashboardLayout>
      <Header
        title="Dashboard"
        subtitle="Track quotes, invoices, and client activity."
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-safe">
        {/* Date, Clock & Motivational Message */}
        <DashboardDateBanner quotes={businessQuotes} theme="business" />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Total Clients"
            value={isLoading ? '...' : stats.totalClients.toString()}
            change={`${clients.length} total`}
            changeType="positive"
            icon={Users}
            iconColor="bg-primary/10 text-primary"
          />
          <StatCard
            title="Quotes This Month"
            value={isLoading ? '...' : stats.quotesThisMonth.toString()}
            change={`${stats.pendingQuotes} pending`}
            changeType="neutral"
            icon={FileText}
            iconColor="bg-info/10 text-info"
          />
          <StatCard
            title="Revenue This Month"
            value={isLoading ? '...' : formatMaluti(stats.revenueThisMonth)}
            change="Paid invoices"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-success/10 text-success"
          />
          <StatCard
            title="Pending Invoices"
            value={isLoading ? '...' : stats.pendingInvoices.toString()}
            change="Awaiting payment"
            changeType={stats.pendingInvoices > 0 ? 'negative' : 'neutral'}
            icon={Receipt}
            iconColor="bg-warning/10 text-warning"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button variant="gradient" onClick={() => navigate('/quotes')} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
          <Button variant="outline" onClick={() => navigate('/invoices')} className="rounded-xl">
            <Receipt className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
          <Button variant="outline" onClick={() => navigate('/clients')} className="rounded-xl">
            <Users className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Recent Quotes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentQuotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quotes yet. Create your first quote to get started.</p>
            ) : (
              <div className="space-y-3">
                {recentQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/quotes')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{quote.quoteNumber}</span>
                        <Badge variant="secondary" className={cn('text-xs', statusStyles[quote.status])}>
                          {quote.status}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm mt-1 truncate">{quote.clientName}</p>
                    </div>
                    <span className="text-sm font-semibold ml-3">{formatMaluti(quote.total || 0)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tender Source Links */}
        <TenderSourceLinks />
      </div>
    </DashboardLayout>
  );
}
