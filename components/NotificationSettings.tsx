'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationSettings() {
  const {
    isSupported,
    permission,
    isRegistered,
    requestPermission,
    registerServiceWorker,
    subscribeToPush,
    sendLocalNotification,
  } = useNotifications();

  const [isSettingUp, setIsSettingUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEnableNotifications = async () => {
    setIsSettingUp(true);
    setMessage(null);

    try {
      // Step 1: Request permission
      if (permission !== 'granted') {
        const perm = await requestPermission();
        if (perm !== 'granted') {
          setMessage('Notification permission denied');
          return;
        }
      }

      // Step 2: Register service worker
      await registerServiceWorker();

      // Step 3: Subscribe to push notifications (if VAPID key is available)
      try {
        await subscribeToPush();
        setMessage('Push notifications enabled!');
      } catch (error: any) {
        // If VAPID key is not set, just enable local notifications
        if (error.message?.includes('VAPID')) {
          setMessage('Local notifications enabled (push requires VAPID key)');
        } else {
          throw error;
        }
      }

      // Test notification
      sendLocalNotification('Notifications Enabled', {
        body: 'You will now receive reminders for your goals',
        tag: 'notification-enabled',
      });
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSettingUp(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs font-light text-gray-600 dark:text-gray-400">
        Notifications not supported in this browser
      </div>
    );
  }

  if (permission === 'granted' && isRegistered) {
    return (
      <div className="text-xs font-light text-gray-600 dark:text-gray-400">
        Notifications enabled
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleEnableNotifications}
        disabled={isSettingUp}
        className="text-xs py-1 px-3"
      >
        {isSettingUp ? 'Enabling...' : 'Enable Notifications'}
      </Button>
      {message && (
        <div className="text-xs font-light text-gray-600 dark:text-gray-400">
          {message}
        </div>
      )}
    </div>
  );
}

