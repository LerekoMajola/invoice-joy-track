import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useModules } from '@/hooks/useModules';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatMaluti } from '@/lib/currency';
import { toast } from 'sonner';
import {
  Shield,
  Smartphone,
  Building2,
  CheckCircle2,
  Loader2,
  LogOut,
  Copy,
  Lock,
  RefreshCw,
  MessageCircle,
  Sparkles,
  Database,
} from 'lucide-react';

const ADMIN_USER_ID = '89710bb3-dff7-4e5e-9af0-7ef7f3ad105d';

export default function PaymentRequired() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { needsPayment, paymentReference, isLoading: subLoading } = useSubscription();
  const { getMonthlyTotal, userModules } = useModules();
  const { profile: companyProfile } = useCompanyProfile();
  const queryClient = useQueryClient();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [checking, setChecking] = useState(false);

  const monthlyTotal = getMonthlyTotal();
  const companyName = companyProfile?.company_name || 'your company';
  const activeModules = userModules.filter(um => um.is_active && um.module);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const handlePaymentNotification = async () => {
    if (!user) return;
    setSending(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: ADMIN_USER_ID,
        type: 'payment',
        title: 'Payment Notification',
        message: `${companyName} says they've made payment of ${formatMaluti(monthlyTotal)}. Reference: ${paymentReference}`,
        reference_id: user.id,
        reference_type: 'subscription',
        link: '/admin',
      });
      if (error) throw error;
      setSent(true);
      toast.success('Payment notification sent! We will verify and activate your account.');
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error('Failed to send notification. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    await queryClient.invalidateQueries({ queryKey: ['subscription'] });
    setTimeout(() => setChecking(false), 2000);
  };


  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!needsPayment) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="w-full max-w-md space-y-5">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            Your trial has ended
          </h1>
          <p className="text-white/80 text-sm">
            Subscribe to continue using all your features. Your data is safe and waiting for you.
          </p>
        </div>

        {/* Active Modules */}
        {activeModules.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {activeModules.map(um => (
              <Badge
                key={um.id}
                variant="secondary"
                className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs"
              >
                {um.module?.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Amount Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-1 w-full" style={{ background: 'var(--gradient-primary)' }} />
          <CardContent className="p-5 text-center space-y-1">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              Monthly subscription
            </p>
            <p className="text-4xl font-bold text-foreground tracking-tight">{formatMaluti(monthlyTotal)}</p>
            <p className="text-sm font-medium text-muted-foreground">per month</p>
            {activeModules.length > 0 && (
              <p className="text-xs text-muted-foreground pt-1">
                {activeModules.length} active module{activeModules.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Reference */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Your payment reference</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-mono font-bold text-foreground tracking-wider">
                {paymentReference}
              </span>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(paymentReference, 'Reference')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Always include this reference when making payment
            </p>
          </CardContent>
        </Card>

        {/* Payment Methods Tabs */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <Tabs defaultValue="mpesa">
              <TabsList className="w-full">
                <TabsTrigger value="mpesa" className="flex-1 gap-1.5">
                  <Smartphone className="h-4 w-4" />
                  M-Pesa
                </TabsTrigger>
                <TabsTrigger value="bank" className="flex-1 gap-1.5">
                  <Building2 className="h-4 w-4" />
                  Bank Transfer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mpesa" className="mt-4 space-y-3">
                <ol className="space-y-2.5 text-sm text-muted-foreground">
                  {[
                    { step: 'Dial *111# on your phone', bold: '*111#' },
                    { step: 'Select Pay Bill' },
                    { step: 'Business number: 123456', bold: '123456', copy: '123456', label: 'Business number' },
                    { step: `Reference: ${paymentReference}`, bold: paymentReference, copy: paymentReference, label: 'Reference' },
                    { step: `Amount: ${formatMaluti(monthlyTotal)}`, bold: formatMaluti(monthlyTotal) },
                    { step: 'Enter your PIN and confirm' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="flex-1">
                        {item.bold ? (
                          <>
                            {item.step.split(item.bold)[0]}
                            <strong className="text-foreground">{item.bold}</strong>
                            {item.step.split(item.bold)[1]}
                          </>
                        ) : item.step}
                      </span>
                      {item.copy && (
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyToClipboard(item.copy!, item.label!)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ol>
              </TabsContent>

              <TabsContent value="bank" className="mt-4 space-y-3">
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Bank', value: 'FNB Lesotho' },
                    { label: 'Account Name', value: 'Orion Labs (Pty) Ltd' },
                    { label: 'Account Number', value: '62012345678', copyable: true },
                    { label: 'Branch Code', value: '260001', copyable: true },
                    { label: 'Reference', value: paymentReference, copyable: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{item.label}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-foreground font-medium font-mono">{item.value}</span>
                        {item.copyable && (
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyToClipboard(item.value, item.label)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Post-Payment / CTA */}
        {sent ? (
          <Card className="border-0 shadow-lg bg-accent/5">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Payment notification sent</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll verify your payment and activate your account within a few minutes. You'll get full access once confirmed.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCheckStatus}
                disabled={checking}
              >
                {checking ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Checking...</>
                ) : (
                  <><RefreshCw className="h-4 w-4 mr-2" /> Check activation status</>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={handlePaymentNotification}
            disabled={sending}
            className="w-full h-12 text-base font-semibold shadow-lg"
            size="lg"
          >
            {sending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
            ) : (
              "I've Made Payment"
            )}
          </Button>
        )}

        {/* Trust elements */}
        <div className="flex items-center justify-center gap-4 text-white/70 text-xs">
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            <span>Data preserved</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Instant activation</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-white/70 hover:text-white hover:bg-white/10">
            <LogOut className="h-4 w-4 mr-1" />
            Sign out
          </Button>
          <a
            href="https://wa.me/26650000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Need help?
          </a>
        </div>
      </div>
    </div>
  );
}
