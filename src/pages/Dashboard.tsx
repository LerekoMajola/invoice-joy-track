import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CompanyOnboardingDialog } from '@/components/onboarding/CompanyOnboardingDialog';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const SchoolDashboard = lazy(() => import('@/pages/SchoolDashboard'));
const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard'));
const WorkshopDashboard = lazy(() => import('@/pages/WorkshopDashboard'));
const LegalDashboard = lazy(() => import('@/pages/LegalDashboard'));
const HireDashboard = lazy(() => import('@/pages/HireDashboard'));
const GuestHouseDashboard = lazy(() => import('@/pages/GuestHouseDashboard'));
const FleetDashboard = lazy(() => import('@/pages/FleetDashboard'));

export default function Dashboard() {
  const { hasProfile, isLoading: profileLoading } = useCompanyProfile();
  const { isAdmin, loading: authLoading } = useAuth();
  const { systemType } = useSubscription();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!profileLoading && !hasProfile && !isAdmin) {
      const dismissed = sessionStorage.getItem('onboarding-dismissed');
      if (!dismissed) {
        setShowOnboarding(true);
      }
    }
  }, [profileLoading, hasProfile, isAdmin]);

  // Redirect super_admin users to the admin dashboard
  if (!authLoading && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleOnboardingClose = (open: boolean) => {
    if (!open) {
      sessionStorage.setItem('onboarding-dismissed', 'true');
    }
    setShowOnboarding(open);
  };

  const renderDashboard = () => {
    switch (systemType) {
      case 'workshop':
        return <WorkshopDashboard />;
      case 'school':
        return <SchoolDashboard />;
      case 'legal':
        return <LegalDashboard />;
      case 'hire':
        return <HireDashboard />;
      case 'guesthouse':
        return <GuestHouseDashboard />;
      case 'fleet':
        return <FleetDashboard />;
      case 'business':
      default:
        return <BusinessDashboard />;
    }
  };

  return (
    <Suspense fallback={<DashboardLoading />}>
      {renderDashboard()}
      <CompanyOnboardingDialog open={showOnboarding} onOpenChange={handleOnboardingClose} />
    </Suspense>
  );
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
