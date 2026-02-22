import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CompanyOnboardingDialog } from '@/components/onboarding/CompanyOnboardingDialog';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard'));
const LegalDashboard = lazy(() => import('@/pages/LegalDashboard'));
const GymDashboard = lazy(() => import('@/pages/GymDashboard'));

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
      case 'legal':
        return <LegalDashboard />;
      case 'gym':
        return <GymDashboard />;
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
