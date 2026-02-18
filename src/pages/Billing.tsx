import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useSmsCredits } from '@/hooks/useSmsCredits';
import { useModules } from '@/hooks/useModules';
import { formatMaluti } from '@/lib/currency';
import {
  Clock, AlertTriangle, Loader2, Smartphone, Building2,
  CheckCircle2, ChevronDown, Copy, MessageSquare, Package,
  CreditCard, Shield, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ADMIN_USER_ID = '89710bb3-dff7-4e5e-9af0-7ef7f3ad105d';

export default function Billing() {
  const { user } = useAuth();
  const { isTrialing, isTrialExpired, trialDaysRemaining, isActive, paymentReference } = useSubscription();
  const { profile: companyProfile } = useCompanyProfile();
  const { creditsRemaining, creditsUsed, creditsAllocated } = useSmsCredits();
  const { userModules, getMonthlyTotal } = useModules();
  const monthlyTotal = getMonthlyTotal();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const paymentSectionRef = React.useRef<HTMLDivElement>(null);

  const scrollToPayment = () => {
    paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const companyName = companyProfile?.company_name || 'your company';
  const smsPercent = creditsAllocated > 0 ? Math.round((creditsUsed / creditsAllocated) * 100) : 0;

  const copyReference = () => {
    navigator.clipboard.writeText(paymentReference);
    toast.success('Reference copied');
  };

  const handlePaymentNotification = async () => {
    if (!user) return;
    setSending(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: ADMIN_USER_ID,
        type: 'payment',
        title: 'Payment Notification',
        message: `${companyName} says they've made a payment. Reference: ${paymentReference}`,
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

  return (
    <DashboardLayout>
      <Header title="Billing & Subscription" subtitle="Manage your plan, payments and usage" />

      <div className="p-4 md:p-6 space-y-6 pb-safe max-w-3xl">
        {/* Status Hero */}
        <Card className="overflow-hidden">
          <div className={cn(
            "h-1.5",
            isActive ? "bg-green-500" : isTrialExpired ? "bg-destructive" : isTrialing ? "bg-amber-500" : "bg-muted"
          )} />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  isActive ? "bg-green-100 dark:bg-green-900/30" : isTrialExpired ? "bg-destructive/10" : "bg-amber-100 dark:bg-amber-900/30"
                )}>
                  {isActive ? <Shield className="h-5 w-5 text-green-600 dark:text-green-400" /> :
                   isTrialExpired ? <AlertTriangle className="h-5 w-5 text-destructive" /> :
                   <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {isActive ? 'Active Subscription' : isTrialExpired ? 'Trial Expired' : `Free Trial`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? 'Your account is fully active' :
                     isTrialExpired ? 'Make a payment to restore access' :
                     `${trialDaysRemaining} days remaining`}
                  </p>
                </div>
              </div>
              <Badge className={cn(
                "text-xs font-medium",
                isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                isTrialExpired ? "bg-destructive/10 text-destructive" :
                "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
              )} variant="secondary">
                {isActive ? 'Active' : isTrialExpired ? 'Expired' : 'Trial'}
              </Badge>
            </div>

            {isTrialing && !isTrialExpired && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Trial progress</span>
                  <span>{14 - trialDaysRemaining}/14 days</span>
                </div>
                <Progress value={((14 - trialDaysRemaining) / 14) * 100} className="h-2" />
                <Button onClick={scrollToPayment} className="w-full" size="sm">
                  <Zap className="h-4 w-4 mr-1.5" />
                  Subscribe Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Package */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5 text-primary" />
              Your Package
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {userModules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No modules selected.</p>
            ) : (
              <div className="space-y-2">
                {userModules.map((um) => (
                  <div key={um.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm text-foreground">{um.module?.name}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{formatMaluti(um.module?.monthly_price || 0)}</span>
                  </div>
                ))}
              </div>
            )}
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Monthly Total</span>
              <span className="text-xl font-bold text-foreground">{formatMaluti(monthlyTotal)}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <div ref={paymentSectionRef} className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Make a Payment
          </h2>

          {/* Payment Reference */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1.5">Your payment reference</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono font-bold text-foreground tracking-wider">{paymentReference}</span>
                <Button variant="outline" size="sm" onClick={copyReference} className="shrink-0">
                  <Copy className="h-3.5 w-3.5 mr-1.5" />Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Always include this reference when making payment</p>
            </CardContent>
          </Card>

          {/* M-Pesa */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="h-5 w-5 text-green-600" />
                Pay via M-Pesa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {[
                  ['Dial', '*111#', 'on your phone'],
                  ['Select', 'Pay Bill', ''],
                  ['Enter business number:', '123456', ''],
                  ['Enter reference:', paymentReference, ''],
                  ['Enter your PIN and confirm', '', ''],
                ].map(([pre, bold, post], i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-muted-foreground">
                      {pre} {bold && <strong className="text-foreground">{bold}</strong>} {post}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer */}
          <Collapsible open={bankOpen} onOpenChange={setBankOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer pb-2 hover:bg-muted/30 transition-colors rounded-t-xl">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      Pay via Bank Transfer
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${bankOpen ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                    {[
                      ['Bank', 'FNB Lesotho'],
                      ['Account Name', 'Orion Labs (Pty) Ltd'],
                      ['Account Number', '62012345678'],
                      ['Branch Code', '260001'],
                      ['Reference', paymentReference],
                    ].map(([label, value]) => (
                      <>
                        <span key={`l-${label}`} className="text-muted-foreground">{label}</span>
                        <span key={`v-${label}`} className="text-foreground font-medium font-mono">{value}</span>
                      </>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* I've Made Payment */}
          {sent ? (
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Payment notification sent</p>
                  <p className="text-xs text-muted-foreground">We'll verify your payment and activate your account shortly.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={handlePaymentNotification} disabled={sending} className="w-full h-12 text-base font-semibold" size="lg">
              {sending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : "I've Made Payment"}
            </Button>
          )}
        </div>

        {/* SMS Credits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-primary" />
              SMS Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-foreground">{creditsRemaining}</span>
                <span className="text-sm text-muted-foreground ml-1">/ {creditsAllocated}</span>
              </div>
              <span className="text-xs text-muted-foreground">credits remaining</span>
            </div>
            <Progress value={smsPercent} className="h-2" />
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="text-lg font-bold text-foreground">{creditsUsed}</div>
                <div className="text-xs text-muted-foreground">Sent</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="text-lg font-bold text-primary">{creditsRemaining}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">SMS credits reset monthly. Contact support for additional credits.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
