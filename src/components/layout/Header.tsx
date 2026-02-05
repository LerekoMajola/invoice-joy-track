 import { Search, Plus, Settings, Menu, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
 import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
 import { NotificationPanel } from '@/components/notifications';
import { useSidebarControl } from './DashboardLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { Skeleton } from '@/components/ui/skeleton';
 import { useScrollDirection } from '@/hooks/useScrollDirection';
 import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const navigate = useNavigate();
  const { openSidebar } = useSidebarControl();
  const isMobile = useIsMobile();
  const { profile, isLoading } = useCompanyProfile();
   const { scrollDirection, isAtTop } = useScrollDirection();
 
   // Hide header on scroll down (mobile only)
   const isHidden = isMobile && scrollDirection === 'down' && !isAtTop;

  return (
     <header 
       className={cn(
         "sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-border bg-background/95 px-4 md:px-6 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 transition-transform duration-300",
         isHidden && "-translate-y-full"
       )}
     >
      {/* Subtle gradient border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Menu Button */}
        {isMobile && (
           <Button variant="ghost" size="icon" onClick={openSidebar} className="flex-shrink-0 hover:bg-primary/10 touch-active">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="min-w-0">
          <h1 className="font-display text-lg md:text-xl font-bold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Search - Desktop only */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9 bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 rounded-xl transition-all duration-300 focus:w-80"
          />
        </div>

         {/* Notifications */}
         <NotificationPanel />

        {/* Settings - Desktop only */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/settings')}
              className="hidden md:inline-flex h-9 w-9 md:h-10 md:w-10 hover:bg-primary/10 rounded-xl"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Company Settings</TooltipContent>
        </Tooltip>

        {/* Company Logo */}
        <div className="hidden sm:flex items-center">
          <div className="bg-card border border-border rounded-xl px-3 py-1.5 shadow-card">
            {isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : profile?.logo_url ? (
              <img 
                src={profile.logo_url} 
                alt={profile.company_name || 'Company'} 
                className="h-7 w-auto max-w-[120px] object-contain" 
              />
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-semibold text-xs truncate text-foreground max-w-[80px]">
                  {profile?.company_name || 'My Business'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {action && (
          <Button onClick={action.onClick} size={isMobile ? "sm" : "default"} variant="gradient" className="gap-1 md:gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{action.label}</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>
    </header>
  );
}
