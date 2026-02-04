import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Receipt, 
  Truck, 
  CheckSquare, 
  Briefcase,
  LogOut,
  Settings,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import leekayLogo from '@/assets/leekay-logo.png';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients & Leads', href: '/crm', icon: Users },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Delivery Notes', href: '/delivery-notes', icon: Truck },
  { name: 'Profitability', href: '/profitability', icon: TrendingUp },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Tenders & RFQs', href: '/tenders', icon: Briefcase },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-5 border-b border-sidebar-border">
          <div className="bg-white rounded-lg px-3 py-1.5">
            <img src={leekayLogo} alt="Leekay" className="h-7 w-auto" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleClick}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-sidebar-border p-4 space-y-3 pb-safe">
          {user && (
            <div className="px-2">
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">Logged in as</p>
              <p className="text-sm text-sidebar-foreground/90 truncate mt-0.5">{user.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              signOut();
              onNavigate?.();
            }}
            className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground min-h-[44px] px-2"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}
