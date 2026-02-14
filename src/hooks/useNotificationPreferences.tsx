import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type NotificationCategory = 'task' | 'invoice' | 'quote' | 'lead' | 'tender' | 'system';
export type NotificationChannel = 'push' | 'sms' | 'email';

export type CategoryPreferences = Record<NotificationCategory, Record<NotificationChannel, boolean>>;

const DEFAULT_CATEGORY_PREFERENCES: CategoryPreferences = {
  task: { push: true, sms: false, email: false },
  invoice: { push: true, sms: false, email: false },
  quote: { push: true, sms: false, email: false },
  lead: { push: true, sms: false, email: false },
  tender: { push: true, sms: false, email: false },
  system: { push: true, sms: false, email: false },
};

export interface NotificationPreferencesData {
  sms_enabled: boolean;
  email_enabled: boolean;
  category_preferences: CategoryPreferences;
}

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return {
          sms_enabled: false,
          email_enabled: false,
          category_preferences: DEFAULT_CATEGORY_PREFERENCES,
        } as NotificationPreferencesData;
      }
      return {
        sms_enabled: data.sms_enabled,
        email_enabled: data.email_enabled,
        category_preferences: {
          ...DEFAULT_CATEGORY_PREFERENCES,
          ...(data.category_preferences as Record<string, any>),
        },
      } as NotificationPreferencesData;
    },
    enabled: !!user?.id,
  });

  const savePreferences = useMutation({
    mutationFn: async (prefs: NotificationPreferencesData) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(
          {
            user_id: user.id,
            sms_enabled: prefs.sms_enabled,
            email_enabled: prefs.email_enabled,
            category_preferences: prefs.category_preferences as any,
          },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
    },
    onError: (err: any) => {
      toast.error('Failed to save notification preferences');
      console.error(err);
    },
  });

  const updatePreference = (updater: (prev: NotificationPreferencesData) => NotificationPreferencesData) => {
    const current = preferences || {
      sms_enabled: false,
      email_enabled: false,
      category_preferences: DEFAULT_CATEGORY_PREFERENCES,
    };
    const updated = updater(current);
    savePreferences.mutate(updated);
  };

  return {
    preferences: preferences || {
      sms_enabled: false,
      email_enabled: false,
      category_preferences: DEFAULT_CATEGORY_PREFERENCES,
    },
    isLoading,
    updatePreference,
    isSaving: savePreferences.isPending,
  };
}
