import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { OmniAgendaItem } from '../types';
import { 
  registerServiceWorker, 
  requestNotificationPermission, 
  triggerDesktopNotification, 
  playNotificationChime 
} from '../utils/notifications';
import { parseISO, format } from '../utils/dateUtils';

export interface OmniAlert {
  id: string;
  itemId: string;
  title: string;
  message: string;
  time: string;
  type: 'event' | 'task';
  read: boolean;
}

interface NotificationContextType {
  permission: NotificationPermission | 'unsupported';
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  isInstallable: boolean;
  installApp: () => Promise<void>;
  requestPermission: () => Promise<void>;
  alerts: OmniAlert[];
  unreadCount: number;
  markAlertsAsRead: () => void;
  clearAlerts: () => void;
  testNotification: () => void;
  checkReminders: (items: OmniAgendaItem[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('omni_sound_enabled') !== 'false';
  });
  const [isInstallable, setIsInstallable] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  const [alerts, setAlerts] = useState<OmniAlert[]>(() => {
    const saved = localStorage.getItem('omni_alert_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Track sent reminders (e.g. `agenda-1-10m`, `agenda-1-start`)
  const notifiedRemindersRef = useRef<Set<string>>(
    (() => {
      try {
        const saved = localStorage.getItem('omni_notified_reminders');
        return new Set<string>(saved ? JSON.parse(saved) : []);
      } catch {
        return new Set<string>();
      }
    })()
  );

  // Initialize service worker and permission check
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }

    registerServiceWorker();

    // Listen for PWA desktop install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('omni_alert_history', JSON.stringify(alerts.slice(0, 30)));
  }, [alerts]);

  const saveNotifiedSet = useCallback(() => {
    try {
      localStorage.setItem('omni_notified_reminders', JSON.stringify(Array.from(notifiedRemindersRef.current)));
    } catch {}
  }, []);

  const requestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      triggerDesktopNotification(
        '🔔 OMNI Notifications Enabled',
        'You will now receive desktop alerts for upcoming events and deadlines.',
        'omni-welcome'
      );
    }
  };

  const installApp = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const choiceResult = await deferredPromptRef.current.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      deferredPromptRef.current = null;
    }
  };

  const addAlert = useCallback((alert: Omit<OmniAlert, 'id' | 'read'>) => {
    const newAlert: OmniAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const testNotification = () => {
    if (soundEnabled) {
      playNotificationChime();
    }
    triggerDesktopNotification(
      '🔔 Test Notification — OMNI Time',
      'Desktop alerts and sound chimes are working perfectly!',
      'test-notification'
    );
    addAlert({
      itemId: 'test',
      title: 'Test Notification',
      message: 'Desktop alerts and sound chimes verified.',
      time: format(new Date(), 'h:mm a'),
      type: 'event'
    });
  };

  const markAlertsAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  // Periodic Reminder Checker
  const checkReminders = useCallback((items: OmniAgendaItem[]) => {
    const now = new Date().getTime();

    items.forEach(item => {
      try {
        const startTime = parseISO(item.startTime).getTime();
        const diffMinutes = Math.round((startTime - now) / (60 * 1000));

        const key10m = `${item.id}-10m`;
        const keyStart = `${item.id}-start`;

        // 10-Minute Pre-Alert (between 7 and 10 minutes)
        if (diffMinutes >= 7 && diffMinutes <= 10) {
          if (!notifiedRemindersRef.current.has(key10m)) {
            notifiedRemindersRef.current.add(key10m);
            saveNotifiedSet();

            const isTask = item.type === 'task';
            const alertTitle = isTask ? `⏰ Task Due in 10m: ${item.title}` : `📅 Upcoming Event in 10m: ${item.title}`;
            const alertBody = `Scheduled for ${format(parseISO(item.startTime), 'h:mm a')}.`;

            if (soundEnabled) playNotificationChime();
            triggerDesktopNotification(alertTitle, alertBody, key10m);

            addAlert({
              itemId: item.id,
              title: alertTitle,
              message: alertBody,
              time: format(new Date(), 'h:mm a'),
              type: item.type
            });
          }
        }

        // Start Time Alert (between -1 and 2 minutes)
        if (diffMinutes >= -1 && diffMinutes <= 2) {
          if (!notifiedRemindersRef.current.has(keyStart)) {
            notifiedRemindersRef.current.add(keyStart);
            saveNotifiedSet();

            const isTask = item.type === 'task';
            const alertTitle = isTask ? `✅ Task Deadline Now: ${item.title}` : `🔔 Event Starting Now: ${item.title}`;
            const alertBody = item.description || `Scheduled at ${format(parseISO(item.startTime), 'h:mm a')}`;

            if (soundEnabled) playNotificationChime();
            triggerDesktopNotification(alertTitle, alertBody, keyStart);

            addAlert({
              itemId: item.id,
              title: alertTitle,
              message: alertBody,
              time: format(new Date(), 'h:mm a'),
              type: item.type
            });
          }
        }
      } catch {}
    });
  }, [soundEnabled, addAlert, saveNotifiedSet]);

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <NotificationContext.Provider
      value={{
        permission,
        soundEnabled,
        setSoundEnabled,
        isInstallable,
        installApp,
        requestPermission,
        alerts,
        unreadCount,
        markAlertsAsRead,
        clearAlerts,
        testNotification,
        checkReminders
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
