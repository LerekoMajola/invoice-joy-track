import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Wallet, CalendarDays, AlertCircle, Plus, FileText, Users } from 'lucide-react';
import { formatMaluti } from '@/lib/currency';
import { useStudents } from '@/hooks/useStudents';
import { useSchoolFees } from '@/hooks/useSchoolFees';
import { useInvoices } from '@/hooks/useInvoices';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function SchoolDashboard() {
  const { students, isLoading: studentsLoading } = useStudents();
  const { payments, isLoading: feesLoading } = useSchoolFees();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isLoading = studentsLoading || feesLoading || invoicesLoading;

  // Fetch active terms
  const { data: terms = [] } = useQuery({
    queryKey: ['academic-terms-dashboard', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('academic_terms')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements-dashboard', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('school_announcements')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    
    // Fee collection
    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const unpaidInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
    const totalOutstanding = unpaidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const totalFees = totalCollected + totalOutstanding;
    const collectionRate = totalFees > 0 ? Math.round((totalCollected / totalFees) * 100) : 0;

    const activeTerms = terms.filter(t => t.is_current).length;
    const pendingPayments = unpaidInvoices.length;

    return {
      totalStudents,
      activeStudents,
      collectionRate,
      totalCollected,
      totalOutstanding,
      activeTerms,
      pendingPayments,
    };
  }, [students, payments, invoices, terms]);

  return (
    <DashboardLayout>
      <Header
        title="School Dashboard"
        subtitle="Manage students, fees, and school operations."
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-safe">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Total Students"
            value={isLoading ? '...' : stats.totalStudents.toString()}
            change={`${stats.activeStudents} active`}
            changeType="positive"
            icon={GraduationCap}
            iconColor="bg-info/10 text-info"
          />
          <StatCard
            title="Fee Collection"
            value={isLoading ? '...' : `${stats.collectionRate}%`}
            change={formatMaluti(stats.totalCollected) + ' collected'}
            changeType={stats.collectionRate >= 80 ? 'positive' : 'negative'}
            icon={Wallet}
            iconColor="bg-success/10 text-success"
          />
          <StatCard
            title="Active Terms"
            value={isLoading ? '...' : stats.activeTerms.toString()}
            change={`${terms.length} total`}
            changeType="neutral"
            icon={CalendarDays}
            iconColor="bg-primary/10 text-primary"
          />
          <StatCard
            title="Pending Payments"
            value={isLoading ? '...' : stats.pendingPayments.toString()}
            change={formatMaluti(stats.totalOutstanding) + ' outstanding'}
            changeType={stats.pendingPayments > 0 ? 'negative' : 'neutral'}
            icon={AlertCircle}
            iconColor="bg-warning/10 text-warning"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button variant="gradient" onClick={() => navigate('/school-fees')} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
          <Button variant="outline" onClick={() => navigate('/students')} className="rounded-xl">
            <Users className="h-4 w-4 mr-2" />
            Add Student
          </Button>
          <Button variant="outline" onClick={() => navigate('/invoices')} className="rounded-xl">
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Fee Collection Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Fee Collection Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collected</span>
                <span className="font-medium">{formatMaluti(stats.totalCollected)}</span>
              </div>
              <Progress value={stats.collectionRate} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-medium text-destructive">{formatMaluti(stats.totalOutstanding)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        {announcements.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl border bg-card">
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
