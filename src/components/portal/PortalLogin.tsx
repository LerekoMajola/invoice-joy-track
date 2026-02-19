import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Dumbbell, GraduationCap, Loader2, CheckCircle2 } from 'lucide-react';

interface PortalLoginProps {
  portalType?: 'gym' | 'school' | null;
}

export function PortalLogin({ portalType }: PortalLoginProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const isGym = portalType === 'gym';
  const isSchool = portalType === 'school';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const type = portalType || 'gym';
    const redirectTo = `${window.location.origin}/portal?type=${type}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
    }
  };

  const icon = isGym ? <Dumbbell className="h-8 w-8 text-primary" /> :
                isSchool ? <GraduationCap className="h-8 w-8 text-primary" /> :
                <Mail className="h-8 w-8 text-primary" />;

  const title = isGym ? 'GymPro Member Portal' :
                isSchool ? 'EduPro Parent Portal' :
                'Client Portal';

  const subtitle = isGym ? 'Access your membership, class schedule & more' :
                   isSchool ? "Stay connected with your child's school" :
                   'Enter your email to receive a magic sign-in link';

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
            <p className="text-muted-foreground mt-1">
              We sent a magic link to <span className="font-medium text-foreground">{email}</span>.
              Tap the link in your email to sign in — no password needed.
            </p>
          </div>
          <button
            className="text-sm text-primary underline underline-offset-4"
            onClick={() => setSent(false)}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

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
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Your email address</Label>
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
          <Button type="submit" className="w-full h-12 text-base" disabled={loading || !email.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            {loading ? 'Sending...' : 'Send me a link'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          No account needed — we'll find your record by email.
        </p>
      </div>
    </div>
  );
}
