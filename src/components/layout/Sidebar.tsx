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
  Keyboard
} from 'lucide-react';
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
    <aside className="w-64 border-r border-white/5 bg-[#0b101b] flex flex-col h-[calc(100vh-3.5rem)] select-none shrink-0 overflow-y-auto">
      {/* Mini Calendar Widget */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              {format(miniCalMonth, 'MMMM yyyy')}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] text-indigo-300 font-medium">
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
                    ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 ring-offset-1 ring-offset-[#0b101b] shadow-md shadow-indigo-500/40'
                    : isCurrentDay
                    ? 'bg-indigo-500/20 text-indigo-300 font-bold border-2 border-indigo-400 shadow-sm shadow-indigo-500/30 hover:bg-indigo-500/30'
                    : isSelected
                    ? 'bg-white/20 text-white font-semibold'
                    : isCurrentMonth
                    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <span className="leading-none">{format(day, 'd')}</span>
                {isCurrentDay && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'} mt-0.5`} />
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
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Linked Space Docs</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="group flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-slate-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">OMNI Ecosystem v1 Arch</span>
              </div>
              <span className="text-[9px] text-indigo-400/80 font-mono shrink-0">9:00 AM</span>
            </div>

            <div className="group flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-slate-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 truncate">
                <FileSpreadsheet className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="truncate">Zero-Cost Cloud Topology</span>
              </div>
              <span className="text-[9px] text-pink-400/80 font-mono shrink-0">3:00 PM</span>
            </div>
          </div>
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
