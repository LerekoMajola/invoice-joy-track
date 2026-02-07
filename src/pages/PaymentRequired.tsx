import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useModules } from '@/hooks/useModules';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatMaluti } from '@/lib/currency';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Smartphone,
  Building2,
  CheckCircle2,
  ChevronDown,
  Loader2,
  LogOut,
  Copy,
} from 'lucide-react';

const ADMIN_USER_ID = '89710bb3-dff7-4e5e-9af0-7ef7f3ad105d';

export default function PaymentRequired() {
  const { user, signOut } = useAuth();
  const { needsPayment, paymentReference, isLoading: subLoading } = useSubscription();
  const { getMonthlyTotal } = useModules();
  const { profile: companyProfile } = useCompanyProfile();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);

  const monthlyTotal = getMonthlyTotal();
  const companyName = companyProfile?.company_name || 'your company';

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

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user doesn't need payment, redirect to dashboard
  if (!needsPayment) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Your free trial has ended
          </h1>
          <p className="text-muted-foreground text-sm">
            To continue using the platform, please make a payment below.
          </p>
        </div>

        {/* Amount Due */}
        <Card className="border-primary/20">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Monthly subscription</p>
            <p className="text-3xl font-bold text-foreground">{formatMaluti(monthlyTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">{companyName}</p>
          </CardContent>
        </Card>

        {/* Payment Reference */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Your payment reference</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-mono font-bold text-foreground tracking-wider">
                {paymentReference}
              </span>
              <Button variant="ghost" size="sm" onClick={copyReference}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Always include this reference when making payment
            </p>
          </CardContent>
        </Card>

        {/* M-Pesa Instructions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-5 w-5 text-success" />
              Pay via M-Pesa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</Badge>
                <span>Dial <strong className="text-foreground">*111#</strong> on your phone</span>
              </li>
              <li className="flex gap-2">
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</Badge>
                <span>Select <strong className="text-foreground">Pay Bill</strong></span>
              </li>
              <li className="flex gap-2">
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</Badge>
                <span>Enter business number: <strong className="text-foreground">123456</strong></span>
              </li>
              <li className="flex gap-2">
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</Badge>
                <span>Enter reference: <strong className="text-foreground">{paymentReference}</strong></span>
              </li>
              <li className="flex gap-2">
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">5</Badge>
                <span>Enter amount: <strong className="text-foreground">{formatMaluti(monthlyTotal)}</strong></span>
              </li>
              <li className="flex gap-2">
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 mt-0.5">6</Badge>
                <span>Enter your PIN and confirm</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Bank Transfer (collapsible) */}
        <Collapsible open={bankOpen} onOpenChange={setBankOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-info" />
                    Pay via Bank Transfer
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${bankOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-y-2 text-muted-foreground">
                  <span>Bank</span>
                  <span className="text-foreground font-medium">FNB Lesotho</span>
                  <span>Account Name</span>
                  <span className="text-foreground font-medium">Orion Labs (Pty) Ltd</span>
                  <span>Account Number</span>
                  <span className="text-foreground font-medium">62012345678</span>
                  <span>Branch Code</span>
                  <span className="text-foreground font-medium">260001</span>
                  <span>Reference</span>
                  <span className="text-foreground font-medium font-mono">{paymentReference}</span>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* I've Made Payment Button */}
        {sent ? (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Payment notification sent</p>
                <p className="text-xs text-muted-foreground">
                  We'll verify your payment and activate your account shortly. You'll get full access once confirmed.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={handlePaymentNotification}
            disabled={sending}
            className="w-full h-12 text-base"
            size="lg"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "I've Made Payment"
            )}
          </Button>
        )}

        {/* Sign out link */}
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-muted-foreground">
            <LogOut className="h-4 w-4 mr-1" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
