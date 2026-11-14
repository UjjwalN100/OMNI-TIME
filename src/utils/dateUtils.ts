import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addDays, 
  subDays, 
  addWeeks, 
  subWeeks, 
  addMonths, 
  subMonths,
  parseISO,
  isSameMonth
} from 'date-fns';

export {
  format,
  isSameDay,
  isToday,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  parseISO,
  isSameMonth
};

// Returns all days in the week containing the given date (Monday through Sunday)
export function getDaysInWeek(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

// Returns full 35 or 42 day matrix for a month view
export function getDaysInMonthMatrix(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const start = startOfWeek(monthStart, { weekStartsOn: 1 });
  const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

// Hourly breakdown: 0 through 23
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function formatTimeRange(startIso: string, endIso: string): string {
  try {
    const start = parseISO(startIso);
    const end = parseISO(endIso);
    return `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
  } catch {
    return '';
  }
}

export function getEventDurationMinutes(startIso: string, endIso: string): number {
  try {
    const s = new Date(startIso).getTime();
    const e = new Date(endIso).getTime();
    return Math.max(15, Math.round((e - s) / (1000 * 60)));
  } catch {
    return 60;
  }
}
