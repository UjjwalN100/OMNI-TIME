/**
 * OMNI Time Notification & Audio Chime Engine
 * 100% Client-side, zero external assets, zero cost.
 */

// Soft, elegant modern chime synthesized using the Web Audio API
export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Harmonic Note 2: B5 (987.77 Hz) - played with slight offset
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.08);
    gain2.gain.setValueAtTime(0.15, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.debug('Audio chime playback omitted or blocked by browser policy:', err);
  }
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      return reg;
    } catch (err) {
      console.warn('Service Worker registration failed:', err);
      return null;
    }
  }
  return null;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  const result = await Notification.requestPermission();
  return result;
};

export const triggerDesktopNotification = async (title: string, body: string, tag?: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Play audio chime
  playNotificationChime();

  // Prefer ServiceWorker showNotification if available (survives background tabs)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: tag || 'omni-reminder',
          data: { url: '/' }
        });
        return;
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback to standard window Notification
  try {
    new Notification(title, {
      body,
      icon: '/icon.svg',
      tag: tag || 'omni-reminder'
    });
  } catch (err) {
    console.debug('Native Notification dispatch error:', err);
  }
};
