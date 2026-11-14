import React from 'react';
import { useOmni } from '../../context/OmniContext';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';

export const CalendarView: React.FC = () => {
  const { viewMode } = useOmni();

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden relative">
      {viewMode === 'day' && <DayView />}
      {viewMode === 'week' && <WeekView />}
      {viewMode === 'month' && <MonthView />}
    </main>
  );
};
