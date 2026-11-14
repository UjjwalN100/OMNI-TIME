import React from 'react';
import { useOmni } from '../../context/OmniContext';
import { 
  getDaysInMonthMatrix, 
  format, 
  isSameDay, 
  isToday, 
  isSameMonth, 
  parseISO 
} from '../../utils/dateUtils';
import { OmniAgendaItem } from '../../types';

export const MonthView: React.FC = () => {
  const { 
    currentDate, 
    setCurrentDate, 
    setViewMode,
    items, 
    categories, 
    openNewModal, 
    openEditModal 
  } = useOmni();

  const daysMatrix = getDaysInMonthMatrix(currentDate);
  const activeCategoryIds = new Set(categories.filter(c => c.active).map(c => c.id));

  const filteredItems = items.filter(e => {
    try {
      return activeCategoryIds.has(e.category);
    } catch {
      return false;
    }
  });

  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
    setViewMode('day');
  };

  const handleAddOnDay = (e: React.MouseEvent, day: Date) => {
    e.stopPropagation();
    const dateStr = format(day, 'yyyy-MM-dd');

    openNewModal({
      date: dateStr,
      startTime: '09:00',
      endTime: '10:00',
      hour: 9,
      displayTime: '9:00 AM'
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--canvas-bg)] select-none overflow-hidden transition-colors">
      {/* Day Names Header */}
      <div className="grid grid-cols-7 border-b border-[var(--border-line)] bg-slate-100 dark:bg-[var(--surface-bg)]/90 text-center py-2 shrink-0">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(dayName => (
          <div key={dayName} className="text-xs font-bold text-slate-700 dark:text-slate-400 tracking-wider uppercase">
            {dayName}
          </div>
        ))}
      </div>

      {/* Month Days Matrix */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 divide-x divide-y divide-[var(--border-line)] overflow-hidden">
        {daysMatrix.slice(0, 35).map((day, idx) => {
          const isCurrent = isToday(day);
          const isCurrentMonthDay = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, currentDate);

          const dayItems = filteredItems.filter(e => isSameDay(parseISO(e.startTime), day));

          return (
            <div
              key={idx}
              onClick={() => handleDayClick(day)}
              className={`p-2 flex flex-col justify-between group cursor-pointer transition-colors relative ${
                isCurrentMonthDay ? 'bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-white/[0.02]' : 'bg-slate-100/70 text-slate-400 dark:bg-black/20 dark:text-slate-600'
              } ${isSelected ? 'bg-purple-50/50 dark:bg-white/[0.03]' : ''}`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                  isCurrent 
                    ? 'bg-purple-600 text-white ring-1 ring-purple-400' 
                    : isCurrentMonthDay 
                    ? 'text-slate-800 dark:text-slate-300' 
                    : 'text-slate-400 dark:text-slate-600'
                }`}>
                  {format(day, 'd')}
                </span>

                <button
                  onClick={(e) => handleAddOnDay(e, day)}
                  className="opacity-0 group-hover:opacity-100 text-[10px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-slate-200 transition-opacity font-semibold"
                >
                  + Add
                </button>
              </div>

              {/* Badges List */}
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayItems.slice(0, 3).map(item => (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(item);
                    }}
                    style={{
                      backgroundColor: `${item.color}25`,
                      borderLeftColor: item.color,
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold text-slate-900 dark:text-slate-200 border-l-2 truncate hover:brightness-110 transition-all ${
                      item.completed ? 'line-through opacity-60' : ''
                    }`}
                  >
                    <span className="font-mono text-slate-600 dark:text-slate-400 mr-1">
                      {format(parseISO(item.startTime), 'h:mm')}
                    </span>
                    {item.title}
                  </div>
                ))}

                {dayItems.length > 3 && (
                  <div className="text-[10px] text-slate-400 pl-1 font-mono">
                    +{dayItems.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
