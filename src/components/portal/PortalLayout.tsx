import { ReactNode } from 'react';
import { Home, CreditCard, CalendarDays, MessageCircle, GraduationCap, LogOut, Zap, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { haptics } from '@/lib/haptics';

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
  const isGym = portalType === 'gym';

  const handleTabChange = (tab: PortalTab) => {
    haptics.selection();
    onTabChange(tab);
  };

  return (
    <div className={cn(
      "h-[100dvh] flex flex-col max-w-md mx-auto overflow-hidden",
      isGym ? "bg-gray-950 text-white" : "bg-background"
    )}>
      {/* Top Header */}
      <header className={cn(
        "z-50 backdrop-blur-md px-4 h-14 flex items-center justify-between shrink-0",
        isGym
          ? "bg-gray-950/80 border-b border-white/[0.06]"
          : "bg-background/80 border-b border-border/50"
      )}>
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "h-8 w-8 rounded-xl flex items-center justify-center",
            isGym
              ? "bg-gradient-to-br from-[#00E5A0]/20 to-[#00C4FF]/20 border border-[#00E5A0]/20"
              : "bg-primary/10"
          )}>
            <PortalIcon className={cn(
              "h-4 w-4",
              isGym ? "text-[#00E5A0]" : "text-primary"
            )} />
          </div>
          <span className={cn(
            "font-semibold text-sm",
            isGym ? "text-white" : "text-foreground"
          )}>{portalTitle}</span>
        </div>
        {onSignOut && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className={cn(
              "h-8 px-2.5 gap-1.5 text-xs",
              isGym
                ? "text-white/40 hover:text-red-400 hover:bg-red-500/10"
                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            )}
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
      <nav className={cn(
        "backdrop-blur-md border-t z-50 shrink-0",
        isGym
          ? "bg-gray-900/80 border-white/[0.06]"
          : "bg-card/95 border-border"
      )}>
        <div className="flex items-center justify-around px-2 py-2">
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px] transition-all relative"
              >
                {/* Glowing dot above active icon */}
                {isGym && isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#00E5A0] shadow-[0_0_6px_#00E5A0,0_0_12px_#00E5A0]" />
                )}
                <div className={cn(
                  'flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200',
                  isGym
                    ? isActive ? 'bg-[#00E5A0]/10' : 'bg-transparent'
                    : isActive ? 'bg-primary/12' : 'bg-transparent'
                )}>
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors duration-200',
                      isGym
                        ? isActive ? 'text-[#00E5A0]' : 'text-white/30'
                        : isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isGym
                    ? isActive ? 'text-[#00E5A0] font-bold' : 'text-white/30'
                    : isActive ? 'text-primary font-bold' : 'text-muted-foreground'
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
