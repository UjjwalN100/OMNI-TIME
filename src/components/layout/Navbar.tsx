import React, { useState } from 'react';
import { useOmni } from '../../context/OmniContext';
import { useAuth } from '../../context/AuthContext';
import { format } from '../../utils/dateUtils';
import { 
  Menu,
  Sun,
  Moon,
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
  LogOut,
  Lock,
  X,
  Bell
} from 'lucide-react';
import { OmniModule } from '../../types';
import { NotificationPopover } from './NotificationPopover';

export const Navbar: React.FC = () => {
  const { 
    theme,
    toggleTheme,
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

  const { user, isGuest, setIsAuthModalOpen, signOut } = useAuth();
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const ecosystemApps: { id: OmniModule; name: string; icon: any; status: 'active' | 'coming_soon' | 'paused' }[] = [
    { id: 'time', name: 'OMNI Time', icon: Clock, status: 'active' },
    { id: 'home', name: 'OMNI Home', icon: Home, status: 'coming_soon' },
    { id: 'space', name: 'OMNI Space', icon: Layers, status: 'coming_soon' },
    { id: 'intelligence', name: 'OMNI Intelligence', icon: Sparkles, status: 'coming_soon' },
    { id: 'flow', name: 'OMNI Flow', icon: FolderKanban, status: 'paused' }
  ];

  return (
    <header className="h-14 border-b border-[var(--border-line)] bg-[var(--header-bg)] backdrop-blur-md px-3 sm:px-4 flex items-center justify-between select-none relative z-30 transition-colors">
      {/* Left section: Left Sidebar Toggle, 3-Line Menu Bar Button, Brand Badge */}
      <div className="flex items-center gap-2">
        {/* Toggle Left Sidebar */}
        <button 
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="p-1.5 text-slate-400 hover:text-[var(--text-main)] hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors"
          title="Toggle Sidebar ( [ )"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        {/* THREE-LINE MENU BAR BUTTON (HAMBURGER) */}
        <button
          onClick={() => setIsMainMenuOpen(prev => !prev)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
            isMainMenuOpen 
              ? 'bg-purple-600/20 text-purple-400 border-purple-500/40 ring-2 ring-purple-500/20' 
              : 'text-[var(--text-main)] bg-white/[0.04] hover:bg-white/[0.08] border-[var(--border-line)]'
          }`}
          title="Open OMNI Menu"
        >
          <Menu className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold hidden sm:inline">Menu</span>
        </button>

        {/* Clean OMNI Brand Badge */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center shadow-sm shadow-purple-500/25">
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-xs tracking-wider uppercase text-purple-400">OMNI</span>
            <span className="font-medium text-sm text-[var(--text-main)]">Time</span>
          </div>
        </div>
      </div>

      {/* Right section: ONLY Guest / Sign In and Toggle Right Sidebar */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* User Authentication Pill / Avatar / Guest State */}
        {user ? (
          <div className="relative shrink-0">
            <button
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 p-1 pr-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition shadow-sm"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs text-[var(--text-main)] font-medium max-w-[110px] truncate hidden sm:inline">
                {user.email?.split('@')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl shadow-2xl p-2 z-50 border border-[var(--border-line)] animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-[var(--border-line)]">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-medium text-[var(--text-main)] truncate mt-0.5">{user.email}</p>
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
        ) : isGuest ? (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-400 dark:border-amber-500/25 text-amber-900 dark:text-amber-300 text-[11px] font-bold shadow-sm">
              <Lock className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>Guest</span>
            </span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Toggle Right Panel (Daily Agenda) */}
        <button 
          onClick={() => setIsRightPanelOpen(prev => !prev)}
          className="p-1.5 text-slate-400 hover:text-[var(--text-main)] hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors border-l border-[var(--border-line)] pl-2.5 sm:pl-3"
          title="Toggle Daily Agenda ( ] )"
        >
          {isRightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>

      {/* THREE-LINE MENU BAR FLYOUT DRAWER / MODAL */}
      {isMainMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-100" 
            onClick={() => setIsMainMenuOpen(false)} 
          />
          <div className="absolute top-14 left-2 sm:left-4 mt-1.5 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl p-4 z-50 border border-[var(--border-line)] animate-in fade-in zoom-in-95 duration-150 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            {/* Top Bar of Menu */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-line)] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-sm shadow-purple-600/30">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">OMNI Workspace</h4>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">{format(currentDate, 'EEEE, MMM d, yyyy')}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMainMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-[var(--text-main)] rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SECTION 1: THEME TOGGLE (DARK / LIGHT VERSION) */}
            <div className="mb-3 p-2.5 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] light:bg-slate-100 border border-[var(--border-line)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-purple-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <div>
                  <span className="text-xs font-semibold text-[var(--text-main)] block">
                    {theme === 'dark' ? 'Dark Version (Midnight Navy)' : 'Light Version (Soft White)'}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {theme === 'dark' ? 'Deep focus palette' : 'Clean high-contrast palette'}
                  </span>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-sm shadow-purple-600/30"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            {/* SECTION 2: CALENDAR VIEW SWITCHER */}
            <div className="mb-3">
              <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase block mb-1.5 px-1">
                Calendar View Mode
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.03] dark:bg-white/[0.03] light:bg-slate-100 border border-[var(--border-line)]">
                {(['day', 'week', 'month'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      setIsMainMenuOpen(false);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                      viewMode === mode
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
                    }`}
                  >
                    {mode} View
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 3: DATE JUMP & NAVIGATION */}
            <div className="mb-3 p-2.5 rounded-xl bg-white/[0.03] dark:bg-white/[0.03] light:bg-slate-100 border border-[var(--border-line)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-main)]">
                  {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
                </span>
                <button
                  onClick={() => {
                    navigateToday();
                    setIsMainMenuOpen(false);
                  }}
                  className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 transition"
                >
                  Jump to Today
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={navigatePrev}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-[var(--text-main)] border border-[var(--border-line)] transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={navigateNext}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-[var(--text-main)] border border-[var(--border-line)] transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SECTION 4: QUICK ACTIONS (+ New & Search) */}
            <div className="space-y-1.5 mb-3">
              <button
                onClick={() => {
                  setIsMainMenuOpen(false);
                  openNewModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Schedule Agenda Item</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono">C</kbd>
              </button>

              <button
                onClick={() => {
                  setIsMainMenuOpen(false);
                  setIsCommandPaletteOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[var(--border-line)] text-xs text-[var(--text-main)] transition"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-purple-400" />
                  <span>Search events & docs...</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded font-mono text-[var(--text-muted)]">Ctrl K</kbd>
              </button>
            </div>

            {/* SECTION 5: NOTIFICATIONS CENTER */}
            <div className="mb-3 pt-2 border-t border-[var(--border-line)]">
              <div className="px-1 py-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Notifications & Reminders
              </div>
              <div className="p-1 rounded-xl bg-white/[0.02] border border-[var(--border-line)]">
                <NotificationPopover />
              </div>
            </div>

            {/* SECTION 6: OMNI ECOSYSTEM MODULES */}
            <div className="pt-2 border-t border-[var(--border-line)]">
              <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase block mb-1.5 px-1">
                OMNI Ecosystem
              </span>
              <div className="space-y-1">
                {ecosystemApps.map(app => {
                  const Icon = app.icon;
                  const isActive = app.id === 'time';
                  return (
                    <div
                      key={app.id}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                        isActive 
                          ? 'bg-purple-500/20 text-purple-400 dark:text-purple-300 light:text-purple-700 border border-purple-500/30 font-semibold' 
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                        <span>{app.name}</span>
                      </div>
                      {isActive ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 dark:text-purple-300 light:text-purple-700 font-semibold">Active</span>
                      ) : isGuest ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 font-bold flex items-center gap-1 border border-amber-400 dark:border-amber-500/20">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">Connected</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
