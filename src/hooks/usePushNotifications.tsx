import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Fetch VAPID public key
  useEffect(() => {
    const fetchVapidKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-vapid-key');
        if (error) {
          console.error('Error fetching VAPID key:', error);
          return;
        }
        if (data?.publicKey) {
          setVapidPublicKey(data.publicKey);
        }
      } catch (error) {
        console.error('Error fetching VAPID key:', error);
      }
    };
    
    fetchVapidKey();
  }, []);

  // Check current subscription status
  useEffect(() => {
    if (!isSupported || !user) {
      setIsLoading(false);
      return;
    }

    checkSubscription();
  }, [isSupported, user]);

  const checkSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a subscription in the database
      const { data: dbSubscription } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (dbSubscription) {
        // Verify the browser still has the subscription
        const registration = await navigator.serviceWorker.ready;
        const subscription = await (registration as any).pushManager.getSubscription();
        
        if (subscription) {
          setIsSubscribed(true);
        } else {
          // Browser subscription was lost, clean up database
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user?.id);
          setIsSubscribed(false);
        }
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) {
      toast.error('Push notifications are not supported');
      return false;
    }

    if (!vapidPublicKey) {
      toast.error('Push notifications are not configured');
      console.error('VAPID public key not available');
      return false;
    }

    try {
      setIsLoading(true);

      // Request permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast.error('Notification permission denied');
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // Extract subscription data
      const subscriptionJson = subscription.toJSON();
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || '',
        auth: subscriptionJson.keys?.auth || '',
      };

      // Save to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.p256dh,
          auth: subscriptionData.auth,
        }, {
          onConflict: 'user_id,endpoint',
        });

      if (error) {
        console.error('Error saving subscription:', error);
        toast.error('Failed to save notification preferences');
        return false;
      }

      setIsSubscribed(true);
      toast.success('Push notifications enabled');
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Failed to enable push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, vapidPublicKey]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);

      // Get current subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from database
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing subscription:', error);
        toast.error('Failed to disable notifications');
        return false;
      }

      setIsSubscribed(false);
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Failed to disable push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!user || !isSubscribed) {
      toast.error('You must be subscribed to send a test notification');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: user.id,
          title: 'Test Notification',
          body: 'Push notifications are working! 🎉',
          url: '/tasks',
        },
      });

      if (error) {
        console.error('Error sending test notification:', error);
        toast.error('Failed to send test notification');
        return false;
      }

      toast.success('Test notification sent');
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
      return false;
    }
  }, [user, isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}
