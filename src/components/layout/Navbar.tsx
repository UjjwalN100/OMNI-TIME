import React, { useState } from 'react';
import { useOmni } from '../../context/OmniContext';
import { useAuth } from '../../context/AuthContext';
import { format } from '../../utils/dateUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Search, 
  Plus, 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  Layers,
  Sparkles,
  FolderKanban,
  Clock,
  Home,
  CheckCircle2,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { OmniModule } from '../../types';

export const Navbar: React.FC = () => {
  const { 
    currentDate, 
    viewMode, 
    setViewMode, 
    navigateToday, 
    navigateNext, 
    navigatePrev,
    openNewModal,
    setIsCommandPaletteOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    isRightPanelOpen,
    setIsRightPanelOpen
  } = useOmni();

  const { user, setIsAuthModalOpen, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEcosystemMenuOpen, setIsEcosystemMenuOpen] = useState(false);

  const ecosystemApps: { id: OmniModule; name: string; icon: any; status: 'active' | 'coming_soon' | 'paused' }[] = [
    { id: 'time', name: 'OMNI Time', icon: Clock, status: 'active' },
    { id: 'home', name: 'OMNI Home', icon: Home, status: 'coming_soon' },
    { id: 'space', name: 'OMNI Space', icon: Layers, status: 'coming_soon' },
    { id: 'intelligence', name: 'OMNI Intelligence', icon: Sparkles, status: 'coming_soon' },
    { id: 'flow', name: 'OMNI Flow', icon: FolderKanban, status: 'paused' }
  ];

  return (
    <header className="h-14 border-b border-white/5 bg-[#0d131f]/80 backdrop-blur-md px-4 flex items-center justify-between select-none relative z-30">
      {/* Left section: OMNI Branding & Module Switcher */}
      <div className="flex items-center gap-3">
        {/* Toggle Left Sidebar */}
        <button 
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          title="Toggle Sidebar ( [ )"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        {/* Ecosystem Brand Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsEcosystemMenuOpen(prev => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all group"
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-sm shadow-indigo-500/20">
              <Clock className="w-3 h-3 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-xs tracking-wider uppercase text-indigo-400">OMNI</span>
              <span className="font-medium text-sm text-slate-200">Time</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
          </button>

          {/* Ecosystem Popover */}
          {isEcosystemMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsEcosystemMenuOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl p-2 z-50 border border-white/10 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  OMNI Ecosystem Products
                </div>
                <div className="space-y-1 mt-1">
                  {ecosystemApps.map(app => {
                    const Icon = app.icon;
                    const isActive = app.id === 'time';
                    return (
                      <div
                        key={app.id}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                          isActive 
                            ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-medium' 
                            : 'text-slate-300 hover:bg-white/5 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (isActive) setIsEcosystemMenuOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                          <span>{app.name}</span>
                        </div>
                        {isActive ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-medium">Active</span>
                        ) : app.status === 'coming_soon' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">Connected</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">On hold</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 px-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Single Unified Account</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-1.5 ml-3 border-l border-white/5 pl-4">
          <button
            onClick={navigateToday}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              onClick={navigatePrev}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              title="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={navigateNext}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              title="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-semibold text-slate-100 ml-1">
            {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Middle section: Global Search & Quick Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-slate-400 hover:text-slate-200 text-xs transition-colors w-60"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="flex-1 text-left">Search events, spaces, docs...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded text-slate-300 font-mono">Ctrl K</kbd>
        </button>
      </div>

      {/* Right section: View Switcher, New Event & Right Toggle */}
      <div className="flex items-center gap-3">
        {/* View Mode Pills */}
        <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/5">
          {(['day', 'week', 'month'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                viewMode === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Create Event / Task Button */}
        <button
          onClick={() => openNewModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
          <kbd className="ml-1 text-[10px] text-indigo-200/70 font-mono">C</kbd>
        </button>

        {/* User Authentication Pill / Avatar */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl shadow-2xl p-2 z-50 border border-white/10 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-medium text-white truncate mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-medium transition-all"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>Sign In</span>
          </button>
        )}

        {/* Toggle Right Panel */}
        <button 
          onClick={() => setIsRightPanelOpen(prev => !prev)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors border-l border-white/5 pl-3"
          title="Toggle Daily Agenda ( ] )"
        >
          {isRightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
