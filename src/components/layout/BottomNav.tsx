import { Home, GraduationCap, Wallet, Receipt, MoreHorizontal } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { useModules } from '@/hooks/useModules';
import { MoreMenuSheet } from './MoreMenuSheet';

// Module key mapping for bottom nav items (null = always visible)
const allNavItems = [
  { icon: Home, label: 'Home', path: '/dashboard', moduleKey: null },
  { icon: GraduationCap, label: 'Students', path: '/students', moduleKey: 'students' },
  { icon: Wallet, label: 'Fees', path: '/school-fees', moduleKey: 'school_fees' },
  { icon: Receipt, label: 'Invoices', path: '/invoices', moduleKey: 'invoices' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const { hasModule, userModules } = useModules();

  const navItems = allNavItems.filter((item) => {
    if (!item.moduleKey) return true;
    if (userModules.length === 0) return false;
    return hasModule(item.moduleKey);
  });

  const handleNavClick = (path: string) => {
    haptics.selection();
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;
  
  // Check if current path is in "more" menu
  const moreRoutes = ['/tasks', '/accounting', '/staff', '/school-admin', '/timetable', '/billing'];
  const isMoreActive = moreRoutes.some(route => location.pathname === route);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 touch-active',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-xl transition-all duration-200',
                  active && 'bg-primary/10'
                )}>
                  <item.icon className={cn('h-5 w-5', active && 'scale-110')} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  active && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
          
          {/* More Button */}
          <button
            onClick={() => {
              haptics.selection();
              setMoreOpen(true);
            }}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 touch-active',
              isMoreActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <div className={cn(
              'p-1.5 rounded-xl transition-all duration-200',
              isMoreActive && 'bg-primary/10'
            )}>
              <MoreHorizontal className={cn('h-5 w-5', isMoreActive && 'scale-110')} />
            </div>
            <span className={cn(
              'text-[10px] font-medium',
              isMoreActive && 'font-semibold'
            )}>
              More
            </span>
          </button>
        </div>
      </nav>

      <MoreMenuSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
