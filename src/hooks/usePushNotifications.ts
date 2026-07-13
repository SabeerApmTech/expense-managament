import { useEffect } from 'react';
import { notificationApi } from '../api/notification.api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Registers the service worker and subscribes the browser to push notifications once authenticated. */
export function usePushNotifications(isAuthenticated: boolean): void {
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    let cancelled = false;

    const setup = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }

        if (Notification.permission !== 'granted') return;

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          const publicKey = await notificationApi.getVapidPublicKey();
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
          });
        }

        if (!cancelled) {
          await notificationApi.subscribe(subscription.toJSON());
        }
      } catch (error) {
        console.error('Push notification setup failed', error);
      }
    };

    setup();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
}
