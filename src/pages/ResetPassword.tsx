 import { useState, useEffect } from 'react';
 import { useNavigate, useSearchParams } from 'react-router-dom';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Mail, Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PlatformLogo } from '@/components/shared/PlatformLogo';
 
type ResetStep = 'request' | 'update' | 'success';

// Parse hash params synchronously BEFORE React renders, so Supabase can't consume them first
function detectRecoveryFromHash(): boolean {
  try {
    const hash = window.location.hash.substring(1);
    if (!hash) return false;
    const params = new URLSearchParams(hash);
    return params.get('type') === 'recovery' && !!params.get('access_token');
  } catch {
    return false;
  }
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Detect recovery mode immediately via hash (synchronous, before effects)
  const [step, setStep] = useState<ResetStep>(() =>
    detectRecoveryFromHash() ? 'update' : 'request'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Fallback detection via auth events and session check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('update');
      }
    });

    // Also check if user already has a recovery session (e.g. hash was consumed before mount)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && searchParams.get('type') === 'recovery') {
        setStep('update');
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);
 
   const handleRequestReset = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!email || !email.includes('@')) {
       toast.error('Please enter a valid email address');
       return;
     }
 
     setSubmitting(true);
 
     try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          throw error;
        }
 
       setEmailSent(true);
       toast.success('Check your email for a password reset link');
     } catch (error: any) {
       console.error('Reset request error:', error);
       toast.error('Failed to send reset email. Please try again.');
     } finally {
       setSubmitting(false);
     }
   };
 
   const handleUpdatePassword = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (password.length < 6) {
       toast.error('Password must be at least 6 characters');
       return;
     }
 
     if (password !== confirmPassword) {
       toast.error('Passwords do not match');
       return;
     }
 
     setSubmitting(true);
 
     try {
       const { error } = await supabase.auth.updateUser({ password });
 
       if (error) {
         throw error;
       }
 
       setStep('success');
       toast.success('Password updated successfully!');
       
       // Sign out and redirect to login after a short delay
       setTimeout(async () => {
         await supabase.auth.signOut();
         navigate('/auth', { replace: true });
       }, 2000);
     } catch (error: any) {
       console.error('Password update error:', error);
       toast.error(error.message || 'Failed to update password');
     } finally {
       setSubmitting(false);
     }
   };
 
   return (
     <div className="min-h-screen bg-background flex">
       {/* Left Side - Branding */}
       <div className="hidden lg:flex lg:w-1/2 bg-gradient-sidebar items-center justify-center p-12">
         <div className="max-w-md text-center">
             <div className="flex items-center justify-center mb-8">
               <PlatformLogo className="h-16 w-auto rounded-xl" />
             </div>
           <h2 className="font-display text-2xl font-semibold text-sidebar-foreground mb-4">
             Reset Your Password
           </h2>
           <p className="text-sidebar-foreground/70">
             Don't worry, it happens to the best of us. We'll help you get back into your account.
           </p>
         </div>
       </div>
 
       {/* Right Side - Form */}
       <div className="flex-1 flex items-center justify-center p-8">
         <div className="w-full max-w-md">
           {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <PlatformLogo className="h-12 w-auto" />
            </div>
 
           {step === 'request' && !emailSent && (
             <>
               <div className="text-center mb-8">
                 <h1 className="font-display text-2xl font-bold text-foreground">
                   Forgot your password?
                 </h1>
                 <p className="text-muted-foreground mt-2">
                   Enter your email and we'll send you a reset link
                 </p>
               </div>
 
               <form onSubmit={handleRequestReset} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="email">Email</Label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="email"
                       type="email"
                       placeholder="you@company.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="pl-10"
                       required
                     />
                   </div>
                 </div>
 
                 <Button type="submit" className="w-full" disabled={submitting}>
                   {submitting ? (
                     <>
                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       Sending...
                     </>
                   ) : (
                     'Send Reset Link'
                   )}
                 </Button>
               </form>
             </>
           )}
 
           {step === 'request' && emailSent && (
             <div className="text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                 <Mail className="h-8 w-8 text-primary" />
               </div>
               <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                 Check your email
               </h1>
               <p className="text-muted-foreground mb-6">
                 We've sent a password reset link to <strong>{email}</strong>
               </p>
               <p className="text-sm text-muted-foreground mb-6">
                 Didn't receive the email? Check your spam folder or{' '}
                 <button
                   onClick={() => setEmailSent(false)}
                   className="text-primary hover:underline"
                 >
                   try again
                 </button>
               </p>
             </div>
           )}
 
           {step === 'update' && (
             <>
               <div className="text-center mb-8">
                 <h1 className="font-display text-2xl font-bold text-foreground">
                   Set a new password
                 </h1>
                 <p className="text-muted-foreground mt-2">
                   Enter your new password below
                 </p>
               </div>
 
               <form onSubmit={handleUpdatePassword} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="password">New Password</Label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="password"
                       type="password"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="pl-10"
                       required
                       minLength={6}
                     />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="confirmPassword">Confirm Password</Label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="confirmPassword"
                       type="password"
                       placeholder="••••••••"
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       className="pl-10"
                       required
                       minLength={6}
                     />
                   </div>
                 </div>
 
                 <Button type="submit" className="w-full" disabled={submitting}>
                   {submitting ? (
                     <>
                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       Updating...
                     </>
                   ) : (
                     'Update Password'
                   )}
                 </Button>
               </form>
             </>
           )}
 
           {step === 'success' && (
             <div className="text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                 <CheckCircle className="h-8 w-8 text-primary" />
               </div>
               <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                 Password updated!
               </h1>
               <p className="text-muted-foreground mb-6">
                 Redirecting you to sign in...
               </p>
               <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
             </div>
           )}
 
           <div className="mt-6 text-center">
             <button
               type="button"
               onClick={() => navigate('/auth')}
               className="inline-flex items-center text-sm text-primary hover:underline"
             >
               <ArrowLeft className="h-4 w-4 mr-1" />
               Back to sign in
             </button>
           </div>
         </div>
       </div>
     </div>
   );
 }