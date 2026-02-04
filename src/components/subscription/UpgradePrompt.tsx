import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType: 'clients' | 'quotes' | 'invoices';
}

export function UpgradePrompt({ open, onOpenChange, limitType }: UpgradePromptProps) {
  const { currentPlan, limits } = useSubscription();

  const limitMessages = {
    clients: {
      title: 'Client Limit Reached',
      description: `You've reached your limit of ${limits.clients} clients on the ${currentPlan.replace('_', ' ')} plan. Upgrade to add more clients and grow your business.`,
    },
    quotes: {
      title: 'Quote Limit Reached',
      description: `You've reached your limit of ${limits.quotes_per_month} quotes this month on the ${currentPlan.replace('_', ' ')} plan. Upgrade for unlimited quotes.`,
    },
    invoices: {
      title: 'Invoice Limit Reached',
      description: `You've reached your limit of ${limits.invoices_per_month} invoices this month on the ${currentPlan.replace('_', ' ')} plan. Upgrade for unlimited invoices.`,
    },
  };

  const message = limitMessages[limitType];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          <AlertDialogTitle>{message.title}</AlertDialogTitle>
          <AlertDialogDescription>{message.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not Now</AlertDialogCancel>
          <Link to="/billing">
            <AlertDialogAction asChild>
              <Button>
                Upgrade Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </AlertDialogAction>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
