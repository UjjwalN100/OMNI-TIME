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
  Lock
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const NotificationPopover: React.FC = () => {
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
    <div className="relative shrink-0">
      {/* Bell Button in Navbar */}
      <button
        onClick={handleOpen}
        className="relative p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        title={isGuest ? 'Notifications disabled for Guest (Click to unlock)' : 'Notifications & Reminders'}
      >
        {isGuest ? (
          <div className="relative">
            <BellOff className="w-4 h-4 text-slate-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#0d131f]" />
          </div>
        ) : permission === 'granted' ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellRing className="w-4 h-4 text-amber-400" />
        )}
        {!isGuest && unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#0d131f] animate-pulse" />
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl p-4 z-50 border border-white/10 animate-in fade-in zoom-in-95 duration-100 bg-[#0e1422] text-slate-100 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Notifications</h4>
              </div>
              <div className="flex items-center gap-2">
                {!isGuest && alerts.length > 0 && (
                  <button
                    onClick={clearAlerts}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Clear notification history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* GUEST MODE LOCKED STATE */}
            {isGuest ? (
              <div className="py-5 text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <h5 className="text-xs font-bold text-white mb-1">Notifications Locked for Guests</h5>
                <p className="text-[11px] text-slate-400 max-w-[260px] leading-relaxed mb-4">
                  Reminder chimes, 10-minute pre-alerts, and desktop notifications require a Google account.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-[0.99]"
                >
                  Sign In with Google to Unlock
                </button>
              </div>
            ) : (
              <>
                {/* Permission & Sound Controls */}
                <div className="py-3 border-b border-white/5 space-y-2 shrink-0">
                  {permission !== 'granted' ? (
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                      <p className="text-slate-300 font-medium mb-1.5">Desktop Alerts are disabled</p>
                      <button
                        onClick={requestPermission}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-sm"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Enable Desktop Alerts</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-medium">
                        <CheckCheck className="w-4 h-4" />
                        <span>Desktop Alerts Active</span>
                      </div>
                      <button
                        onClick={testNotification}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/10 transition"
                      >
                        Test Alert
                      </button>
                    </div>
                  )}

                  {/* Sound & PWA Controls */}
                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      {soundEnabled ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Chimes: On</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                          <span>Chimes: Muted</span>
                        </>
                      )}
                    </button>

                    {isInstallable && (
                      <button
                        onClick={installApp}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition text-[11px] font-medium"
                      >
                        <Download className="w-3 h-3" />
                        <span>Install App</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification History List */}
                <div className="flex-1 overflow-y-auto py-2 space-y-1.5 text-xs">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
                    Recent Reminders
                  </div>
                  {alerts.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 italic text-[11px]">
                      No recent alerts. Upcoming events will notify you 10 minutes prior.
                    </div>
                  ) : (
                    alerts.map(a => (
                      <div
                        key={a.id}
                        className={`p-2.5 rounded-xl border transition-colors flex items-start gap-2.5 ${
                          a.read 
                            ? 'bg-white/[0.02] border-white/5 text-slate-400' 
                            : 'bg-white/[0.05] border-indigo-500/20 text-slate-200'
                        }`}
                      >
                        <div className="mt-0.5">
                          {a.type === 'task' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-white">{a.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">{a.message}</div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 shrink-0">{a.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
