import React, { useRef, useEffect } from 'react';
import { useOmni } from '../../context/OmniContext';
import { 
  getDaysInWeek, 
  HOURS, 
  format, 
  isSameDay, 
  isToday, 
  parseISO 
} from '../../utils/dateUtils';
import { Layers, Paperclip } from 'lucide-react';
import { OmniAgendaItem, TimeSlotSelection } from '../../types';

export const WeekView: React.FC = () => {
  const { 
    currentDate, 
    setCurrentDate,
    items, 
    categories, 
    openNewModal, 
    openEditModal 
  } = useOmni();

  const containerRef = useRef<HTMLDivElement>(null);
  const weekDays = getDaysInWeek(currentDate);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 8 * 60; // 8 AM
    }
  }, []);

  const activeCategoryIds = new Set(categories.filter(c => c.active).map(c => c.id));

  // Filter items for this week and active categories
  const weekItems = items.filter(e => {
    try {
      const eventStart = parseISO(e.startTime);
      return weekDays.some(day => isSameDay(eventStart, day)) && activeCategoryIds.has(e.category);
    } catch {
      return false;
    }
  });

  const formatHourLabel = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const handleSlotClick = (day: Date, hour: number) => {
    const hour24 = hour;
    const nextHour24 = (hour + 1) % 24;
    const startTime = `${hour24.toString().padStart(2, '0')}:00`;
    const endTime = `${nextHour24.toString().padStart(2, '0')}:00`;
    const displayTime = formatHourLabel(hour24);
    const dateStr = format(day, 'yyyy-MM-dd');

    setCurrentDate(day);

    const slotSelection: TimeSlotSelection = {
      date: dateStr,
      startTime,
      endTime,
      hour: hour24,
      displayTime
    };

    openNewModal(slotSelection);
  };

  const getItemPosition = (item: OmniAgendaItem) => {
    const start = parseISO(item.startTime);
    const end = parseISO(item.endTime);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = Math.max(25, endMinutes - startMinutes);

    // 1 hour = 60px -> 1 minute = 1px exactly
    const top = startMinutes;
    const height = duration;

    return { top, height };
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = currentMinutes; // exactly 1px per minute

  return (
    <div className="flex-1 flex flex-col h-full select-none bg-[var(--canvas-bg)] overflow-hidden transition-colors">
      {/* Sticky Day Column Headers */}
      <div className="flex border-b border-[var(--border-line)] bg-[var(--surface-bg)]/95 backdrop-blur-md z-30 shrink-0">
        {/* Exact width matching time column: w-20 */}
        <div className="w-20 shrink-0 border-r border-[var(--border-line)]" />
        <div className="flex-1 grid grid-cols-7 divide-x divide-[var(--border-line)]">
          {weekDays.map((day, idx) => {
            const isCurrent = isToday(day);
            const isSelected = isSameDay(day, currentDate);

            return (
              <div 
                key={idx}
                onClick={() => setCurrentDate(day)}
                className={`py-2.5 px-1 text-center cursor-pointer transition-colors ${
                  isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className={`text-[11px] font-medium tracking-wide uppercase ${
                  isCurrent ? 'text-purple-400 font-bold' : 'text-slate-400'
                }`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`inline-flex items-center justify-center w-7 h-7 mt-0.5 rounded-full text-xs font-semibold ${
                  isCurrent 
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-2 ring-purple-400' 
                    : isSelected
                    ? 'border border-purple-400/50 text-purple-300'
                    : 'text-slate-300'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Scrollable Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative pb-24">
        <div className="relative min-h-[1440px]">
          {/* Synchronized Row-Locked Architecture: Every hour has an exact 60px row spanning both label & slots */}
          {HOURS.map(hour => {
            const displayLabel = formatHourLabel(hour);
            return (
              <div 
                key={hour} 
                className="flex h-[60px] border-b border-[var(--border-line)] relative group/row"
              >
                {/* Time Label Column: Exactly positioned without any cumulative drift */}
                <div className="w-20 shrink-0 border-r border-[var(--border-line)] pr-3 text-right select-none relative">
                  <span className="absolute top-0 right-3 -translate-y-1/2 text-[10px] font-mono text-slate-400 group-hover/row:text-slate-200 transition-colors">
                    {displayLabel}
                  </span>
                </div>

                {/* 7 Day Slot Boxes for THIS Exact Hour */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-[var(--border-line)]">
                  {weekDays.map((day, colIdx) => (
                    <div
                      key={colIdx}
                      onClick={() => handleSlotClick(day, hour)}
                      title={`Click to schedule at ${displayLabel}`}
                      className="h-full hover:bg-purple-500/[0.06] transition-all cursor-pointer group/slot relative"
                    >
                      {/* Subtle hover pill showing the exact hour of this box */}
                      <span className="opacity-0 group-hover/slot:opacity-100 absolute left-2 top-1 px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-[9px] font-mono text-purple-200 pointer-events-none transition-opacity shadow-sm z-10">
                        + {displayLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Absolute Overlay for Events & Current Time Indicator */}
          <div className="absolute top-0 bottom-0 left-20 right-0 pointer-events-none">
            <div className="h-full grid grid-cols-7 divide-x divide-transparent relative">
              {weekDays.map((day, colIdx) => {
                const isCurrent = isToday(day);
                const dayColumnItems = weekItems.filter(e => isSameDay(parseISO(e.startTime), day));

                return (
                  <div key={colIdx} className="relative h-full">
                    {/* Current Time Bar across today's column */}
                    {isCurrent && (
                      <div 
                        className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                        style={{ top: `${currentTimeTop}px` }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20 -ml-1.5" />
                        <div className="h-[2px] flex-1 bg-rose-500 shadow-sm shadow-rose-500" />
                      </div>
                    )}

                    {/* Events rendered with exact pixel offsets */}
                    {dayColumnItems.map(item => {
                      const { top, height } = getItemPosition(item);
                      const isTask = item.type === 'task';
                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(item);
                          }}
                          style={{
                            top: `${top}px`,
                            height: `${height - 2}px`,
                            backgroundColor: `${item.color}22`,
                            borderColor: `${item.color}85`,
                          }}
                          className={`absolute inset-x-1 rounded-lg p-2 border shadow-md backdrop-blur-sm pointer-events-auto cursor-pointer hover:brightness-125 transition-all overflow-hidden group ${
                            item.completed ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-start gap-1.5" title={item.title}>
                            <span 
                              className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" 
                              style={{ backgroundColor: item.color }} 
                            />
                            <div className={`text-[11px] font-semibold text-white line-clamp-2 leading-tight group-hover:text-purple-200 ${
                              item.completed ? 'line-through text-slate-400' : ''
                            }`}>
                              {item.title}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 mt-1 truncate">
                            <span>{format(parseISO(item.startTime), 'h:mm a')}</span>
                            <span className={`text-[8px] px-1 rounded uppercase font-bold ${
                              isTask ? 'text-emerald-300 bg-emerald-500/20' : 'text-blue-300 bg-blue-500/20'
                            }`}>
                              {item.type}
                            </span>
                          </div>

                          {/* Attachments Indicator on Card */}
                          {item.attachments && item.attachments.length > 0 && height > 40 && (
                            <div className="flex items-center gap-1 mt-1 text-[9px] text-purple-200 truncate">
                              <Paperclip className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                              <span className="truncate">{item.attachments[0].name}</span>
                              {item.attachments.length > 1 && (
                                <span className="text-[8px] text-slate-400 font-mono">+{item.attachments.length - 1}</span>
                              )}
                            </div>
                          )}

                          {item.linkedResource && height > 60 && (
                            <div className="flex items-center gap-1 mt-1 text-[9px] text-purple-300 truncate">
                              <Layers className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{item.linkedResource.title}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
