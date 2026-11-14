import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { OmniProvider } from './context/OmniContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightPanel } from './components/layout/RightPanel';
import { CalendarView } from './components/calendar/CalendarView';
import { EventModal } from './components/modal/EventModal';
import { CommandPalette } from './components/modal/CommandPalette';
import { AuthModal } from './components/modal/AuthModal';

function AppContent() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 antialiased select-none">
      <Navbar />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <CalendarView />
        <RightPanel />
      </div>
      <EventModal />
      <CommandPalette />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OmniProvider>
        <AppContent />
      </OmniProvider>
    </AuthProvider>
  );
}
