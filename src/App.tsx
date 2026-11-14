import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OmniProvider } from './context/OmniContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightPanel } from './components/layout/RightPanel';
import { CalendarView } from './components/calendar/CalendarView';
import { EventModal } from './components/modal/EventModal';
import { CommandPalette } from './components/modal/CommandPalette';
import { AuthModal } from './components/modal/AuthModal';
import { ReminderWatcher } from './components/common/ReminderWatcher';
import { WelcomeGateway } from './components/auth/WelcomeGateway';
import { Clock } from 'lucide-react';

function AppContent() {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#171A2B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-purple-400 flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/25">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">Loading OMNI...</span>
        </div>
      </div>
    );
  }

  // If not logged in and not guest, gate with the Welcome Gateway!
  if (!user && !isGuest) {
    return <WelcomeGateway />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--canvas-bg)] text-[var(--text-main)] antialiased select-none transition-colors">
      <Navbar />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <CalendarView />
        <RightPanel />
      </div>
      <EventModal />
      <CommandPalette />
      <AuthModal />
      <ReminderWatcher />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OmniProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </OmniProvider>
    </AuthProvider>
  );
}
