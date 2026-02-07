import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { CompanyOnboardingDialog } from '@/components/onboarding/CompanyOnboardingDialog';
import { FileText, Receipt, Users, TrendingUp } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { useQuotes } from '@/hooks/useQuotes';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy-load system-specific dashboard content
import { TendersList } from '@/components/dashboard/TendersList';
import { TenderSourceLinks } from '@/components/dashboard/TenderSourceLinks';
import { LeadsPipeline } from '@/components/dashboard/LeadsPipeline';
import { CompanyDocuments } from '@/components/dashboard/CompanyDocuments';
import { DashboardTodoList } from '@/components/dashboard/DashboardTodoList';

const WorkshopDashboard = lazy(() => import('@/pages/WorkshopDashboard'));
const SchoolDashboard = lazy(() => import('@/pages/SchoolDashboard'));

export default function Dashboard() {
  const { systemType, isLoading: subLoading } = useSubscription();
  const { hasProfile, isLoading: profileLoading } = useCompanyProfile();
  const { isAdmin } = useAuth();

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding dialog for non-admin users without a company profile
  useEffect(() => {
    if (!profileLoading && !hasProfile && !isAdmin) {
      const dismissed = sessionStorage.getItem('onboarding-dismissed');
      if (!dismissed) {
        setShowOnboarding(true);
      }
    }
  }, [profileLoading, hasProfile, isAdmin]);

  const handleOnboardingClose = (open: boolean) => {
    if (!open) {
      sessionStorage.setItem('onboarding-dismissed', 'true');
    }
    setShowOnboarding(open);
  };

  // Route to the correct dashboard based on system_type
  if (systemType === 'workshop') {
    return (
      <Suspense fallback={<DashboardLoading />}>
        <WorkshopDashboard />
        <CompanyOnboardingDialog open={showOnboarding} onOpenChange={handleOnboardingClose} />
      </Suspense>
    );
  }

  if (systemType === 'school') {
    return (
      <Suspense fallback={<DashboardLoading />}>
        <SchoolDashboard />
        <CompanyOnboardingDialog open={showOnboarding} onOpenChange={handleOnboardingClose} />
      </Suspense>
    );
  }

  // Default: Business dashboard
  return <BusinessDashboard showOnboarding={showOnboarding} onOnboardingClose={handleOnboardingClose} />;
}

function DashboardLoading() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );
}

function BusinessDashboard({ showOnboarding, onOnboardingClose }: { showOnboarding: boolean; onOnboardingClose: (open: boolean) => void }) {
  const { quotes, isLoading: quotesLoading } = useQuotes();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { clients, isLoading: clientsLoading } = useClients();

  const isLoading = quotesLoading || invoicesLoading || clientsLoading;

  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0);
    const paidInvoicesCount = invoices.filter(i => i.status === 'paid').length;
    const activeQuotes = quotes.filter(q => q.status === 'draft' || q.status === 'sent');
    const pendingQuotes = quotes.filter(q => q.status === 'sent');
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

      <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-safe">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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

        <DashboardTodoList />
        <TendersList />
        <LeadsPipeline />
        <CompanyDocuments />
        <TenderSourceLinks />
      </div>

      <CompanyOnboardingDialog open={showOnboarding} onOpenChange={onOnboardingClose} />
    </DashboardLayout>
  );
}
