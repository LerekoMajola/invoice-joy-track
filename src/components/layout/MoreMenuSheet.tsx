import { Truck, CheckSquare, FileSearch, TrendingUp, Calculator, Users2, Settings, CreditCard, X, Car, Wrench, GraduationCap, School, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { useModules } from '@/hooks/useModules';

interface MoreMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Module key mapping (null = always visible)
const allMenuItems = [
  { icon: Truck, label: 'Delivery Notes', path: '/delivery-notes', description: 'Manage deliveries', moduleKey: 'delivery_notes' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks', description: 'Track your to-dos', moduleKey: 'tasks' },
  { icon: FileSearch, label: 'Tenders', path: '/tenders', description: 'Browse opportunities', moduleKey: 'tenders' },
  { icon: TrendingUp, label: 'Profitability', path: '/profitability', description: 'Job analytics', moduleKey: 'profitability' },
  { icon: Calculator, label: 'Accounting', path: '/accounting', description: 'Financial overview', moduleKey: 'accounting' },
  { icon: Users2, label: 'Staff', path: '/staff', description: 'Team management', moduleKey: 'staff' },
  { icon: Car, label: 'Fleet', path: '/fleet', description: 'Vehicle management', moduleKey: 'fleet' },
  { icon: Wrench, label: 'Workshop', path: '/workshop', description: 'Job cards & repairs', moduleKey: 'workshop' },
  { icon: GraduationCap, label: 'Students', path: '/students', description: 'Student records', moduleKey: 'students' },
  { icon: School, label: 'School Admin', path: '/school-admin', description: 'Classes & terms', moduleKey: 'school_admin' },
  { icon: Wallet, label: 'School Fees', path: '/school-fees', description: 'Fee tracking', moduleKey: 'school_fees' },
  { icon: Settings, label: 'Settings', path: '/settings', description: 'Company profile', moduleKey: null },
  { icon: CreditCard, label: 'Billing', path: '/billing', description: 'Subscription & plans', moduleKey: null },
];

export function MoreMenuSheet({ open, onOpenChange }: MoreMenuSheetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasModule, userModules } = useModules();

  const menuItems = allMenuItems.filter((item) => {
    if (!item.moduleKey) return true;
    if (userModules.length === 0) return true;
    return hasModule(item.moduleKey);
  });

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
