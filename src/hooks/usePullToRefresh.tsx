 import { useState, useCallback, useRef, useEffect } from 'react';
 import { haptics } from '@/lib/haptics';
 
 interface UsePullToRefreshOptions {
   onRefresh: () => Promise<void>;
   threshold?: number;
   resistance?: number;
 }
 
 export function usePullToRefresh({
   onRefresh,
   threshold = 80,
   resistance = 2.5,
 }: UsePullToRefreshOptions) {
   const [isPulling, setIsPulling] = useState(false);
   const [pullDistance, setPullDistance] = useState(0);
   const [isRefreshing, setIsRefreshing] = useState(false);
   const startY = useRef(0);
   const currentY = useRef(0);
   const triggered = useRef(false);
 
   const handleTouchStart = useCallback((e: TouchEvent) => {
     if (window.scrollY === 0) {
       startY.current = e.touches[0].clientY;
       setIsPulling(true);
       triggered.current = false;
     }
   }, []);
 
   const handleTouchMove = useCallback(
     (e: TouchEvent) => {
       if (!isPulling || isRefreshing) return;
 
       currentY.current = e.touches[0].clientY;
       const diff = currentY.current - startY.current;
 
       if (diff > 0 && window.scrollY === 0) {
         const distance = Math.min(diff / resistance, threshold * 1.5);
         setPullDistance(distance);
 
         if (distance >= threshold && !triggered.current) {
           haptics.medium();
           triggered.current = true;
         }
       }
     },
     [isPulling, isRefreshing, resistance, threshold]
   );
 
   const handleTouchEnd = useCallback(async () => {
     if (!isPulling) return;
 
     if (pullDistance >= threshold && !isRefreshing) {
       setIsRefreshing(true);
       haptics.success();
       try {
         await onRefresh();
       } finally {
         setIsRefreshing(false);
       }
     }
 
     setIsPulling(false);
     setPullDistance(0);
     triggered.current = false;
   }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);
 
   useEffect(() => {
     document.addEventListener('touchstart', handleTouchStart, { passive: true });
     document.addEventListener('touchmove', handleTouchMove, { passive: true });
     document.addEventListener('touchend', handleTouchEnd);
 
     return () => {
       document.removeEventListener('touchstart', handleTouchStart);
       document.removeEventListener('touchmove', handleTouchMove);
       document.removeEventListener('touchend', handleTouchEnd);
     };
   }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
 
   const progress = Math.min(pullDistance / threshold, 1);
 
   return {
     isPulling,
     isRefreshing,
     pullDistance,
     progress,
   };
 }