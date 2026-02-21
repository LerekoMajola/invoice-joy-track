import { ReactNode, useState, useEffect, useCallback } from 'react';
import { Home, CreditCard, CalendarDays, GraduationCap, LogOut, Zap, Dumbbell, Activity, Sun, Moon, Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export type PortalTab = 'home' | 'membership' | 'classes' | 'fees' | 'timetable' | 'check-in' | 'progress';

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
];

const schoolNav: NavItem[] = [
  { id: 'home',      label: 'Home',      icon: Home },
  { id: 'fees',      label: 'Fees',      icon: CreditCard },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
];

interface PortalNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface PortalLayoutProps {
  children: ReactNode;
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  portalType: 'gym' | 'school';
  onSignOut?: () => void;
  gymName?: string;
}

const typeIcons: Record<string, string> = {
  payment_due: '💰',
  membership_expiry: '⏰',
  welcome: '👋',
  system: '🔔',
};

export function PortalLayout({ children, activeTab, onTabChange, portalType, onSignOut, gymName }: PortalLayoutProps) {
  const nav = portalType === 'gym' ? gymNav : schoolNav;
  const PortalIcon = portalType === 'gym' ? Dumbbell : GraduationCap;
  const portalTitle = gymName || (portalType === 'gym' ? 'Member Portal' : 'Student Portal');

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('portal_theme');
    return saved ? saved === 'dark' : true;
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('portal_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const pt = (dark: string, light: string) => isDark ? dark : light;

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('portal_notifications')
      .select('*')
      .eq('portal_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) {
      setNotifications(data as PortalNotification[]);
      setUnreadCount((data as PortalNotification[]).filter(n => !n.is_read).length);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await supabase.from('portal_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('portal_notifications').update({ is_read: true }).eq('portal_user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const bg = isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50';
  const headerBg = isDark ? 'bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06]' : 'bg-white border-b border-gray-200 shadow-sm';
  const headerText = isDark ? 'text-white/90' : 'text-gray-900';
  const navBg = isDark ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/[0.06]' : 'bg-white/95 backdrop-blur-xl border-t border-gray-200';

  return (
    <div className={cn("h-[100dvh] flex flex-col max-w-md mx-auto overflow-hidden", bg)} data-portal-theme={isDark ? 'dark' : 'light'}>
      {/* Top Header */}
      <header className={cn("z-50 px-4 h-14 flex items-center justify-between shrink-0", headerBg)}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#00E5A0] to-[#00C4FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,160,0.25)]">
            <PortalIcon className="h-4 w-4 text-black" />
          </div>
          <span className={cn("font-bold text-sm tracking-tight", headerText)}>{portalTitle}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setNotifOpen(true); fetchNotifications(); }}
            className={cn("h-8 w-8 p-0 relative", pt('text-white/40 hover:text-white hover:bg-white/10', 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'))}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDark(!isDark)}
            className={cn("h-8 w-8 p-0", isDark ? 'text-white/40 hover:text-yellow-300 hover:bg-yellow-500/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100')}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {onSignOut && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className={cn("h-8 px-2.5 gap-1.5 text-xs", isDark ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50')}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          )}
        </div>
      </header>

      {/* Notification Drawer */}
      <Drawer open={notifOpen} onOpenChange={setNotifOpen}>
        <DrawerContent className={cn("max-h-[80vh]", pt('bg-[#12121a] border-white/[0.06]', 'bg-white border-gray-200'))}>
          <DrawerHeader className="flex items-center justify-between pb-2">
            <DrawerTitle className={pt('text-white', 'text-gray-900')}>Notifications</DrawerTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-7 text-xs", pt('text-[#00E5A0] hover:bg-[#00E5A0]/10', 'text-emerald-600 hover:bg-emerald-50'))}
                  onClick={markAllRead}
                >
                  Mark all read
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className={cn("h-7 w-7", pt('text-white/40', 'text-gray-400'))}>
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <ScrollArea className="h-[60vh] px-3 pb-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <Bell className={cn("h-8 w-8", pt('text-white/20', 'text-gray-300'))} />
                <span className={cn("text-sm", pt('text-white/40', 'text-gray-400'))}>No notifications yet</span>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-colors relative',
                      n.is_read
                        ? pt('bg-white/[0.02]', 'bg-gray-50')
                        : pt('bg-[#00E5A0]/[0.06] border border-[#00E5A0]/10', 'bg-emerald-50 border border-emerald-100')
                    )}
                  >
                    {!n.is_read && (
                      <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[#00E5A0]" />
                    )}
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg mt-0.5">{typeIcons[n.type] || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-semibold text-sm", pt('text-white/90', 'text-gray-900'))}>{n.title}</p>
                        <p className={cn("text-xs mt-0.5 line-clamp-2", pt('text-white/50', 'text-gray-500'))}>{n.message}</p>
                        <p className={cn("text-[10px] mt-1.5", pt('text-white/25', 'text-gray-400'))}>
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className={cn("z-50 shrink-0", navBg)}>
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
                      isActive ? 'text-[#00E5A0]' : isDark ? 'text-white/30' : 'text-gray-400'
                    )}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-[#00E5A0] font-bold' : isDark ? 'text-white/30' : 'text-gray-400'
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
