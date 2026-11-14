import { OmniAgendaItem, CategoryFilter, AttachedDoc } from '../types';
import { setHours, setMinutes, format } from 'date-fns';

const today = new Date();
const todayStr = format(today, 'yyyy-MM-dd');

export const EVENT_BLUE = '#3b82f6';
export const TASK_GREEN = '#10b981';

export const INITIAL_CATEGORIES: CategoryFilter[] = [
  { id: 'work', label: 'Work & Ecosystem', color: '#38bdf8', bgLight: 'rgba(56, 189, 248, 0.15)', active: true },
  { id: 'focus', label: 'Deep Focus', color: '#818cf8', bgLight: 'rgba(129, 140, 248, 0.15)', active: true },
  { id: 'meeting', label: 'Meetings & Syncs', color: '#f472b6', bgLight: 'rgba(244, 114, 182, 0.15)', active: true },
  { id: 'personal', label: 'Personal', color: '#34d399', bgLight: 'rgba(52, 211, 153, 0.15)', active: true },
  { id: 'health', label: 'Health & Wellness', color: '#fbbf24', bgLight: 'rgba(251, 191, 36, 0.15)', active: true },
];

export const INITIAL_DATE_ATTACHMENTS: Record<string, AttachedDoc[]> = {
  [todayStr]: [
    {
      id: 'doc-daily-plan',
      name: 'Omni_Daily_Productivity_Goals.pdf',
      size: '1.4 MB',
      type: 'pdf',
      source: 'local',
      uploadedAt: 'Today at 8:30 AM'
    },
    {
      id: 'doc-space-notes',
      name: 'Sprint_Kickoff_Notes.space',
      size: '420 KB',
      type: 'space',
      source: 'omni_space',
      uploadedAt: 'Today at 9:15 AM'
    }
  ]
};

export const INITIAL_ITEMS: OmniAgendaItem[] = [
  {
    id: 'agenda-1',
    title: 'OMNI Ecosystem Architecture Review',
    type: 'event', // Blue
    description: 'Review inter-module data synchronization between OMNI Time and OMNI Space.',
    startTime: setMinutes(setHours(today, 9), 0).toISOString(),
    endTime: setMinutes(setHours(today, 10), 30).toISOString(),
    category: 'work',
    color: EVENT_BLUE,
    location: 'Virtual Workspace',
    linkedResource: {
      module: 'space',
      type: 'doc',
      id: 'doc-arch-01',
      title: 'OMNI Ecosystem v1 Architecture.doc'
    },
    attachments: [
      {
        id: 'att-1',
        name: 'OMNI_Data_Flow_Diagram.png',
        size: '2.1 MB',
        type: 'image',
        source: 'local',
        uploadedAt: 'Today at 8:45 AM'
      },
      {
        id: 'att-2',
        name: 'Architecture_Spec_v1.pdf',
        size: '850 KB',
        type: 'pdf',
        source: 'omni_space',
        uploadedAt: 'Today at 9:00 AM'
      }
    ]
  },
  {
    id: 'agenda-2',
    title: 'Review OMNI Space shared database schema',
    type: 'task', // Green
    description: 'Verify foreign keys and zero-cost Supabase tables.',
    startTime: setMinutes(setHours(today, 11), 0).toISOString(),
    endTime: setMinutes(setHours(today, 12), 0).toISOString(),
    category: 'work',
    color: TASK_GREEN,
    completed: false,
    attachments: [
      {
        id: 'att-3',
        name: 'Supabase_Schema_Draft.sql',
        size: '48 KB',
        type: 'doc',
        source: 'local',
        uploadedAt: 'Today at 10:15 AM'
      }
    ]
  },
  {
    id: 'agenda-3',
    title: 'Screen Break & Lunch Walk',
    type: 'task', // Green
    description: 'Recharge and step away from laptop.',
    startTime: setMinutes(setHours(today, 13), 0).toISOString(),
    endTime: setMinutes(setHours(today, 14), 0).toISOString(),
    category: 'health',
    color: TASK_GREEN,
    completed: true
  },
  {
    id: 'agenda-4',
    title: 'Product Sync & Zero-Cost Strategy',
    type: 'event', // Blue
    description: 'Meeting to check free-tier cloud quotas and database capacity.',
    startTime: setMinutes(setHours(today, 15), 0).toISOString(),
    endTime: setMinutes(setHours(today, 16), 0).toISOString(),
    category: 'meeting',
    color: EVENT_BLUE,
    attachments: [
      {
        id: 'att-4',
        name: 'Zero-Cost Cloud Topology.sheet',
        size: '1.8 MB',
        type: 'sheet',
        source: 'omni_space',
        uploadedAt: 'Today at 2:30 PM'
      }
    ]
  },
  {
    id: 'agenda-5',
    title: 'Configure Keyboard shortcut bindings',
    type: 'task', // Green
    description: 'Ensure T, W, D, C and Ctrl+K shortcuts feel snappy.',
    startTime: setMinutes(setHours(today, 16), 30).toISOString(),
    endTime: setMinutes(setHours(today, 17), 15).toISOString(),
    category: 'focus',
    color: TASK_GREEN,
    completed: false
  },
  {
    id: 'agenda-6',
    title: 'Daily Shutdown & Evening Plan',
    type: 'event', // Blue
    description: 'Review achievements, clear inbox, and schedule tomorrow.',
    startTime: setMinutes(setHours(today, 17), 30).toISOString(),
    endTime: setMinutes(setHours(today, 18), 0).toISOString(),
    category: 'personal',
    color: EVENT_BLUE
  }
];
