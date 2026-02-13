import { ReactNode, useEffect, useState, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Check sessionStorage cache to skip spinner on reload/tab return
  const cachedUserId = (() => {
    try { return sessionStorage.getItem('subscription_checked_user'); } catch { return null; }
  })();
  const isCached = !!user && !!cachedUserId && cachedUserId === user.id;

  const [checkingSubscription, setCheckingSubscription] = useState(!isCached);
  const [needsPayment, setNeedsPayment] = useState(false);
  const [error, setError] = useState(false);

  const hasCheckedRef = useRef<string | null>(isCached ? user.id : null);
  const userRef = useRef(user);
  userRef.current = user;

  const checkSubscription = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) {
      setCheckingSubscription(false);
      return;
    }

    // Skip if already checked for this user
    if (hasCheckedRef.current === currentUser.id) {
      setCheckingSubscription(false);
      return;
    }

    setError(false);
    setCheckingSubscription(true);

    try {
      // Check if user has a subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id, status, trial_ends_at')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (!subscription) {
        // Create free trial subscription for new users
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7);

        // Read system_type from user_metadata (set during signup)
        const systemType = currentUser.user_metadata?.system_type || 'business';

        await supabase.from('subscriptions').insert({
          user_id: currentUser.id,
          plan: 'free_trial',
          status: 'trialing',
          trial_ends_at: trialEndsAt.toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: trialEndsAt.toISOString(),
          system_type: systemType,
        });

        // Initialize usage tracking
        const periodStart = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabase.from('usage_tracking').insert({
          user_id: currentUser.id,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          clients_count: 0,
          quotes_count: 0,
          invoices_count: 0,
        });
      } else {
        // Check if trial has expired and subscription is not active
        const isTrialing = subscription.status === 'trialing';
        const trialExpired = isTrialing && subscription.trial_ends_at
          ? new Date(subscription.trial_ends_at).getTime() < Date.now()
          : false;
        const isActive = subscription.status === 'active';

        if (trialExpired && !isActive) {
          setNeedsPayment(true);
        }
      }

      // Check if user has modules — if not, assign based on signup metadata or all (legacy)
      const { data: userModules } = await supabase
        .from('user_modules')
        .select('id')
        .eq('user_id', currentUser.id)
        .limit(1);

      if (!userModules || userModules.length === 0) {
        const selectedKeys: string[] = currentUser.user_metadata?.selected_module_keys;

        if (selectedKeys && selectedKeys.length > 0) {
          // New user: assign only the modules they selected during signup + core modules
          const { data: allModules } = await supabase
            .from('platform_modules')
            .select('id, key, is_core')
            .eq('is_active', true);

          if (allModules && allModules.length > 0) {
            const modulesToAssign = allModules.filter(
              (m) => selectedKeys.includes(m.key) || m.is_core
            );
            if (modulesToAssign.length > 0) {
              const rows = modulesToAssign.map((m) => ({
                user_id: currentUser.id,
                module_id: m.id,
                is_active: true,
              }));
              await supabase.from('user_modules').insert(rows);
            }
          }
        } else {
          // Legacy user with no metadata: assign all active modules
          const { data: allModules } = await supabase
            .from('platform_modules')
            .select('id')
            .eq('is_active', true);

          if (allModules && allModules.length > 0) {
            const rows = allModules.map((m) => ({
              user_id: currentUser.id,
              module_id: m.id,
              is_active: true,
            }));
            await supabase.from('user_modules').insert(rows);
          }
        }
      }

      hasCheckedRef.current = currentUser.id;
      try { sessionStorage.setItem('subscription_checked_user', currentUser.id); } catch {}
    } catch (err) {
      console.error('Error checking subscription:', err);
      // FAIL CLOSED: block access when we can't verify subscription status
      setError(true);
    } finally {
      setCheckingSubscription(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loading) {
      checkSubscription();
    }
  }, [loading, checkSubscription]);

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

  // Fail-closed error state: block access and offer retry
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Unable to verify access</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We couldn't verify your subscription status. Please check your connection and try again.
              </p>
            </div>
            <Button onClick={checkSubscription} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsPayment) {
    return <Navigate to="/payment-required" replace />;
  }

  return <>{children}</>;
}
