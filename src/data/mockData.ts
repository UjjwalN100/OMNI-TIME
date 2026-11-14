import { OmniAgendaItem, CategoryFilter, AttachedDoc } from '../types';

export const EVENT_BLUE = '#3b82f6';
export const TASK_GREEN = '#10b981';

export const INITIAL_CATEGORIES: CategoryFilter[] = [
  { id: 'work', label: 'Work', color: '#38bdf8', bgLight: 'rgba(56, 189, 248, 0.15)', active: true },
  { id: 'focus', label: 'Deep Focus', color: '#7867D8', bgLight: 'rgba(120, 103, 216, 0.15)', active: true },
  { id: 'meeting', label: 'Meetings & Syncs', color: '#f472b6', bgLight: 'rgba(244, 114, 182, 0.15)', active: true },
  { id: 'personal', label: 'Personal', color: '#34d399', bgLight: 'rgba(52, 211, 153, 0.15)', active: true },
  { id: 'health', label: 'Health & Wellness', color: '#fbbf24', bgLight: 'rgba(251, 191, 36, 0.15)', active: true },
];

// Clean empty slate for all new users — no pre-defined mock agendas, tasks or files
export const INITIAL_DATE_ATTACHMENTS: Record<string, AttachedDoc[]> = {};

export const INITIAL_ITEMS: OmniAgendaItem[] = [];
