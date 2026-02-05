 import { RefreshCw } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface PullToRefreshIndicatorProps {
   progress: number;
   isRefreshing: boolean;
   pullDistance: number;
 }
 
 export function PullToRefreshIndicator({
   progress,
   isRefreshing,
   pullDistance,
 }: PullToRefreshIndicatorProps) {
   if (pullDistance === 0 && !isRefreshing) return null;
 
   return (
     <div
       className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-center transition-all duration-200"
       style={{ top: Math.max(8, pullDistance - 40) }}
     >
       <div
         className={cn(
           'flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-lg',
           isRefreshing && 'animate-spin'
         )}
         style={{
           transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
           opacity: Math.min(progress + 0.3, 1),
         }}
       >
         <RefreshCw
           className={cn(
             'h-5 w-5 text-primary transition-transform',
             progress >= 1 && 'text-success'
           )}
         />
       </div>
     </div>
   );
 }