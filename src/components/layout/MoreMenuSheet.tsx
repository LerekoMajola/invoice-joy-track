 import { Truck, CheckSquare, FileSearch, TrendingUp, Calculator, Users2, Settings, CreditCard, X } from 'lucide-react';
 import { useNavigate, useLocation } from 'react-router-dom';
 import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
 import { cn } from '@/lib/utils';
 import { haptics } from '@/lib/haptics';
 import { Button } from '@/components/ui/button';
 
 interface MoreMenuSheetProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 const menuItems = [
   { icon: Truck, label: 'Delivery Notes', path: '/delivery-notes', description: 'Manage deliveries' },
   { icon: CheckSquare, label: 'Tasks', path: '/tasks', description: 'Track your to-dos' },
   { icon: FileSearch, label: 'Tenders', path: '/tenders', description: 'Browse opportunities' },
   { icon: TrendingUp, label: 'Profitability', path: '/profitability', description: 'Job analytics' },
   { icon: Calculator, label: 'Accounting', path: '/accounting', description: 'Financial overview' },
   { icon: Users2, label: 'Staff', path: '/staff', description: 'Team management' },
   { icon: Settings, label: 'Settings', path: '/settings', description: 'Company profile' },
   { icon: CreditCard, label: 'Billing', path: '/billing', description: 'Subscription & plans' },
 ];
 
 export function MoreMenuSheet({ open, onOpenChange }: MoreMenuSheetProps) {
   const navigate = useNavigate();
   const location = useLocation();
 
   const handleItemClick = (path: string) => {
     haptics.selection();
     navigate(path);
     onOpenChange(false);
   };
 
   return (
     <Drawer open={open} onOpenChange={onOpenChange}>
       <DrawerContent className="max-h-[85vh]">
         <DrawerHeader className="flex items-center justify-between pb-2">
           <DrawerTitle>More Options</DrawerTitle>
           <DrawerClose asChild>
             <Button variant="ghost" size="icon" className="h-8 w-8">
               <X className="h-4 w-4" />
             </Button>
           </DrawerClose>
         </DrawerHeader>
         
         <div className="px-4 pb-8 grid grid-cols-2 gap-3">
           {menuItems.map((item) => {
             const active = location.pathname === item.path;
             return (
               <button
                 key={item.path}
                 onClick={() => handleItemClick(item.path)}
                 className={cn(
                   'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 touch-active',
                   active 
                     ? 'bg-primary/10 border-primary/30 text-primary' 
                     : 'bg-card border-border hover:bg-muted'
                 )}
               >
                 <div className={cn(
                   'p-3 rounded-xl',
                   active ? 'bg-primary/20' : 'bg-muted'
                 )}>
                   <item.icon className="h-5 w-5" />
                 </div>
                 <div className="text-center">
                   <p className="font-medium text-sm">{item.label}</p>
                   <p className="text-[10px] text-muted-foreground">{item.description}</p>
                 </div>
               </button>
             );
           })}
         </div>
       </DrawerContent>
     </Drawer>
   );
 }