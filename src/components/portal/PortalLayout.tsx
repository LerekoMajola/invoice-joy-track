import { ReactNode } from 'react';
import { Home, CreditCard, CalendarDays, MessageCircle, GraduationCap, LogOut, Zap, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type PortalTab = 'home' | 'membership' | 'classes' | 'messages' | 'fees' | 'timetable' | 'check-in';

interface NavItem {
  id: PortalTab;
  label: string;
  icon: React.ElementType;
}

const gymNav: NavItem[] = [
  { id: 'home',       label: 'Home',     icon: Home },
  { id: 'membership', label: 'Plan',     icon: CreditCard },
  { id: 'classes',    label: 'Classes',  icon: CalendarDays },
  { id: 'check-in',   label: 'Check In', icon: Zap },
  { id: 'messages',   label: 'Messages', icon: MessageCircle },
];

const schoolNav: NavItem[] = [
  { id: 'home',      label: 'Home',      icon: Home },
  { id: 'fees',      label: 'Fees',      icon: CreditCard },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'messages',  label: 'Messages',  icon: MessageCircle },
];

interface PortalLayoutProps {
  children: ReactNode;
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  portalType: 'gym' | 'school';
  onSignOut?: () => void;
}

export function PortalLayout({ children, activeTab, onTabChange, portalType, onSignOut }: PortalLayoutProps) {
  const nav = portalType === 'gym' ? gymNav : schoolNav;
  const PortalIcon = portalType === 'gym' ? Dumbbell : GraduationCap;
  const portalTitle = portalType === 'gym' ? 'Member Portal' : 'Student Portal';

  return (
    <div className="h-[100dvh] bg-background flex flex-col max-w-md mx-auto overflow-hidden">
      {/* Top Header */}
      <header className="z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <PortalIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm text-foreground">{portalTitle}</span>
        </div>
        {onSignOut && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="h-8 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-card/95 backdrop-blur-md border-t border-border z-50 shrink-0">
        <div className="flex items-center justify-around px-2 py-2">
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px] transition-all"
              >
                <div className={cn(
                  'flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200',
                  isActive ? 'bg-primary/12' : 'bg-transparent'
                )}>
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
