import React, { useRef, useEffect } from 'react';
import { useOmni } from '../../context/OmniContext';
import { HOURS, format, isSameDay, parseISO, isToday } from '../../utils/dateUtils';
import { Layers, Paperclip } from 'lucide-react';
import { OmniAgendaItem, TimeSlotSelection } from '../../types';

export const DayView: React.FC = () => {
  const { 
    currentDate, 
    items, 
    categories, 
    openNewModal, 
    openEditModal 
  } = useOmni();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 8 * 64; // 8 AM
    }
  }, []);

  const activeCategoryIds = new Set(categories.filter(c => c.active).map(c => c.id));

  const formatHourLabel = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  // Filter items for the day and active categories
  const dayItems = items.filter(e => {
    try {
      const eventStart = parseISO(e.startTime);
      return isSameDay(eventStart, currentDate) && activeCategoryIds.has(e.category);
    } catch {
      return false;
    }
  });

  const handleSlotClick = (hour: number) => {
    const hour24 = hour;
    const nextHour24 = (hour + 1) % 24;
    const startTime = `${hour24.toString().padStart(2, '0')}:00`;
    const endTime = `${nextHour24.toString().padStart(2, '0')}:00`;
    const displayTime = formatHourLabel(hour24);
    const dateStr = format(currentDate, 'yyyy-MM-dd');

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
    const duration = Math.max(30, endMinutes - startMinutes);

    const top = (startMinutes / 60) * 64;
    const height = (duration / 60) * 64;

    return { top, height };
  };

  const isCurrentDay = isToday(currentDate);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutes / 60) * 64;

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto h-full relative select-none bg-[#171A2B] pb-24">
      <div className="relative min-w-[600px]">
        {/* Pixel-Perfect Rows: Each hour row contains both the label and the slot box */}
        {HOURS.map(hour => {
          const displayLabel = formatHourLabel(hour);
          return (
            <div key={hour} className="flex h-16 border-b border-white/[0.04] relative group/row">
              {/* Hour Label: Exactly centered on the horizontal dividing line with -translate-y-1/2 */}
              <div className="w-24 shrink-0 border-r border-white/5 pr-4 text-right select-none relative">
                <span className="absolute top-0 right-4 -translate-y-1/2 text-[11px] font-mono text-slate-400 group-hover/row:text-slate-200 transition-colors">
                  {displayLabel}
                </span>
              </div>

              {/* Clickable slot box */}
              <div 
                onClick={() => handleSlotClick(hour)}
                title={`Click to schedule at ${displayLabel}`}
                className="flex-1 hover:bg-purple-500/[0.06] transition-all cursor-pointer relative flex items-center pl-4 group/slot"
              >
                <span className="opacity-0 group-hover/slot:opacity-100 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-[10px] font-mono text-purple-200 pointer-events-none transition-opacity shadow-sm">
                  + Schedule at {displayLabel}
                </span>
              </div>
            </div>
          );
        })}

        {/* Current Time Indicator Bar */}
        {isCurrentDay && (
          <div 
            className="absolute left-24 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: `${currentTimeTop}px` }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20 -ml-1.5" />
            <div className="h-[2px] flex-1 bg-rose-500/80 shadow-sm shadow-rose-500" />
          </div>
        )}

        {/* Render Agenda Items */}
        <div className="absolute top-0 left-24 right-4 pointer-events-none">
          {dayItems.map(item => {
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
                  height: `${height - 3}px`,
                  backgroundColor: `${item.color}20`,
                  borderColor: `${item.color}80`,
                }}
                className={`absolute left-2 right-2 rounded-xl p-3 border shadow-md backdrop-blur-sm pointer-events-auto cursor-pointer hover:brightness-110 transition-all group overflow-hidden ${
                  item.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                      isTask 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {item.type}
                    </span>
                    <h4 className={`text-xs font-semibold text-white truncate ${
                      item.completed ? 'line-through text-slate-400' : ''
                    }`}>
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 shrink-0">
                    {format(parseISO(item.startTime), 'h:mm a')} – {format(parseISO(item.endTime), 'h:mm a')}
                  </span>
                </div>

                {item.description && (
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-1 leading-snug">
                    {item.description}
                  </p>
                )}

                {/* Attached Documents Tags */}
                {item.attachments && item.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.attachments.map(att => (
                      <div 
                        key={att.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.08] text-[10px] text-purple-200 border border-white/10"
                      >
                        <Paperclip className="w-2.5 h-2.5 text-purple-400" />
                        <span className="truncate">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {item.linkedResource && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md bg-white/[0.08] text-[10px] text-purple-300 border border-white/10">
                    <Layers className="w-3 h-3 text-purple-400" />
                    <span className="truncate">{item.linkedResource.title}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
