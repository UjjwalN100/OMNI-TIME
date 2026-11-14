import React, { useState } from 'react';
import { 
  Bell, 
  BellRing, 
  BellOff,
  Volume2, 
  VolumeX, 
  CheckCheck, 
  Download, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Trash2,
  X,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const NotificationPopover: React.FC<{ variant?: 'navbar' | 'menu' }> = ({ variant = 'menu' }) => {
  const { 
    permission, 
    requestPermission, 
    soundEnabled, 
    setSoundEnabled, 
    isInstallable, 
    installApp, 
    alerts, 
    unreadCount, 
    markAlertsAsRead, 
    clearAlerts, 
    testNotification 
  } = useNotification();

  const { isGuest, setIsAuthModalOpen } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(prev => {
      const next = !prev;
      if (next && unreadCount > 0 && !isGuest) {
        markAlertsAsRead();
      }
      return next;
    });
  };

  return (
    <div className="w-full">
      {/* Menu Row Trigger */}
      <button
        onClick={handleOpen}
        type="button"
        className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-[var(--text-main)] hover:bg-white/[0.06] transition"
      >
        <div className="flex items-center gap-2">
          {isGuest ? (
            <BellOff className="w-4 h-4 text-slate-500" />
          ) : permission === 'granted' ? (
            <Bell className="w-4 h-4 text-purple-400" />
          ) : (
            <BellRing className="w-4 h-4 text-amber-400" />
          )}
          <span>Desktop Alerts & Chimes</span>
        </div>

        <div className="flex items-center gap-2">
          {isGuest ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 border border-amber-400 dark:border-amber-500/20 font-bold">
              Locked
            </span>
          ) : unreadCount > 0 ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-600 text-white font-bold">
              {unreadCount}
            </span>
          ) : (
            <span className="text-[10px] text-[var(--text-muted)] font-medium">
              {soundEnabled ? 'Chimes On' : 'Muted'}
            </span>
          )}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>

      {/* Inline Expanded Notification Content */}
      {isOpen && (
        <div className="mt-2 pt-2 border-t border-[var(--border-line)] space-y-2.5 animate-in fade-in duration-150">
          {/* Guest Mode Locked Banner */}
          {isGuest ? (
            <div 
              onClick={() => setIsAuthModalOpen(true)}
              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 text-center cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-500/15 transition shadow-xs"
            >
              <div className="flex items-center justify-center gap-1.5 text-amber-950 dark:text-amber-400 font-bold text-xs mb-1">
                <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Notifications Locked for Guests</span>
              </div>
              <p className="text-[11px] text-amber-900/80 dark:text-slate-400 mb-2 leading-relaxed font-medium">
                3-day advance reminders, 10-minute chimes, and deadline alerts require a Google account.
              </p>
              <span className="inline-block px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold shadow-xs">
                Sign In to Unlock
              </span>
            </div>
          ) : (
            <>
              {/* Permission & Sound Buttons */}
              <div className="space-y-2">
                {permission !== 'granted' ? (
                  <button
                    onClick={requestPermission}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Enable Desktop Alerts</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Desktop Alerts Active</span>
                    </div>
                    <button
                      onClick={testNotification}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-[var(--text-main)] transition"
                    >
                      Test Chime
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between px-1 text-xs">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Sound Chimes: Enabled</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sound Chimes: Muted</span>
                      </>
                    )}
                  </button>

                  {isInstallable && (
                    <button
                      onClick={installApp}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[10px] font-semibold"
                    >
                      <Download className="w-3 h-3" />
                      <span>Install PWA</span>
                    </button>
                  )}
                </div>

                {/* Reminder Timing Cadence */}
                <div className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-700 dark:text-purple-300 flex items-center justify-between font-medium">
                  <span>Alert Schedule:</span>
                  <span className="font-bold">3 Days Before • 10m • Start</span>
                </div>
              </div>

              {/* Recent Alerts List */}
              <div className="pt-2 border-t border-[var(--border-line)]">
                <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 px-1">
                  <span>Recent Reminders</span>
                  {alerts.length > 0 && (
                    <button
                      onClick={clearAlerts}
                      className="text-slate-400 hover:text-rose-400 transition"
                      title="Clear history"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {alerts.length === 0 ? (
                  <p className="text-[11px] text-[var(--text-muted)] italic text-center py-3">
                    No recent alerts.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {alerts.map(a => (
                      <div
                        key={a.id}
                        className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${
                          a.read 
                            ? 'bg-white/[0.02] border-[var(--border-line)] text-[var(--text-muted)]' 
                            : 'bg-purple-500/10 border-purple-500/30 text-[var(--text-main)]'
                        }`}
                      >
                        {a.type === 'task' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{a.title}</p>
                          <p className="text-[10px] text-[var(--text-muted)] truncate">{a.message}</p>
                        </div>
                        <span className="text-[9px] font-mono text-[var(--text-muted)] shrink-0">{a.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
