import { CheckSquare, Calculator, Users2, Settings, CreditCard, X, School, Clock, Briefcase, Truck, TrendingUp, Kanban, Wrench, FolderOpen, Hammer, ClipboardList, CalendarDays, Hotel, Star, Car, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { useModules } from '@/hooks/useModules';
import { useSubscription } from '@/hooks/useSubscription';
import { useOptionalFeatures } from '@/hooks/useOptionalFeatures';

interface MoreMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// systemTypes: null = all systems, string[] = specific systems only
// optionalFeature: if set, item only shows when that optional feature is enabled
const allMenuItems = [
  // Business-specific
  { icon: Kanban, label: 'CRM', path: '/crm', description: 'Sales pipeline', moduleKey: 'core_crm', systemTypes: ['business'], optionalFeature: null },
  { icon: Briefcase, label: 'Tenders', path: '/tenders', description: 'Track opportunities', moduleKey: 'tenders', systemTypes: ['business'], optionalFeature: null },
  { icon: Truck, label: 'Delivery Notes', path: '/delivery-notes', description: 'Track deliveries', moduleKey: 'delivery_notes', systemTypes: ['business'], optionalFeature: null },
  // Workshop-specific
  { icon: Wrench, label: 'Workshop', path: '/workshop', description: 'Job cards', moduleKey: 'workshop', systemTypes: ['workshop'], optionalFeature: null },
  // Hire-specific
  { icon: Hammer, label: 'Equipment', path: '/equipment', description: 'Tool catalogue', moduleKey: 'hire_equipment', systemTypes: ['hire'], optionalFeature: null },
  { icon: ClipboardList, label: 'Hire Orders', path: '/hire-orders', description: 'Rental bookings', moduleKey: 'hire_orders', systemTypes: ['hire'], optionalFeature: null },
  { icon: CalendarDays, label: 'Availability', path: '/hire-calendar', description: 'Booking calendar', moduleKey: 'hire_orders', systemTypes: ['hire'], optionalFeature: null },
  // Guest House-specific
  { icon: Hotel, label: 'Housekeeping', path: '/housekeeping', description: 'Room cleaning tasks', moduleKey: 'gh_housekeeping', systemTypes: ['guesthouse'], optionalFeature: null },
  { icon: Star, label: 'Reviews', path: '/guest-reviews', description: 'Guest feedback', moduleKey: 'gh_reviews', systemTypes: ['guesthouse'], optionalFeature: null },
  // Legal-specific
  { icon: FolderOpen, label: 'Legal Docs', path: '/legal-documents', description: 'Case documents', moduleKey: 'legal_documents', systemTypes: ['legal'], optionalFeature: null },
  // School-specific
  { icon: School, label: 'School Admin', path: '/school-admin', description: 'Classes & terms', moduleKey: 'school_admin', systemTypes: ['school'], optionalFeature: null },
  { icon: Clock, label: 'Timetable', path: '/timetable', description: 'Weekly schedule', moduleKey: 'school_admin', systemTypes: ['school'], optionalFeature: null },
  // Fleet
  { icon: Car, label: 'Fleet', path: '/fleet', description: 'Vehicle management', moduleKey: 'fleet', systemTypes: ['fleet'], optionalFeature: null },
  // Gym
  { icon: Wallet, label: 'Payments', path: '/gym-payments', description: 'Member payments', moduleKey: 'gym_members', systemTypes: ['gym'], optionalFeature: null },
  // Shared
  { icon: CheckSquare, label: 'Tasks', path: '/tasks', description: 'Track your to-dos', moduleKey: 'tasks', systemTypes: null, optionalFeature: null },
  { icon: Calculator, label: 'Accounting', path: '/accounting', description: 'Financial overview', moduleKey: 'accounting', systemTypes: null, optionalFeature: null },
  { icon: Users2, label: 'Staff', path: '/staff', description: 'Team management', moduleKey: 'staff', systemTypes: null, optionalFeature: null },
  { icon: TrendingUp, label: 'Profitability', path: '/profitability', description: 'Margins & costs', moduleKey: 'profitability', systemTypes: ['business', 'workshop'], optionalFeature: null },
  { icon: FolderOpen, label: 'Drafts', path: '/drafts', description: 'Saved drafts', moduleKey: null, systemTypes: null, optionalFeature: 'drafts' as const },
  { icon: Settings, label: 'Settings', path: '/settings', description: 'Company profile', moduleKey: null, systemTypes: null, optionalFeature: null },
  { icon: CreditCard, label: 'Billing', path: '/billing', description: 'Subscription & plans', moduleKey: null, systemTypes: null, optionalFeature: null },
];

export function MoreMenuSheet({ open, onOpenChange }: MoreMenuSheetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasModule, userModules } = useModules();
  const { systemType } = useSubscription();
  const { isEnabled } = useOptionalFeatures();

  const menuItems = allMenuItems.filter((item) => {
    // Optional feature gate
    if (item.optionalFeature && !isEnabled(item.optionalFeature)) return false;
    // System type filter
    if (item.systemTypes !== null && !item.systemTypes.includes(systemType)) {
      return false;
    }
    if (!item.moduleKey) return true;
    if (userModules.length === 0) return false;
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
