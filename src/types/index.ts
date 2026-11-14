export type OmniModule = 'home' | 'space' | 'time' | 'intelligence' | 'flow';

export type AgendaItemType = 'event' | 'task';

export type EventCategory = 'work' | 'focus' | 'meeting' | 'personal' | 'health';

export interface AttachedDoc {
  id: string;
  name: string;
  size?: string;
  type: 'pdf' | 'doc' | 'sheet' | 'image' | 'link' | 'space';
  url?: string;
  source: 'local' | 'omni_space';
  uploadedAt: string;
}

export interface LinkedResource {
  module: 'space' | 'flow' | 'home';
  type: 'doc' | 'note' | 'sheet' | 'task';
  id: string;
  title: string;
}

export interface OmniAgendaItem {
  id: string;
  title: string;
  type: AgendaItemType; // 'event' (Blue) | 'task' (Green)
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  category: EventCategory;
  color: string;     // Blue for event, Green for task
  completed?: boolean; // only for tasks
  isAllDay?: boolean;
  location?: string;
  linkedResource?: LinkedResource;
  attachments?: AttachedDoc[]; // Attached files and documents
  attendees?: string[];
}

export interface TimeSlotSelection {
  date: string;        // "YYYY-MM-DD"
  startTime: string;   // "HH:mm" (e.g. "12:00")
  endTime: string;     // "HH:mm" (e.g. "13:00")
  hour: number;        // 0 - 23
  displayTime: string; // "12:00 PM"
}

export type ViewMode = 'day' | 'week' | 'month';

export interface CategoryFilter {
  id: EventCategory;
  label: string;
  color: string;
  bgLight: string;
  active: boolean;
}
