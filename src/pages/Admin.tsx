import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, LayoutDashboard, Users, Briefcase, CreditCard, BarChart3, Settings, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminOverviewTab, CustomersTab, AdminSettingsTab, AdminInvoicesTab, AdminCRMTab, BillingTab, UsageAnalyticsTab } from '@/components/admin';
import { PlatformLogo } from '@/components/shared/PlatformLogo';
import { PackageChangeRequests } from '@/components/admin/PackageChangeRequests';
import { usePackageChangeRequests } from '@/hooks/usePackageChangeRequests';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { pendingRequests } = usePackageChangeRequests(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'crm', label: 'CRM', icon: Briefcase },
    { id: 'customers', label: 'Customers', icon: Users, badge: pendingRequests.length || undefined },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'usage', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return <AdminOverviewTab />;
      case 'crm': return <AdminCRMTab />;
      case 'customers': return (
        <div className="space-y-6">
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                Package Requests
                <Badge className="bg-warning text-warning-foreground">{pendingRequests.length}</Badge>
              </h3>
              <PackageChangeRequests />
            </div>
          )}
          <CustomersTab />
        </div>
      );
      case 'billing': return <BillingTab />;
      case 'invoices': return <AdminInvoicesTab />;
      case 'usage': return <UsageAnalyticsTab />;
      case 'settings': return <AdminSettingsTab />;
      default: return <AdminOverviewTab />;
    }
  };

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-white/10",
        collapsed && !isMobile && "justify-center px-2"
      )}>
        <PlatformLogo
          className="h-9 w-9 rounded-lg bg-white/10 p-1.5 shadow-sm flex-shrink-0"
          fallbackIcon={
            <div className="p-1.5 rounded-lg bg-white/15">
              <Shield className="h-5 w-5 text-white" />
            </div>
          }
        />
        {(!collapsed || isMobile) && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">Platform Admin</h1>
            <p className="text-[10px] text-white/50">Management Console</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                onNavigate?.();
              }}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/8",
                collapsed && !isMobile && "justify-center px-2"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full" />
              )}
              <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", active && "text-white")} />
              {(!collapsed || isMobile) && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 px-1.5 text-[10px] bg-warning text-warning-foreground rounded-full">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
              {collapsed && !isMobile && item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center bg-warning text-warning-foreground text-[9px] font-bold rounded-full px-1">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className={cn(
        "px-3 py-4 border-t border-white/10 space-y-2",
        collapsed && !isMobile && "px-2"
      )}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-white/60 hover:text-white hover:bg-white/8 justify-start gap-2",
            collapsed && !isMobile && "justify-center px-2"
          )}
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft className="h-4 w-4" />
          {(!collapsed || isMobile) && <span>Back to App</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-white/60 hover:text-white hover:bg-white/8 justify-start gap-2",
            collapsed && !isMobile && "justify-center px-2"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  const currentNav = navItems.find(n => n.id === activeSection);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className={cn(
          "fixed top-0 left-0 h-screen bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.85)] shadow-xl z-40 transition-all duration-300 flex flex-col",
          collapsed ? "w-[60px]" : "w-[220px]"
        )}>
          <SidebarNav />
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:scale-110 transition-transform"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </aside>
      )}

      {/* Main content */}
      <div className={cn(
        "flex-1 min-h-screen transition-all duration-300",
        !isMobile && (collapsed ? "ml-[60px]" : "ml-[220px]")
      )}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-lg px-4 md:px-6">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[250px] border-0 bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.85)]">
                  <SidebarNav onNavigate={() => setMobileOpen(false)} />
                </SheetContent>
              </Sheet>
            )}
            <div>
              <h2 className="text-lg font-bold text-foreground">{currentNav?.label || 'Overview'}</h2>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/dashboard')}>
            Go to App
          </Button>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
