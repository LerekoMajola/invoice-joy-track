import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Dumbbell, GraduationCap, Loader2, Eye, EyeOff, Lock } from 'lucide-react';

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

  const icon = isGym ? <Dumbbell className="h-8 w-8 text-primary" /> :
                isSchool ? <GraduationCap className="h-8 w-8 text-primary" /> :
                <Lock className="h-8 w-8 text-primary" />;

  const title = isGym ? 'GymPro Member Portal' :
                isSchool ? 'EduPro Parent Portal' :
                'Client Portal';

  const subtitle = isGym ? 'Access your membership, class schedule & more' :
                   isSchool ? "Stay connected with your child's school" :
                   'Sign in to access your portal';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-12 text-base pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 text-base" disabled={loading || !email.trim() || !password}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Your login credentials were emailed to you when your account was created.
        </p>
      </div>
    </div>
  );
}

