 import { ReactNode, useEffect, useState } from 'react';
 import { useLocation } from 'react-router-dom';
 import { cn } from '@/lib/utils';
 
 interface PageTransitionProps {
   children: ReactNode;
 }
 
 export function PageTransition({ children }: PageTransitionProps) {
   const location = useLocation();
   const [isVisible, setIsVisible] = useState(false);
 
   useEffect(() => {
     setIsVisible(false);
     const timer = setTimeout(() => setIsVisible(true), 10);
     return () => clearTimeout(timer);
   }, [location.pathname]);
 
   return (
     <div
       className={cn(
         'transition-all duration-200 ease-out',
         isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
       )}
     >
       {children}
     </div>
   );
 }