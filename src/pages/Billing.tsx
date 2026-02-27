import React, { useState, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useModules } from '@/hooks/useModules';
import { usePackageTiers } from '@/hooks/usePackageTiers';
import { usePackageChangeRequests } from '@/hooks/usePackageChangeRequests';
import { useCurrency } from '@/hooks/useCurrency';
import { usePlatformBanking } from '@/hooks/usePlatformSettings';
import {
  AlertTriangle, Loader2, Building2,
  CheckCircle2, Copy, Package,
  CreditCard, Shield, Zap, ArrowRight, Upload, FileImage, X, Clock,
  Check, Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ADMIN_USER_ID = '89710bb3-dff7-4e5e-9af0-7ef7f3ad105d';

export default function Billing() {
  const { user } = useAuth();
  const { isTrialing, isTrialExpired, trialDaysRemaining, isActive, paymentReference, packageTierId, systemType, subscription } = useSubscription();
  const { profile: companyProfile } = useCompanyProfile();
  const { userModules, getMonthlyTotal } = useModules();
  const { tiers, getTierById, getTiersForSystem } = usePackageTiers();
  const { fc } = useCurrency();
  const { banking } = usePlatformBanking();
  const { hasPendingRequest, submitRequest } = usePackageChangeRequests();
  const selectedTier = packageTierId ? getTierById(packageTierId) : null;
  const monthlyTotal = selectedTier ? selectedTier.bundle_price : getMonthlyTotal();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [confirmTier, setConfirmTier] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [popUrl, setPopUrl] = useState<string | null>((subscription as any)?.pop_url || null);
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const companyName = companyProfile?.company_name || 'your company';
  const availableTiers = getTiersForSystem(systemType);

  const scrollToPayment = () => {
    paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        message: `${companyName} says they've made a payment. Reference: ${paymentReference}${popUrl ? `. POP: ${popUrl}` : ''}`,
        reference_id: user.id,
        reference_type: 'subscription',
        link: '/admin',
      });
      if (error) throw error;
      setSent(true);
      toast.success('Payment notification sent!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  const handleSwitchRequest = async (tier: any) => {
    if (!user) return;
    try {
      // Insert into package_change_requests table
      await submitRequest.mutateAsync({
        companyName: companyName,
        currentTierId: packageTierId || null,
        requestedTierId: tier.id,
      });

      // Also send a notification to admin
      await supabase.from('notifications').insert({
        user_id: ADMIN_USER_ID,
        type: 'payment',
        title: 'Package Switch Request',
        message: `${companyName} requests to switch to "${tier.display_name}" package.`,
        reference_id: user.id,
        reference_type: 'subscription',
        link: '/admin',
      });

      toast.success(`Switch request sent for ${tier.display_name}`);
      setSwitchOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send request.');
    }
  };

  const handlePopUpload = useCallback(async (file: File) => {
    if (!user || !subscription) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('payment-pop').upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from('payment-pop').getPublicUrl(path);
      const { error: updateErr } = await supabase.from('subscriptions').update({ pop_url: publicUrl } as any).eq('id', subscription.id);
      if (updateErr) throw updateErr;
      setPopUrl(publicUrl);
      toast.success('Proof of payment uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  }, [user, subscription]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePopUpload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handlePopUpload(file);
  };

  const bankDetails = [
    { label: 'Bank', value: banking.bank_name },
    { label: 'Account Name', value: banking.bank_account_name },
    { label: 'Account Number', value: banking.bank_account_number },
    { label: 'Branch Code', value: banking.bank_branch_code },
    { label: 'Reference', value: paymentReference },
  ];

  return (
    <DashboardLayout>
      <Header title="Billing & Subscription" subtitle="Manage your plan, payments and usage" />

      <div className="p-4 md:p-6 space-y-6 pb-safe max-w-3xl">

        {/* Status Hero */}
        <Card className="overflow-hidden border-0 shadow-lg relative">
          <div className="absolute inset-0 opacity-5" style={{ background: 'var(--gradient-primary)' }} />
          <div className={cn(
            "h-1.5 relative z-10",
            isActive ? "bg-success" : isTrialExpired ? "bg-destructive" : "bg-warning"
          )} />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                  isActive ? "bg-success/10 shadow-[var(--shadow-glow-success)]" :
                  isTrialExpired ? "bg-destructive/10" :
                  "bg-warning/10"
                )}>
                  {isActive ? <Shield className="h-6 w-6 text-success animate-pulse" /> :
                   isTrialExpired ? <AlertTriangle className="h-6 w-6 text-destructive" /> :
                   <Clock className="h-6 w-6 text-warning" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {isActive ? 'Active Subscription' : isTrialExpired ? 'Trial Expired' : 'Free Trial'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? 'Your account is fully active' :
                     isTrialExpired ? 'Make a payment to restore access' :
                     `${trialDaysRemaining} days remaining`}
                  </p>
                </div>
              </div>
              <Badge className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full",
                isActive ? "bg-success/15 text-success border-success/30" :
                isTrialExpired ? "bg-destructive/15 text-destructive border-destructive/30" :
                "bg-warning/15 text-warning border-warning/30"
              )} variant="outline">
                {isActive ? 'Active' : isTrialExpired ? 'Expired' : 'Trial'}
              </Badge>
            </div>

            {isTrialing && !isTrialExpired && (
              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Trial progress</span>
                  <span>{14 - trialDaysRemaining}/14 days</span>
                </div>
                <Progress value={((14 - trialDaysRemaining) / 14) * 100} className="h-2" />
                <Button onClick={scrollToPayment} className="w-full mt-2" size="sm"
                  style={{ background: 'var(--gradient-primary)' }}>
                  <Zap className="h-4 w-4 mr-1.5" /> Subscribe Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Package */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-primary" /> Your Package
              </CardTitle>
              {hasPendingRequest ? (
                <Badge variant="outline" className="border-warning/30 text-warning text-xs">
                  <Clock className="h-3 w-3 mr-1" /> Switch Pending
                </Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setSwitchOpen(true)}
                  className="border-primary/30 text-primary hover:bg-primary/5">
                  Switch Package <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {selectedTier && (
              <div className="mb-4 p-4 rounded-xl border border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'var(--gradient-primary)' }} />
                <div className="relative flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg text-foreground">{selectedTier.display_name}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedTier.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">{selectedTier.name}</Badge>
                </div>
              </div>
            )}
            {!selectedTier && userModules.length > 0 && (
              <div className="mb-4 p-4 rounded-xl bg-muted/50 border border-border">
                <span className="text-sm font-semibold text-foreground">Custom Package</span>
                <p className="text-xs text-muted-foreground mt-0.5">Module-based pricing</p>
              </div>
            )}

            {/* Show features from tier instead of module breakdown */}
            {selectedTier && selectedTier.features.length > 0 ? (
              <ul className="space-y-2">
                {selectedTier.features.filter(f => f.included).map((f) => (
                  <li key={f.name} className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{f.name}</span>
                  </li>
                ))}
              </ul>
            ) : !selectedTier && userModules.length > 0 ? (
              <div className="space-y-2">
                {userModules.map((um) => (
                  <div key={um.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm text-foreground">{um.module?.name}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{fc(um.module?.monthly_price || 0)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No modules selected.</p>
            )}

            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Monthly Total</span>
              <span className="text-2xl font-bold text-foreground">{fc(monthlyTotal)}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <div ref={paymentSectionRef} className="space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Make a Payment
          </h2>

          {/* Payment Reference */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1" style={{ background: 'var(--gradient-primary)' }} />
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-2">Your payment reference</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-black tracking-widest text-foreground">{paymentReference}</span>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(paymentReference, 'Reference')} className="shrink-0">
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Always include this reference when making payment</p>
            </CardContent>
          </Card>

          {/* Bank Transfer */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-primary" /> Bank Transfer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {bankDetails.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <div>
                      <span className="text-xs text-muted-foreground block">{label}</span>
                      <span className="text-sm font-semibold text-foreground font-mono">{value}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(value, label)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* POP Upload */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-5 w-5 text-primary" /> Proof of Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {popUrl ? (
                <div className="relative rounded-xl border border-success/30 bg-success/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <FileImage className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">POP uploaded</p>
                      <a href={popUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">
                        View document
                      </a>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setPopUrl(null); fileInputRef.current?.click(); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                    "border-border hover:border-primary/50 hover:bg-primary/5",
                    uploading && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">Drop your POP here or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF</p>
                    </>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={onFileChange} />
            </CardContent>
          </Card>

          {/* Confirm Payment */}
          {sent ? (
            <Card className="border-success/30 bg-success/5 shadow-lg">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center shrink-0 shadow-[var(--shadow-glow-success)]">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Payment notification sent</p>
                  <p className="text-xs text-muted-foreground">We'll verify your payment and activate your account shortly.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={handlePaymentNotification} disabled={sending} size="lg"
              className="w-full h-14 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'var(--gradient-primary)' }}>
              {sending ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Sending...</> : "I've Made Payment"}
            </Button>
          )}
        </div>
      </div>

      {/* Package Switcher Dialog */}
      <Dialog open={switchOpen} onOpenChange={(open) => { setSwitchOpen(open); if (!open) setConfirmTier(null); }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Switch Package</DialogTitle>
            <DialogDescription>Select a package for your {systemType} system. A switch request will be sent for approval.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {availableTiers.map((tier) => {
              const isCurrent = tier.id === packageTierId;
              const isSelected = confirmTier?.id === tier.id;
              return (
                <div
                  key={tier.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl border-2 bg-card p-5 transition-all duration-300 cursor-pointer",
                    isCurrent
                      ? "border-transparent shadow-glow-md"
                      : isSelected
                      ? "border-primary shadow-glow-md scale-[1.02]"
                      : tier.is_popular
                      ? "border-primary/40 shadow-elevated"
                      : "border-border hover:border-primary/40 hover:shadow-elevated"
                  )}
                  style={isCurrent ? { background: 'var(--gradient-primary)', padding: '2px', borderRadius: '1rem' } : undefined}
                  onClick={() => !isCurrent && setConfirmTier(tier)}
                >
                  <div className={cn(
                    "flex flex-col h-full",
                    isCurrent && "bg-card rounded-[calc(1rem-2px)] p-5"
                  )}>
                    {isCurrent && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 text-[10px] font-bold" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                        Current Plan
                      </Badge>
                    )}
                    {tier.is_popular && !isCurrent && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-[10px]">
                        Most Popular
                      </Badge>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="font-display text-lg font-bold text-foreground">{tier.display_name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
                    </div>

                    <div className="text-center mb-5">
                      <span className="font-display text-3xl font-bold text-gradient">{fc(tier.bundle_price)}</span>
                      <span className="text-muted-foreground text-sm block mt-0.5">/month</span>
                    </div>

                    {tier.features && tier.features.length > 0 && (
                      <ul className="space-y-2 flex-1">
                        {tier.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-xs">
                            {f.included ? (
                              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="h-2.5 w-2.5 text-primary" />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                                <Minus className="h-2.5 w-2.5 text-muted-foreground" />
                              </div>
                            )}
                            <span className={cn(f.included ? 'text-foreground' : 'text-muted-foreground')}>{f.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
            {availableTiers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 col-span-full">No packages available for your system type.</p>
            )}
          </div>

          {/* Confirmation bar */}
          {confirmTier && (
            <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Switch to <span className="text-primary">{confirmTier.display_name}</span> at {fc(confirmTier.bundle_price)}/mo?
                </p>
                <p className="text-xs text-muted-foreground">A request will be sent to the admin for approval.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setConfirmTier(null)}>Cancel</Button>
                <Button size="sm" style={{ background: 'var(--gradient-primary)' }} onClick={() => { handleSwitchRequest(confirmTier); setConfirmTier(null); }}>
                  Confirm Switch
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
