import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, GraduationCap, Loader2, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';

interface PortalLoginProps {
  portalType?: 'gym' | 'school' | null;
}

export function PortalLogin({ portalType }: PortalLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isGym = portalType === 'gym';
  const isSchool = portalType === 'school';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Sign in failed', description: 'Incorrect email or password.', variant: 'destructive' });
    }
  };

  const PortalIcon = isGym ? Dumbbell : isSchool ? GraduationCap : Lock;

  const title = isGym ? 'Member Portal' : isSchool ? 'Student Portal' : 'Client Portal';
  const subtitle = isGym
    ? 'Access your membership, classes & more'
    : isSchool
    ? "Stay connected with your child's school"
    : 'Sign in to access your portal';

  const accentClass = isGym
    ? 'from-primary/20 via-primary/5 to-background'
    : isSchool
    ? 'from-blue-500/20 via-blue-500/5 to-background'
    : 'from-muted/30 to-background';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${accentClass} flex items-center justify-center p-4`}>
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          {/* Animated icon with ring */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150 animate-pulse" />
              <div className="relative h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
                <PortalIcon className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">{subtitle}</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="h-11 bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 bg-background/50 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-semibold gap-2"
              disabled={loading || !email.trim() || !password}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground px-4">
          Your login credentials were emailed to you when your account was created. Contact support if you need help.
        </p>
      </div>
    </div>
  );
}
