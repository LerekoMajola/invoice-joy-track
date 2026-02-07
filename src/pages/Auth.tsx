import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { PlatformLogo } from '@/components/shared/PlatformLogo';
import { TrustBadges } from '@/components/auth/TrustBadges';
import { AuthBrandingPanel } from '@/components/auth/AuthBrandingPanel';
import { ModuleSelector } from '@/components/auth/ModuleSelector';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signupStep, setSignupStep] = useState<'credentials' | 'modules'>('credentials');
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [savingModules, setSavingModules] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  // Redirect authenticated users based on role (only after module selection is done)
  useEffect(() => {
    if (!loading && user && signupStep === 'credentials') {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, loading, navigate, signupStep]);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please login instead.');
          } else {
            toast.error(error.message);
          }
        } else if (data.user) {
          setNewUserId(data.user.id);
          setSignupStep('modules');
          toast.success('Account created! Now choose your modules.');
        }
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModulesComplete = async (selectedModuleIds: string[]) => {
    if (!newUserId) return;
    setSavingModules(true);

    try {
      // Save selected modules
      const rows = selectedModuleIds.map((moduleId) => ({
        user_id: newUserId,
        module_id: moduleId,
        is_active: true,
      }));

      const { error } = await supabase.from('user_modules').insert(rows);
      if (error) throw error;

      toast.success('Your package is ready!');
      setSignupStep('credentials');
      // The useEffect will handle redirect now
    } catch (error: any) {
      console.error('Error saving modules:', error);
      toast.error('Failed to save modules. You can update them later in Billing.');
      setSignupStep('credentials');
    } finally {
      setSavingModules(false);
    }
  };

  // Show loading while checking auth state
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

  // Module selection step (full-screen)
  if (signupStep === 'modules') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
        <ModuleSelector onComplete={handleModulesComplete} loading={savingModules} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <AuthBrandingPanel />

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
           <div className="lg:hidden flex items-center justify-center mb-8 animate-bounce-in">
              <PlatformLogo className="h-20 w-auto rounded-2xl p-5 bg-white shadow-lg" />
           </div>

          <div className="text-center mb-8 animate-slide-up">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Get started with your free account'}
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
                {isLogin && (
                  <Link
                    to="/reset-password"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                )}
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
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign in' : 'Create account'
              )}
            </Button>
          </form>

          {/* Trust badges */}
          <TrustBadges />

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Footer trust line */}
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
