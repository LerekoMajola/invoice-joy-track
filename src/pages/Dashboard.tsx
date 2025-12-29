import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { TendersList } from '@/components/dashboard/TendersList';
import { FileText, Receipt, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
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
            value="M48,250"
            change="+12.5% from last month"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-success/10 text-success"
          />
          <StatCard
            title="Active Quotes"
            value="12"
            change="3 pending response"
            changeType="neutral"
            icon={FileText}
            iconColor="bg-primary/10 text-primary"
          />
          <StatCard
            title="Unpaid Invoices"
            value="M8,420"
            change="5 invoices outstanding"
            changeType="negative"
            icon={Receipt}
            iconColor="bg-warning/10 text-warning"
          />
          <StatCard
            title="Total Clients"
            value="47"
            change="+3 this month"
            changeType="positive"
            icon={Users}
            iconColor="bg-info/10 text-info"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivity />
          <UpcomingTasks />
        </div>

        {/* Tenders Section */}
        <TendersList />
      </div>
    </DashboardLayout>
  );
}
