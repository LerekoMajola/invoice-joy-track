import { ReactNode } from 'react';
import { Home, CreditCard, CalendarDays, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PortalTab = 'home' | 'membership' | 'classes' | 'messages' | 'fees' | 'timetable';

interface NavItem {
  id: PortalTab;
  label: string;
  icon: typeof Home;
}

const gymNav: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'membership', label: 'Membership', icon: CreditCard },
  { id: 'classes', label: 'Classes', icon: CalendarDays },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
];

const schoolNav: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'fees', label: 'Fees', icon: CreditCard },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
];

interface PortalLayoutProps {
  children: ReactNode;
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  portalType: 'gym' | 'school';
}

export function PortalLayout({ children, activeTab, onTabChange, portalType }: PortalLayoutProps) {
  const nav = portalType === 'gym' ? gymNav : schoolNav;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-border z-50">
        <div className="flex items-center justify-around px-2 py-1 safe-area-bottom">
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[60px] transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'fill-primary/20')} />
                <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
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
