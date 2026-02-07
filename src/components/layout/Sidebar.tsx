import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  CheckSquare, 
  LogOut,
  Settings,
  CreditCard,
  UserPlus,
  Calculator,
  GraduationCap,
  School,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useModules } from '@/hooks/useModules';
import { Button } from '@/components/ui/button';

// Map nav items to module keys (null = always visible)
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, moduleKey: null },
  { name: 'Students', href: '/students', icon: GraduationCap, moduleKey: 'students' },
  { name: 'School Admin', href: '/school-admin', icon: School, moduleKey: 'school_admin' },
  { name: 'School Fees', href: '/school-fees', icon: Wallet, moduleKey: 'school_fees' },
  { name: 'Invoices', href: '/invoices', icon: Receipt, moduleKey: 'invoices' },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, moduleKey: 'tasks' },
  { name: 'Staff', href: '/staff', icon: UserPlus, moduleKey: 'staff' },
  { name: 'Accounting', href: '/accounting', icon: Calculator, moduleKey: 'accounting' },
  { name: 'Settings', href: '/settings', icon: Settings, moduleKey: null },
  { name: 'Billing', href: '/billing', icon: CreditCard, moduleKey: null },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { hasModule, userModules } = useModules();

  const filteredNavigation = navigation.filter((item) => {
    // Always show items without a module key
    if (!item.moduleKey) return true;
    // If user has no modules yet, only show base nav (not everything)
    if (userModules.length === 0) return false;
    // Gate by subscribed module
    return hasModule(item.moduleKey);
  });

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-sidebar md:fixed overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className="relative flex-1 space-y-1 px-3 py-6 overflow-y-auto scrollbar-hide">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleClick}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]',
                  isActive
                    ? 'bg-white text-primary shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                )}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-glow-primary" />
                )}
                <item.icon className={cn(
                  'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                  isActive ? 'text-primary' : 'group-hover:scale-110'
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="relative border-t border-white/10 p-3 space-y-2 pb-safe bg-white/5 backdrop-blur-sm">
          {user && (
            <div className="px-3 py-2 rounded-lg bg-white/5">
              <p className="text-xs text-white/50">Logged in as</p>
              <p className="text-sm text-white truncate font-medium">{user.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              signOut();
              onNavigate?.();
            }}
            className="w-full justify-start gap-3 text-white/70 hover:bg-white/10 hover:text-white min-h-[44px] rounded-xl"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}
