import { Bell, BellOff, Loader2, Send, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationToggle() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
        <BellOff className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Push Notifications Not Supported</p>
          <p className="text-xs text-muted-foreground">
            Your browser doesn't support push notifications. Try using a modern browser or install the app on your device.
          </p>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <div className="flex-1">
          <p className="text-sm font-medium">Notifications Blocked</p>
          <p className="text-xs text-muted-foreground">
            You've blocked notifications for this site. To enable them, update your browser's site settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications" className="text-base">
              Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive reminders for upcoming and overdue tasks
            </p>
          </div>
        </div>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
          />
        )}
      </div>

      {isSubscribed && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestNotification}
            disabled={isLoading}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Test Notification
          </Button>
          <span className="text-xs text-muted-foreground">
            Make sure notifications work on your device
          </span>
        </div>
      )}
    </div>
  );
}
