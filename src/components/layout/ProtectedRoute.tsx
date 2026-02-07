import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setCheckingSubscription(false);
        return;
      }

      try {
        // Check if user has a subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!subscription) {
          // Create free trial subscription for new users
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + 7);

          await supabase.from('subscriptions').insert({
            user_id: user.id,
            plan: 'free_trial',
            status: 'trialing',
            trial_ends_at: trialEndsAt.toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: trialEndsAt.toISOString(),
          });

          // Initialize usage tracking
          const periodStart = new Date();
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);

          await supabase.from('usage_tracking').insert({
            user_id: user.id,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
            clients_count: 0,
            quotes_count: 0,
            invoices_count: 0,
          });
        }

        // Check if user has modules — if not (legacy user), assign all active modules
        const { data: userModules } = await supabase
          .from('user_modules')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (!userModules || userModules.length === 0) {
          // Fetch all active modules and assign them
          const { data: allModules } = await supabase
            .from('platform_modules')
            .select('id')
            .eq('is_active', true);

          if (allModules && allModules.length > 0) {
            const rows = allModules.map((m) => ({
              user_id: user.id,
              module_id: m.id,
              is_active: true,
            }));
            await supabase.from('user_modules').insert(rows);
          }
        }

        setHasSubscription(true);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasSubscription(true); // Allow access on error to not block users
      } finally {
        setCheckingSubscription(false);
      }
    }

    if (!loading) {
      checkSubscription();
    }
  }, [user, loading]);

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
