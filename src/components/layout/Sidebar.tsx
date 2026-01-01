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
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import leekayLogo from '@/assets/leekay-logo.png';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Delivery Notes', href: '/delivery-notes', icon: Truck },
  { name: 'Profitability', href: '/profitability', icon: TrendingUp },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Tenders & RFQs', href: '/tenders', icon: Briefcase },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
          <div className="bg-white rounded-lg px-3 py-1.5">
            <img src={leekayLogo} alt="Leekay" className="h-7 w-auto" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-sidebar-primary')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          {user && (
            <div className="px-3 py-2">
              <p className="text-xs text-sidebar-foreground/50">Logged in as</p>
              <p className="text-sm text-sidebar-foreground truncate">{user.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}
