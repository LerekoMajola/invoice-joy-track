import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
 import { BottomNav } from './BottomNav';
 import { OfflineIndicator } from './OfflineIndicator';
 import { InstallPrompt } from '@/components/pwa/InstallPrompt';
 import { PageTransition } from './PageTransition';

interface DashboardLayoutProps {
  children: ReactNode;
}

// Create context for sidebar control
import { createContext, useContext } from 'react';

interface SidebarContextType {
  openSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarControl() {
  const context = useContext(SidebarContext);
  if (!context) {
    return { openSidebar: () => {} };
  }
  return context;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);

  return (
    <SidebarContext.Provider value={{ openSidebar }}>
      <div className="min-h-screen bg-background">
         {/* Offline Indicator */}
         <OfflineIndicator />
 
        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar />}
        
        {/* Mobile Sidebar Sheet */}
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64 border-0">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
        
         <main className={isMobile ? 'pb-20' : 'pl-64'}>
           <PageTransition>
             {children}
           </PageTransition>
        </main>
 
         {/* Mobile Bottom Navigation */}
         {isMobile && (
           <>
             <BottomNav />
             <InstallPrompt />
           </>
         )}
      </div>
    </SidebarContext.Provider>
  );
}
