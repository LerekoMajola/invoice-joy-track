import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CompanyOnboardingDialog } from '@/components/onboarding/CompanyOnboardingDialog';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const SchoolDashboard = lazy(() => import('@/pages/SchoolDashboard'));

export default function Dashboard() {
  const { hasProfile, isLoading: profileLoading } = useCompanyProfile();
  const { isAdmin } = useAuth();

  const [showOnboarding, setShowOnboarding] = useState(false);

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

  return (
    <Suspense fallback={<DashboardLoading />}>
      <SchoolDashboard />
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
