 import { useState, useEffect } from 'react';
 import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PlatformLogo } from '@/components/shared/PlatformLogo';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  // Redirect authenticated users based on role
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, loading, navigate]);

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
          // Navigation will be handled by the useEffect watching auth state
        }
      } else {
        const { error } = await supabase.auth.signUp({
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
        } else {
          toast.success('Account created successfully!');
        }
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-violet/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-md text-center animate-slide-up">
          <div className="flex items-center justify-center mb-8 animate-bounce-in">
            <div className="bg-white rounded-2xl px-6 py-3 shadow-2xl">
              <PlatformLogo className="h-12 w-auto" />
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Manage Your Business Operations
          </h2>
          <p className="text-white/70 text-lg">
            Quotes, invoices, delivery notes, client management, and more - all in one powerful platform designed for your business.
          </p>
          
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['Quotes', 'Invoices', 'CRM', 'Tasks'].map((feature, index) => (
              <span 
                key={feature}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium animate-slide-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8 animate-bounce-in">
            <div className="bg-gradient-to-r from-primary to-violet p-1 rounded-2xl shadow-glow-md">
              <div className="bg-white rounded-xl px-4 py-2">
                <PlatformLogo className="h-10 w-auto" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8 animate-slide-up">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Get started with Orion Labs today'}
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
        </div>
      </div>
    </div>
  );
}
