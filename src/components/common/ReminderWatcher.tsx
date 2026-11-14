import React, { useEffect } from 'react';
import { useOmni } from '../../context/OmniContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const ReminderWatcher: React.FC = () => {
  const { items } = useOmni();
  const { checkReminders } = useNotification();
  const { isGuest, user } = useAuth();

  useEffect(() => {
    // Strictly disable all notifications for guest users
    if (isGuest || !user) {
      return;
    }

    // Check reminders immediately upon load/item change
    checkReminders(items);

    // Periodically verify reminders every 20 seconds
    const interval = setInterval(() => {
      checkReminders(items);
    }, 20000);

    return () => clearInterval(interval);
  }, [items, checkReminders, isGuest, user]);

  return null;
};
