import React, { useEffect } from 'react';
import { useOmni } from '../../context/OmniContext';
import { useNotification } from '../../context/NotificationContext';

export const ReminderWatcher: React.FC = () => {
  const { items } = useOmni();
  const { checkReminders } = useNotification();

  useEffect(() => {
    // Check reminders immediately upon load/item change
    checkReminders(items);

    // Periodically verify reminders every 20 seconds
    const interval = setInterval(() => {
      checkReminders(items);
    }, 20000);

    return () => clearInterval(interval);
  }, [items, checkReminders]);

  return null;
};
