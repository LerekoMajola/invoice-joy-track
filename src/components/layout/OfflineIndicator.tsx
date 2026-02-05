 import { useState, useEffect } from 'react';
 import { WifiOff } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 export function OfflineIndicator() {
   const [isOffline, setIsOffline] = useState(!navigator.onLine);
   const [show, setShow] = useState(false);
 
   useEffect(() => {
     const handleOnline = () => {
       setIsOffline(false);
       // Show "back online" briefly
       setShow(true);
       setTimeout(() => setShow(false), 2000);
     };
 
     const handleOffline = () => {
       setIsOffline(true);
       setShow(true);
     };
 
     window.addEventListener('online', handleOnline);
     window.addEventListener('offline', handleOffline);
 
     // Initial check
     if (!navigator.onLine) {
       setShow(true);
     }
 
     return () => {
       window.removeEventListener('online', handleOnline);
       window.removeEventListener('offline', handleOffline);
     };
   }, []);
 
   if (!show) return null;
 
   return (
     <div
       className={cn(
         'fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all duration-300 animate-slide-up',
         isOffline
           ? 'bg-destructive text-destructive-foreground'
           : 'bg-success text-success-foreground'
       )}
     >
       {isOffline ? (
         <>
           <WifiOff className="h-4 w-4" />
           <span>You're offline</span>
         </>
       ) : (
         <span>Back online!</span>
       )}
     </div>
   );
 }