import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, Shield, ArrowLeft, Check, Briefcase, Wrench, GraduationCap, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { PlatformLogo } from '@/components/shared/PlatformLogo';
import { TrustBadges } from '@/components/auth/TrustBadges';
import { AuthBrandingPanel } from '@/components/auth/AuthBrandingPanel';
import { ModuleSelector } from '@/components/auth/ModuleSelector';
import { SystemSelector, type SystemType } from '@/components/auth/SystemSelector';
import { PackageTierSelector } from '@/components/auth/PackageTierSelector';

type SignupStep = 'system' | 'package' | 'review' | 'credentials' | 'custom-modules';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>('system');
  const [selectedSystem, setSelectedSystem] = useState<SystemType | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedModuleKeys, setSelectedModuleKeys] = useState<string[]>([]);
  const [savingModules, setSavingModules] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  // Redirect authenticated users (only when not in a signup step)
  useEffect(() => {
    if (!loading && user && isLogin) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, loading, navigate, isLogin]);

  const validateForm = () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSystemSelect = (system: SystemType) => {
    setSelectedSystem(system);
    setSignupStep('package');
  };

  const handleTierSelect = async (tierName: string, moduleKeys: string[]) => {
    setSelectedTier(tierName);
    setSelectedModuleKeys(moduleKeys);
    setSignupStep('review');
  };

  const handleCustomBuild = () => {
    setSignupStep('custom-modules');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
        }
      } else {
        // Signup flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              system_type: selectedSystem,
              selected_tier: selectedTier,
              selected_module_keys: selectedModuleKeys,
            },
          },
        });
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please login instead.');
          } else {
            toast.error(error.message);
          }
        } else if (data.user && !data.session) {
          // Email confirmation required — no session means unverified
          toast.success('Check your email to verify your account before signing in.', { duration: 8000 });
          setEmail('');
          setPassword('');
          setSignupStep('system');
          setIsLogin(true);
        } else if (data.user && data.session) {
          // Fallback: if auto-confirm is somehow on, save data immediately
          await saveSignupData(data.user.id);
        }
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const saveSignupData = async (userId: string) => {
    setSavingModules(true);
    try {
      // Look up module IDs from keys
      const { data: modules, error: modulesError } = await supabase
        .from('platform_modules')
        .select('id, key')
        .eq('is_active', true);

      if (modulesError) throw modulesError;

      // Also include core modules
      const { data: coreModules } = await supabase
        .from('platform_modules')
        .select('id, key')
        .eq('is_core', true);

      const coreKeys = (coreModules || []).map(m => m.key);
      const allKeys = [...new Set([...selectedModuleKeys, ...coreKeys])];
      const moduleIds = (modules || [])
        .filter(m => allKeys.includes(m.key))
        .map(m => m.id);

      if (moduleIds.length > 0) {
        const rows = moduleIds.map(moduleId => ({
          user_id: userId,
          module_id: moduleId,
          is_active: true,
        }));
        const { error } = await supabase.from('user_modules').insert(rows);
        if (error) throw error;
      }

      // Save system_type to subscription
      if (selectedSystem) {
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ system_type: selectedSystem } as any)
          .eq('user_id', userId);

        // If no subscription row exists yet, it'll be created by the trigger/default
        // Try upsert approach if update affected 0 rows
        if (subError) {
          console.error('Error updating subscription system_type:', subError);
        }
      }

      toast.success('Your package is ready! Please check your email to verify your account.');
      setSignupStep('system');
      setIsLogin(true);
    } catch (error: any) {
      console.error('Error saving signup data:', error);
      toast.error('Account created but failed to save package. You can update it in Billing.');
      setSignupStep('system');
      setIsLogin(true);
    } finally {
      setSavingModules(false);
    }
  };

  const handleModulesComplete = async (selectedModuleIds: string[]) => {
    // Custom build: user already selected module IDs directly
    // We still need credentials, so save module IDs and go to credentials
    // But we need the module keys for saving - let's look them up
    setSavingModules(true);
    try {
      const { data: modules } = await supabase
        .from('platform_modules')
        .select('id, key')
        .in('id', selectedModuleIds);

      const keys = (modules || []).map(m => m.key);
      setSelectedModuleKeys(keys);
      setSignupStep('credentials');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingModules(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
          <p className="text-white/80 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Signup steps (full-screen)
  if (!isLogin) {
    if (signupStep === 'system') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
          <div className="w-full">
            <SystemSelector onSelect={handleSystemSelect} />
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-sm text-primary hover:underline font-medium"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (signupStep === 'package' && selectedSystem) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
          <PackageTierSelector
            systemType={selectedSystem}
            onSelect={handleTierSelect}
            onBack={() => setSignupStep('system')}
            onCustomBuild={handleCustomBuild}
          />
        </div>
      );
    }

    if (signupStep === 'review' && selectedSystem && selectedTier) {
      const systemLabels: Record<SystemType, string> = {
        business: 'Business Management',
        workshop: 'Workshop Management',
        school: 'School Management',
      };
      const systemIcons: Record<SystemType, React.ReactNode> = {
        business: <Briefcase className="h-6 w-6" />,
        workshop: <Wrench className="h-6 w-6" />,
        school: <GraduationCap className="h-6 w-6" />,
      };
      const systemGradients: Record<SystemType, string> = {
        business: 'from-primary to-violet',
        workshop: 'from-coral to-warning',
        school: 'from-info to-cyan',
      };

      // Map module keys to readable names
      const moduleNameMap: Record<string, string> = {
        core_crm: 'Core CRM & Clients',
        quotes: 'Quotes',
        invoices: 'Invoices',
        tasks: 'Task Management',
        delivery_notes: 'Delivery Notes',
        profitability: 'Profitability Tracking',
        tenders: 'Tender Tracking',
        accounting: 'Accounting',
        staff: 'Staff & HR',
        fleet: 'Fleet Management',
        workshop: 'Workshop (Job Cards)',
        school_admin: 'School Admin',
        students: 'Student Management',
        school_fees: 'School Fees',
      };

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md animate-slide-up">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <PlatformLogo className="h-12 w-auto" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Review your selection
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Confirm your package before creating your account
              </p>
            </div>

            <div className="rounded-2xl border-2 border-border bg-card p-6 space-y-6">
              {/* System Type */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white',
                  systemGradients[selectedSystem]
                )}>
                  {systemIcons[selectedSystem]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{systemLabels[selectedSystem]}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs">
                      {selectedTier}
                    </Badge>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSignupStep('package')}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              {/* Included Modules */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Included modules</p>
                <ul className="space-y-2">
                  {selectedModuleKeys.map((key) => (
                    <li key={key} className="flex items-center gap-2.5 text-sm">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-foreground">{moduleNameMap[key] || key}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  7-day free trial · No credit card required
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                variant="gradient"
                className="w-full h-12 rounded-xl text-base font-semibold"
                onClick={() => setSignupStep('credentials')}
              >
                Continue to create account
              </Button>
              <button
                type="button"
                onClick={() => setSignupStep('package')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change package
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (signupStep === 'custom-modules') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
          <div className="w-full">
            <ModuleSelector onComplete={handleModulesComplete} loading={savingModules} />
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setSignupStep('package')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to packages
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Credentials step (step 3)
    if (signupStep === 'credentials') {
      return (
        <div className="min-h-screen bg-background flex">
          <AuthBrandingPanel />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <div className="lg:hidden flex items-center justify-center mb-8 animate-bounce-in">
                <PlatformLogo className="h-20 w-auto rounded-2xl p-5 bg-white shadow-lg" />
              </div>

              <div className="text-center mb-8 animate-slide-up">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Create your account
                </h1>
                <p className="text-muted-foreground mt-2">
                  {selectedTier
                    ? `${selectedSystem === 'business' ? 'Business' : selectedSystem === 'workshop' ? 'Workshop' : 'School'} · ${selectedTier} package`
                    : 'Custom package'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="space-y-2 group">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  disabled={submitting || savingModules}
                >
                  {submitting || savingModules ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>

              <TrustBadges />

              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSignupStep('package')}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to packages
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Already have an account? Sign in
                </button>
              </div>

              <div className="mt-6 text-center flex items-center justify-center gap-1.5">
                <Shield className="h-3 w-3 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground/50">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Login form
  return (
    <div className="min-h-screen bg-background flex">
      <AuthBrandingPanel />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8 animate-bounce-in">
            <PlatformLogo className="h-20 w-auto rounded-2xl p-5 bg-white shadow-lg" />
          </div>

          <div className="text-center mb-8 animate-slide-up">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-2 group">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/reset-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-12 rounded-xl text-base font-semibold"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <TrustBadges />

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(false); setSignupStep('system'); }}
              className="text-sm text-primary hover:underline font-medium"
            >
              Don't have an account? Sign up
            </button>
          </div>

          <div className="mt-6 text-center flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground/50">
              Your data is protected with enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
