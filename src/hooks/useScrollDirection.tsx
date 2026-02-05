 import { useState, useEffect, useRef } from 'react';
 
 export function useScrollDirection(threshold: number = 10) {
   const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
   const [isAtTop, setIsAtTop] = useState(true);
   const prevScrollY = useRef(0);
 
   useEffect(() => {
     const handleScroll = () => {
       const currentScrollY = window.scrollY;
       
       setIsAtTop(currentScrollY < threshold);
       
       if (currentScrollY < threshold) {
         setScrollDirection(null);
         prevScrollY.current = currentScrollY;
         return;
       }
       
       const diff = currentScrollY - prevScrollY.current;
       
       if (Math.abs(diff) > threshold) {
         setScrollDirection(diff > 0 ? 'down' : 'up');
         prevScrollY.current = currentScrollY;
       }
     };
 
     window.addEventListener('scroll', handleScroll, { passive: true });
     return () => window.removeEventListener('scroll', handleScroll);
   }, [threshold]);
 
   return { scrollDirection, isAtTop };
 }