import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { TendersList } from '@/components/dashboard/TendersList';
import { TenderSourceLinks } from '@/components/dashboard/TenderSourceLinks';
import { FileText, Receipt, Users, TrendingUp } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { useQuotes } from '@/hooks/useQuotes';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { useDeliveryNotes } from '@/hooks/useDeliveryNotes';
import { useMemo } from 'react';

export default function Dashboard() {
  const { quotes, isLoading: quotesLoading } = useQuotes();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { clients, isLoading: clientsLoading } = useClients();
  const { deliveryNotes, isLoading: deliveryNotesLoading } = useDeliveryNotes();

  const isLoading = quotesLoading || invoicesLoading || clientsLoading || deliveryNotesLoading;

  const stats = useMemo(() => {
    // Total Revenue (paid invoices)
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0);

    // Count paid invoices
    const paidInvoicesCount = invoices.filter(i => i.status === 'paid').length;

    // Active Quotes (draft + sent)
    const activeQuotes = quotes.filter(q => q.status === 'draft' || q.status === 'sent');
    const pendingQuotes = quotes.filter(q => q.status === 'sent');

    // Unpaid Invoices (sent + overdue)
    const unpaidInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
    const unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

    return {
      totalRevenue,
      paidInvoicesCount,
      activeQuotesCount: activeQuotes.length,
      pendingQuotesCount: pendingQuotes.length,
      unpaidTotal,
      unpaidInvoicesCount: unpaidInvoices.length,
      totalClients: clients.length,
    };
  }, [quotes, invoices, clients]);

  return (
    <DashboardLayout>
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your business." 
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={isLoading ? '...' : formatMaluti(stats.totalRevenue)}
            change={isLoading ? '' : `${stats.paidInvoicesCount} invoice${stats.paidInvoicesCount !== 1 ? 's' : ''} paid`}
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-success/10 text-success"
          />
          <StatCard
            title="Active Quotes"
            value={isLoading ? '...' : stats.activeQuotesCount.toString()}
            change={isLoading ? '' : `${stats.pendingQuotesCount} pending response`}
            changeType="neutral"
            icon={FileText}
            iconColor="bg-primary/10 text-primary"
          />
          <StatCard
            title="Unpaid Invoices"
            value={isLoading ? '...' : formatMaluti(stats.unpaidTotal)}
            change={isLoading ? '' : `${stats.unpaidInvoicesCount} invoice${stats.unpaidInvoicesCount !== 1 ? 's' : ''} outstanding`}
            changeType={stats.unpaidInvoicesCount > 0 ? "negative" : "neutral"}
            icon={Receipt}
            iconColor="bg-warning/10 text-warning"
          />
          <StatCard
            title="Total Clients"
            value={isLoading ? '...' : stats.totalClients.toString()}
            change={isLoading ? '' : `${clients.length} registered`}
            changeType="positive"
            icon={Users}
            iconColor="bg-info/10 text-info"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivity 
            quotes={quotes}
            invoices={invoices}
            deliveryNotes={deliveryNotes}
            clients={clients}
            isLoading={isLoading}
          />
          <UpcomingTasks 
            quotes={quotes}
            invoices={invoices}
            isLoading={isLoading}
          />
        </div>

        {/* Tender Source Links */}
        <TenderSourceLinks />

        {/* Tenders Section */}
        <TendersList />
      </div>
    </DashboardLayout>
  );
}
