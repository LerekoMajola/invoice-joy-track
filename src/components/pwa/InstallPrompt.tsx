 import { useState, useEffect } from 'react';
 import { Download, X } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { haptics } from '@/lib/haptics';
 import { cn } from '@/lib/utils';
 
 interface BeforeInstallPromptEvent extends Event {
   prompt: () => Promise<void>;
   userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
 }
 
 export function InstallPrompt() {
   const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
   const [showPrompt, setShowPrompt] = useState(false);
   const [isInstalled, setIsInstalled] = useState(false);
 
   useEffect(() => {
     // Check if already installed
     if (window.matchMedia('(display-mode: standalone)').matches) {
       setIsInstalled(true);
       return;
     }
 
     // Check if dismissed
     const dismissed = localStorage.getItem('pwa-install-dismissed');
     if (dismissed) {
       const dismissedDate = new Date(dismissed);
       const now = new Date();
       const daysDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
       // Show again after 7 days
       if (daysDiff < 7) return;
     }
 
     const handleBeforeInstall = (e: Event) => {
       e.preventDefault();
       setDeferredPrompt(e as BeforeInstallPromptEvent);
       // Show after a delay
       setTimeout(() => setShowPrompt(true), 3000);
     };
 
     window.addEventListener('beforeinstallprompt', handleBeforeInstall);
 
     return () => {
       window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
     };
   }, []);
 
   const handleInstall = async () => {
     if (!deferredPrompt) return;
 
     haptics.medium();
     deferredPrompt.prompt();
     
     const { outcome } = await deferredPrompt.userChoice;
     
     if (outcome === 'accepted') {
       haptics.success();
       setIsInstalled(true);
     }
     
     setDeferredPrompt(null);
     setShowPrompt(false);
   };
 
   const handleDismiss = () => {
     haptics.light();
     localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
     setShowPrompt(false);
   };
 
   if (isInstalled || !showPrompt || !deferredPrompt) return null;
 
   return (
     <div
       className={cn(
         'fixed bottom-20 left-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl',
         'bg-card border border-border shadow-lg animate-slide-up'
       )}
     >
       <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
         <Download className="h-5 w-5 text-primary" />
       </div>
       
       <div className="flex-1 min-w-0">
         <p className="font-medium text-sm text-foreground">Install App</p>
         <p className="text-xs text-muted-foreground truncate">
           Add to home screen for a better experience
         </p>
       </div>
 
       <div className="flex items-center gap-2 flex-shrink-0">
         <Button size="sm" onClick={handleInstall} className="h-8">
           Install
         </Button>
         <Button
           variant="ghost"
           size="icon"
           onClick={handleDismiss}
           className="h-8 w-8"
         >
           <X className="h-4 w-4" />
         </Button>
       </div>
     </div>
   );
 }