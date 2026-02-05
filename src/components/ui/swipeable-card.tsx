 import * as React from 'react';
 import { cn } from '@/lib/utils';
 import { haptics } from '@/lib/haptics';
 import { Trash2, Check } from 'lucide-react';
 
 interface SwipeableCardProps {
   children: React.ReactNode;
   className?: string;
   onSwipeLeft?: () => void;
   onSwipeRight?: () => void;
   leftAction?: {
     icon?: React.ReactNode;
     label: string;
     variant?: 'destructive' | 'success' | 'primary';
   };
   rightAction?: {
     icon?: React.ReactNode;
     label: string;
     variant?: 'destructive' | 'success' | 'primary';
   };
   disabled?: boolean;
 }
 
 const SWIPE_THRESHOLD = 80;
 
 export function SwipeableCard({
   children,
   className,
   onSwipeLeft,
   onSwipeRight,
   leftAction = { icon: <Trash2 className="h-5 w-5" />, label: 'Delete', variant: 'destructive' },
   rightAction = { icon: <Check className="h-5 w-5" />, label: 'Done', variant: 'success' },
   disabled = false,
 }: SwipeableCardProps) {
   const [translateX, setTranslateX] = React.useState(0);
   const [isDragging, setIsDragging] = React.useState(false);
   const startX = React.useRef(0);
   const currentX = React.useRef(0);
   const triggered = React.useRef<'left' | 'right' | null>(null);
 
   const handleTouchStart = (e: React.TouchEvent) => {
     if (disabled) return;
     startX.current = e.touches[0].clientX;
     setIsDragging(true);
     triggered.current = null;
   };
 
   const handleTouchMove = (e: React.TouchEvent) => {
     if (!isDragging || disabled) return;
     currentX.current = e.touches[0].clientX;
     const diff = currentX.current - startX.current;
     
     // Apply resistance
     const resistance = 0.5;
     const resistedDiff = diff * resistance;
     
     // Clamp the value
     const clampedDiff = Math.max(-SWIPE_THRESHOLD * 1.5, Math.min(SWIPE_THRESHOLD * 1.5, resistedDiff));
     setTranslateX(clampedDiff);
 
     // Trigger haptics when crossing threshold
     if (Math.abs(clampedDiff) >= SWIPE_THRESHOLD) {
       const direction = clampedDiff < 0 ? 'left' : 'right';
       if (triggered.current !== direction) {
         haptics.medium();
         triggered.current = direction;
       }
     } else {
       triggered.current = null;
     }
   };
 
   const handleTouchEnd = () => {
     if (!isDragging) return;
     setIsDragging(false);
 
     if (translateX <= -SWIPE_THRESHOLD && onSwipeLeft) {
       haptics.success();
       onSwipeLeft();
     } else if (translateX >= SWIPE_THRESHOLD && onSwipeRight) {
       haptics.success();
       onSwipeRight();
     }
 
     setTranslateX(0);
   };
 
   const getVariantClasses = (variant?: 'destructive' | 'success' | 'primary') => {
     switch (variant) {
       case 'destructive':
         return 'bg-destructive text-destructive-foreground';
       case 'success':
         return 'bg-success text-success-foreground';
       case 'primary':
       default:
         return 'bg-primary text-primary-foreground';
     }
   };
 
   return (
     <div className="relative overflow-hidden rounded-xl">
       {/* Left action background */}
       {onSwipeRight && (
         <div
           className={cn(
             'absolute inset-y-0 left-0 flex items-center justify-start px-4 transition-opacity',
             getVariantClasses(rightAction.variant),
             translateX > 0 ? 'opacity-100' : 'opacity-0'
           )}
           style={{ width: Math.abs(translateX) + 20 }}
         >
           <div className="flex items-center gap-2">
             {rightAction.icon}
             {translateX >= SWIPE_THRESHOLD && (
               <span className="text-sm font-medium">{rightAction.label}</span>
             )}
           </div>
         </div>
       )}
 
       {/* Right action background */}
       {onSwipeLeft && (
         <div
           className={cn(
             'absolute inset-y-0 right-0 flex items-center justify-end px-4 transition-opacity',
             getVariantClasses(leftAction.variant),
             translateX < 0 ? 'opacity-100' : 'opacity-0'
           )}
           style={{ width: Math.abs(translateX) + 20 }}
         >
           <div className="flex items-center gap-2">
             {translateX <= -SWIPE_THRESHOLD && (
               <span className="text-sm font-medium">{leftAction.label}</span>
             )}
             {leftAction.icon}
           </div>
         </div>
       )}
 
       {/* Card content */}
       <div
         className={cn(
           'relative bg-card transition-transform',
           !isDragging && 'transition-transform duration-200',
           className
         )}
         style={{ transform: `translateX(${translateX}px)` }}
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
       >
         {children}
       </div>
     </div>
   );
 }