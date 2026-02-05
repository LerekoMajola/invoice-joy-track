 import { CheckSquare, Receipt, FileText, Target, Bell, X } from 'lucide-react';
 import { formatDistanceToNow } from 'date-fns';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 import type { Notification } from '@/hooks/useNotifications';
 
 interface NotificationItemProps {
   notification: Notification;
   onMarkAsRead: (id: string) => void;
   onDelete: (id: string) => void;
   onNavigate: (link: string) => void;
 }
 
 const typeConfig = {
   task: { icon: CheckSquare, color: 'text-primary' },
   invoice: { icon: Receipt, color: 'text-warning' },
   quote: { icon: FileText, color: 'text-info' },
   lead: { icon: Target, color: 'text-violet-500' },
   system: { icon: Bell, color: 'text-muted-foreground' },
 };
 
 export function NotificationItem({
   notification,
   onMarkAsRead,
   onDelete,
   onNavigate,
 }: NotificationItemProps) {
   const config = typeConfig[notification.type] || typeConfig.system;
   const Icon = config.icon;
 
   const handleClick = () => {
     if (!notification.is_read) {
       onMarkAsRead(notification.id);
     }
     if (notification.link) {
       onNavigate(notification.link);
     }
   };
 
   return (
     <div
       className={cn(
         'group relative flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer',
         notification.is_read
           ? 'bg-background hover:bg-muted/50'
           : 'bg-primary/5 hover:bg-primary/10'
       )}
       onClick={handleClick}
       role="button"
       tabIndex={0}
       onKeyDown={(e) => {
         if (e.key === 'Enter' || e.key === ' ') {
           handleClick();
         }
       }}
     >
       {/* Unread indicator */}
       {!notification.is_read && (
         <span className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
       )}
 
       {/* Icon */}
       <div className={cn('mt-0.5 flex-shrink-0', config.color)}>
         <Icon className="h-5 w-5" />
       </div>
 
       {/* Content */}
       <div className="flex-1 min-w-0">
         <p className="font-medium text-sm text-foreground truncate">
           {notification.title}
         </p>
         <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
           {notification.message}
         </p>
         <p className="text-xs text-muted-foreground/70 mt-1">
           {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
         </p>
       </div>
 
       {/* Delete button */}
       <Button
         variant="ghost"
         size="icon"
         className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
         onClick={(e) => {
           e.stopPropagation();
           onDelete(notification.id);
         }}
         aria-label="Delete notification"
       >
         <X className="h-3.5 w-3.5" />
       </Button>
     </div>
   );
 }