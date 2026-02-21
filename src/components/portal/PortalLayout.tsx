import { ReactNode } from 'react';
import { Home, CreditCard, CalendarDays, MessageCircle, GraduationCap, LogOut, Zap, Dumbbell, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type PortalTab = 'home' | 'membership' | 'classes' | 'messages' | 'fees' | 'timetable' | 'check-in' | 'progress';

interface NavItem {
  id: PortalTab;
  label: string;
  icon: React.ElementType;
}

const gymNav: NavItem[] = [
  { id: 'home',       label: 'Home',      icon: Home },
  { id: 'progress',   label: 'Progress',  icon: Activity },
  { id: 'check-in',   label: 'Check In',  icon: Zap },
  { id: 'membership', label: 'Plan',      icon: CreditCard },
  { id: 'messages',   label: 'Messages',  icon: MessageCircle },
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
  gymName?: string;
}

export function PortalLayout({ children, activeTab, onTabChange, portalType, onSignOut, gymName }: PortalLayoutProps) {
  const nav = portalType === 'gym' ? gymNav : schoolNav;
  const PortalIcon = portalType === 'gym' ? Dumbbell : GraduationCap;
  const portalTitle = gymName || (portalType === 'gym' ? 'Member Portal' : 'Student Portal');

  return (
    <div className="h-[100dvh] bg-[#0a0a0f] flex flex-col max-w-md mx-auto overflow-hidden">
      {/* Top Header — glassmorphic dark */}
      <header className="z-50 bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06] px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#00E5A0] to-[#00C4FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,160,0.25)]">
            <PortalIcon className="h-4 w-4 text-black" />
          </div>
          <span className="font-bold text-sm text-white/90 tracking-tight">{portalTitle}</span>
        </div>
        {onSignOut && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="h-8 px-2.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 gap-1.5 text-xs"
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

      {/* Bottom Navigation — glassmorphic dark bar */}
      <nav className="bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/[0.06] z-50 shrink-0">
        <div className="flex items-center justify-around px-2 py-2">
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px] transition-all relative"
              >
                {/* Glow dot above active icon */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#00E5A0] shadow-[0_0_8px_2px_rgba(0,229,160,0.6)]" />
                )}
                <div className={cn(
                  'flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200',
                  isActive ? 'bg-[#00E5A0]/10' : 'bg-transparent'
                )}>
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors duration-200',
                      isActive ? 'text-[#00E5A0]' : 'text-white/30'
                    )}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-[#00E5A0] font-bold' : 'text-white/30'
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
