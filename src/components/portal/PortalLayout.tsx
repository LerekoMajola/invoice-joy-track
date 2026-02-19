import { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type PortalTab = 'home' | 'membership' | 'classes' | 'messages' | 'fees' | 'timetable' | 'check-in';

interface NavItem {
  id: PortalTab;
  label: string;
  emoji: string;
  activeEmoji: string;
}

const gymNav: NavItem[] = [
  { id: 'home',       label: 'Home',     emoji: '🏠',  activeEmoji: '🏠' },
  { id: 'membership', label: 'Plan',     emoji: '💳',  activeEmoji: '💳' },
  { id: 'classes',    label: 'Classes',  emoji: '📅',  activeEmoji: '📅' },
  { id: 'check-in',   label: 'Check In', emoji: '⚡',  activeEmoji: '⚡' },
  { id: 'messages',   label: 'Messages', emoji: '💬',  activeEmoji: '💬' },
];

const schoolNav: NavItem[] = [
  { id: 'home',      label: 'Home',      emoji: '🏠', activeEmoji: '🏠' },
  { id: 'fees',      label: 'Fees',      emoji: '💳', activeEmoji: '💳' },
  { id: 'timetable', label: 'Timetable', emoji: '📅', activeEmoji: '📅' },
  { id: 'messages',  label: 'Messages',  emoji: '💬', activeEmoji: '💬' },
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
  const portalEmoji = portalType === 'gym' ? '🏋️' : '🎓';
  const portalTitle = portalType === 'gym' ? 'Member Portal' : 'Student Portal';

  return (
    <div className="h-[100dvh] bg-background flex flex-col max-w-md mx-auto overflow-hidden">
      {/* Top Header */}
      <header className="z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
            {portalEmoji}
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
        <div className="flex items-center justify-around px-3 py-2">
          {nav.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px] transition-all"
              >
                <div className={cn(
                  'flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 text-xl',
                  isActive ? 'bg-primary/12 scale-110' : 'scale-100'
                )}>
                  {item.emoji}
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
