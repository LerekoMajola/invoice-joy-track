import { PushNotificationToggle } from './PushNotificationToggle';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Mail, Loader2 } from 'lucide-react';
import { useNotificationPreferences, NotificationCategory, NotificationChannel } from '@/hooks/useNotificationPreferences';
import { useSmsCredits } from '@/hooks/useSmsCredits';

const CATEGORIES: { key: NotificationCategory; label: string }[] = [
  { key: 'task', label: 'Task Reminders' },
  { key: 'invoice', label: 'Invoice Updates' },
  { key: 'quote', label: 'Quote Updates' },
  { key: 'lead', label: 'Lead Alerts' },
  { key: 'tender', label: 'Tender Reminders' },
  { key: 'system', label: 'System Alerts' },
];

const CHANNELS: { key: NotificationChannel; label: string }[] = [
  { key: 'push', label: 'Push' },
  { key: 'sms', label: 'SMS' },
  { key: 'email', label: 'Email' },
];

export function NotificationPreferences() {
  const { preferences, isLoading, updatePreference } = useNotificationPreferences();
  const { creditsRemaining } = useSmsCredits();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications - existing component */}
      <PushNotificationToggle />

      {/* SMS Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <MessageSquare className={`h-5 w-5 ${preferences.sms_enabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="space-y-0.5">
            <Label htmlFor="sms-notifications" className="text-base">SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive alerts via SMS · {creditsRemaining} credits remaining
            </p>
          </div>
        </div>
        <Switch
          id="sms-notifications"
          checked={preferences.sms_enabled}
          onCheckedChange={(checked) =>
            updatePreference((prev) => ({ ...prev, sms_enabled: checked }))
          }
        />
      </div>

      {/* Email Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <Mail className={`h-5 w-5 ${preferences.email_enabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive alerts via email
            </p>
          </div>
        </div>
        <Switch
          id="email-notifications"
          checked={preferences.email_enabled}
          onCheckedChange={(checked) =>
            updatePreference((prev) => ({ ...prev, email_enabled: checked }))
          }
        />
      </div>

      {/* Per-Category Preferences Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Per-Category Preferences</h4>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Category</th>
                {CHANNELS.map((ch) => (
                  <th key={ch.key} className="text-center p-3 font-medium w-20">
                    {ch.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => (
                <tr key={cat.key} className="border-b last:border-b-0">
                  <td className="p-3 text-foreground">{cat.label}</td>
                  {CHANNELS.map((ch) => {
                    const isDisabled =
                      (ch.key === 'sms' && !preferences.sms_enabled) ||
                      (ch.key === 'email' && !preferences.email_enabled);
                    const checked = preferences.category_preferences[cat.key]?.[ch.key] ?? false;
                    return (
                      <td key={ch.key} className="text-center p-3">
                        <Checkbox
                          checked={checked && !isDisabled}
                          disabled={isDisabled}
                          onCheckedChange={(val) => {
                            updatePreference((prev) => ({
                              ...prev,
                              category_preferences: {
                                ...prev.category_preferences,
                                [cat.key]: {
                                  ...prev.category_preferences[cat.key],
                                  [ch.key]: !!val,
                                },
                              },
                            }));
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
