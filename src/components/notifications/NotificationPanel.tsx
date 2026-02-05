 import { Bell, CheckCheck } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
 import { useNotifications } from '@/hooks/useNotifications';
 import { NotificationItem } from './NotificationItem';
 import { isToday, isYesterday, format } from 'date-fns';
 import { useState } from 'react';
  import { useIsMobile } from '@/hooks/use-mobile';
  import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
  import { X } from 'lucide-react';
 
 function groupNotificationsByDate(notifications: ReturnType<typeof useNotifications>['notifications']) {
   const groups: { label: string; notifications: typeof notifications }[] = [];
   const today: typeof notifications = [];
   const yesterday: typeof notifications = [];
   const earlier: typeof notifications = [];
 
   notifications.forEach((notification) => {
     const date = new Date(notification.created_at);
     if (isToday(date)) {
       today.push(notification);
     } else if (isYesterday(date)) {
       yesterday.push(notification);
     } else {
       earlier.push(notification);
     }
   });
 
   if (today.length > 0) groups.push({ label: 'Today', notifications: today });
   if (yesterday.length > 0) groups.push({ label: 'Yesterday', notifications: yesterday });
   if (earlier.length > 0) groups.push({ label: 'Earlier', notifications: earlier });
 
   return groups;
 }
 
 export function NotificationPanel() {
   const navigate = useNavigate();
   const [open, setOpen] = useState(false);
   const isMobile = useIsMobile();
   const {
     notifications,
     unreadCount,
     isLoading,
     markAsRead,
     markAllAsRead,
     deleteNotification,
   } = useNotifications();
 
   const groupedNotifications = groupNotificationsByDate(notifications);
 
   const handleNavigate = (link: string) => {
     setOpen(false);
     navigate(link);
   };
 
   const triggerButton = (
     <Button
       variant="ghost"
       size="icon"
       className="relative h-9 w-9 md:h-10 md:w-10 hover:bg-primary/10 rounded-xl touch-active"
       onClick={() => isMobile && setOpen(true)}
     >
       <Bell className="h-5 w-5 text-muted-foreground" />
       {unreadCount > 0 && (
         <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-white shadow-glow-coral animate-pulse">
           {unreadCount > 99 ? '99+' : unreadCount}
         </span>
       )}
     </Button>
   );
 
   const notificationContent = (
     <>
       {isLoading ? (
         <div className="flex items-center justify-center h-32">
           <span className="text-sm text-muted-foreground">Loading...</span>
         </div>
       ) : notifications.length === 0 ? (
         <div className="flex flex-col items-center justify-center h-32 gap-2">
           <Bell className="h-8 w-8 text-muted-foreground/50" />
           <span className="text-sm text-muted-foreground">
             No notifications yet
           </span>
         </div>
       ) : (
         <div className="p-2">
           {groupedNotifications.map((group) => (
             <div key={group.label} className="mb-4 last:mb-0">
               <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                 {group.label}
               </p>
               <div className="space-y-1">
                 {group.notifications.map((notification) => (
                   <NotificationItem
                     key={notification.id}
                     notification={notification}
                     onMarkAsRead={markAsRead}
                     onDelete={deleteNotification}
                     onNavigate={handleNavigate}
                   />
                 ))}
               </div>
             </div>
           ))}
         </div>
       )}
     </>
   );
 
   // Mobile: Use Drawer
   if (isMobile) {
     return (
       <>
         <Tooltip>
           <TooltipTrigger asChild>
             {triggerButton}
           </TooltipTrigger>
           <TooltipContent>Notifications</TooltipContent>
         </Tooltip>
 
         <Drawer open={open} onOpenChange={setOpen}>
           <DrawerContent className="max-h-[85vh]">
             <DrawerHeader className="flex items-center justify-between pb-2">
               <DrawerTitle>Notifications</DrawerTitle>
               <div className="flex items-center gap-2">
                 {unreadCount > 0 && (
                   <Button
                     variant="ghost"
                     size="sm"
                     className="h-8 text-xs gap-1"
                     onClick={() => markAllAsRead()}
                   >
                     <CheckCheck className="h-3.5 w-3.5" />
                     Mark all read
                   </Button>
                 )}
                 <DrawerClose asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8">
                     <X className="h-4 w-4" />
                   </Button>
                 </DrawerClose>
               </div>
             </DrawerHeader>
             <ScrollArea className="h-[60vh] px-2">
               {notificationContent}
             </ScrollArea>
           </DrawerContent>
         </Drawer>
       </>
     );
   }
 
   // Desktop: Use Popover
   return (
     <Popover open={open} onOpenChange={setOpen}>
       <Tooltip>
         <TooltipTrigger asChild>
           <PopoverTrigger asChild>
               {triggerButton}
           </PopoverTrigger>
         </TooltipTrigger>
         <TooltipContent>Notifications</TooltipContent>
       </Tooltip>
 
       <PopoverContent
         className="w-80 md:w-96 p-0"
         align="end"
         sideOffset={8}
       >
         {/* Header */}
         <div className="flex items-center justify-between border-b border-border px-4 py-3">
           <h3 className="font-semibold text-foreground">Notifications</h3>
           {unreadCount > 0 && (
             <Button
               variant="ghost"
               size="sm"
               className="h-7 text-xs gap-1"
               onClick={() => markAllAsRead()}
             >
               <CheckCheck className="h-3.5 w-3.5" />
               Mark all read
             </Button>
           )}
         </div>
 
         {/* Content */}
         <ScrollArea className="h-[400px]">
           {notificationContent}
         </ScrollArea>
       </PopoverContent>
     </Popover>
   );
 }