import React, { useState, useEffect } from 'react';
import { useOmni } from '../../context/OmniContext';
import { 
  getDaysInMonthMatrix, 
  format, 
  isSameDay, 
  isToday, 
  isSameMonth, 
  addMonths, 
  subMonths 
} from '../../utils/dateUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Layers, 
  FileText, 
  FileSpreadsheet, 
  Calendar as CalendarIcon,
  Keyboard,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EventCategory } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    currentDate, 
    setCurrentDate, 
    categories, 
    toggleCategory, 
    items,
    isSidebarOpen 
  } = useOmni();

  const { isGuest, setIsAuthModalOpen } = useAuth();

  const [miniCalMonth, setMiniCalMonth] = useState<Date>(currentDate);

  // Synchronize mini-calendar viewed month whenever the global currentDate changes (e.g. clicking Today)
  useEffect(() => {
    setMiniCalMonth(currentDate);
  }, [currentDate]);

  if (!isSidebarOpen) return null;

  const daysMatrix = getDaysInMonthMatrix(miniCalMonth);
  const todayDate = new Date();

  // Calculate event count per category
  const getCategoryCount = (catId: EventCategory) => {
    return items.filter(e => e.category === catId).length;
  };

  return (
    <aside className="w-64 border-r border-[var(--border-line)] bg-[var(--surface-bg)] flex flex-col h-[calc(100vh-3.5rem)] select-none shrink-0 overflow-y-auto transition-colors">
      {/* Mini Calendar Widget */}
      <div className="p-4 border-b border-[var(--border-line)]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              {format(miniCalMonth, 'MMMM yyyy')}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] text-purple-300 font-medium">
                Today: {format(todayDate, 'EEE, MMM d')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMiniCalMonth(prev => subMonths(prev, 1))}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMiniCalMonth(prev => addMonths(prev, 1))}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Day Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="py-0.5">{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysMatrix.map((day, idx) => {
            const isSelected = isSameDay(day, currentDate);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, miniCalMonth);

            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentDate(day);
                }}
                title={isCurrentDay ? `Today (${format(day, 'MMM d')})` : format(day, 'MMM d, yyyy')}
                className={`h-7 w-7 mx-auto rounded-full text-[11px] flex flex-col items-center justify-center transition-all relative ${
                  isCurrentDay && isSelected
                    ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-400 ring-offset-1 ring-offset-[#171A2B] shadow-md shadow-purple-500/40'
                    : isCurrentDay
                    ? 'bg-purple-500/20 text-purple-300 font-bold border-2 border-purple-400 shadow-sm shadow-purple-500/30 hover:bg-purple-500/30'
                    : isSelected
                    ? 'bg-white/20 text-white font-semibold'
                    : isCurrentMonth
                    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <span className="leading-none">{format(day, 'd')}</span>
                {isCurrentDay && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-400'} mt-0.5`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category / Scope Filters */}
      <div className="p-4 border-b border-white/5 flex-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Time Categories</span>
          </div>
          <span className="text-[10px] text-slate-400 lowercase">{categories.filter(c => c.active).length} visible</span>
        </div>

        <div className="space-y-1">
          {categories.map(cat => {
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  cat.active 
                    ? 'hover:bg-white/5 text-slate-200' 
                    : 'text-slate-500 line-through opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span 
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.label}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Connected OMNI Space Artifacts */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-purple-400" />
              <span>Linked Space Docs</span>
            </div>
            {isGuest && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                Locked
              </span>
            )}
          </div>
          {isGuest ? (
            <div 
              onClick={() => setIsAuthModalOpen(true)}
              className="p-2.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 text-xs text-slate-400 cursor-pointer hover:bg-amber-500/[0.08] transition"
            >
              <p className="text-[11px] text-amber-200/90 leading-relaxed mb-1.5">
                Connecting OMNI Space docs is locked for Guests.
              </p>
              <button
                type="button"
                className="text-[10px] text-purple-300 hover:text-white underline font-semibold"
              >
                Sign in with Google to connect
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="group flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-slate-300 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">OMNI Ecosystem v1 Arch</span>
                </div>
                <span className="text-[9px] text-purple-400/80 font-mono shrink-0">9:00 AM</span>
              </div>

              <div className="group flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-slate-300 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 truncate">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span className="truncate">Zero-Cost Cloud Topology</span>
                </div>
                <span className="text-[9px] text-pink-400/80 font-mono shrink-0">3:00 PM</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Hint Footer */}
      <div className="p-3 border-t border-white/5 bg-black/20 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Keyboard className="w-3.5 h-3.5 text-slate-400" />
          <span>Hotkeys:</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
          <span className="px-1 py-0.5 bg-white/5 rounded border border-white/10">T</span> Today
          <span className="px-1 py-0.5 bg-white/5 rounded border border-white/10">W</span> Week
          <span className="px-1 py-0.5 bg-white/5 rounded border border-white/10">C</span> New
        </div>
      </div>
    </aside>
  );
};
