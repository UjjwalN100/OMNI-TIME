import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OmniAgendaItem, CategoryFilter, ViewMode, EventCategory, TimeSlotSelection, AttachedDoc } from '../types';
import { INITIAL_CATEGORIES, INITIAL_ITEMS, INITIAL_DATE_ATTACHMENTS, EVENT_BLUE, TASK_GREEN } from '../data/mockData';
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, format } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface ModalState {
  isOpen: boolean;
  item: OmniAgendaItem | null;
  slot: TimeSlotSelection | null;
}

interface OmniContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  items: OmniAgendaItem[];
  categories: CategoryFilter[];
  dateAttachments: Record<string, AttachedDoc[]>;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  
  modalState: ModalState;
  activeTimeSlot: TimeSlotSelection | null;
  
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  
  // Handlers
  addItem: (item: Omit<OmniAgendaItem, 'id'>) => void;
  updateItem: (id: string, item: Partial<OmniAgendaItem>) => void;
  deleteItem: (id: string) => void;
  toggleItemCompleted: (id: string) => void;
  toggleCategory: (categoryId: EventCategory) => void;
  navigateToday: () => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  openNewModal: (slot?: TimeSlotSelection) => void;
  openEditModal: (item: OmniAgendaItem) => void;
  closeModal: () => void;
  selectSlot: (slot: TimeSlotSelection) => void;
  
  // Document Attachment handlers
  attachDocToDate: (dateStr: string, doc: Omit<AttachedDoc, 'id' | 'uploadedAt'>) => void;
  removeDocFromDate: (dateStr: string, docId: string) => void;
  attachDocToItem: (itemId: string, doc: Omit<AttachedDoc, 'id' | 'uploadedAt'>) => void;
  removeDocFromItem: (itemId: string, docId: string) => void;
}

const OmniContext = createContext<OmniContextType | undefined>(undefined);

// Helper function to strip any legacy mock data and ensure pristine clean slate
const cleanStoredItems = (saved: string | null): OmniAgendaItem[] => {
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter((item: OmniAgendaItem) => 
        !item.id?.startsWith('agenda-') && 
        !item.title?.toLowerCase().includes('omni ecosystem') &&
        !item.title?.toLowerCase().includes('review omni space') &&
        !item.title?.toLowerCase().includes('zero-cost') &&
        !item.title?.toLowerCase().includes('screen break')
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('omni_agenda_items', JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
};

const cleanStoredDocs = (saved: string | null): Record<string, AttachedDoc[]> => {
  if (!saved) return {};
  try {
    const parsed = JSON.parse(saved);
    const cleaned: Record<string, AttachedDoc[]> = {};
    for (const [date, docs] of Object.entries(parsed as Record<string, AttachedDoc[]>)) {
      const valid = docs.filter(d => !d.id?.startsWith('doc-daily-plan') && !d.id?.startsWith('doc-space-notes'));
      if (valid.length > 0) cleaned[date] = valid;
    }
    if (Object.keys(cleaned).length !== Object.keys(parsed).length) {
      localStorage.setItem('omni_date_attachments', JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    console.error(e);
  }
  return {};
};

export const OmniProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('omni_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('omni_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  
  const [items, setItems] = useState<OmniAgendaItem[]>(() => {
    return cleanStoredItems(localStorage.getItem('omni_agenda_items'));
  });

  const [dateAttachments, setDateAttachments] = useState<Record<string, AttachedDoc[]>>(() => {
    return cleanStoredDocs(localStorage.getItem('omni_date_attachments'));
  });

  const [categories, setCategories] = useState<CategoryFilter[]>(INITIAL_CATEGORIES);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    item: null,
    slot: null
  });

  const [activeTimeSlot, setActiveTimeSlot] = useState<TimeSlotSelection | null>(() => {
    const now = new Date();
    const h = now.getHours();
    return {
      date: format(now, 'yyyy-MM-dd'),
      startTime: `${h.toString().padStart(2, '0')}:00`,
      endTime: `${((h + 1) % 24).toString().padStart(2, '0')}:00`,
      hour: h,
      displayTime: `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`
    };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Sync from Supabase when user logs in
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch agenda items
      const { data: dbItems, error: itemsError } = await supabase
        .from('agenda_items')
        .select('*')
        .order('start_time', { ascending: true });

      // 2. Fetch documents
      const { data: dbDocs } = await supabase
        .from('documents')
        .select('*');

      if (!itemsError && dbItems) {
        // Group attachments by item_id
        const itemAttachments: Record<string, AttachedDoc[]> = {};
        const dateAtts: Record<string, AttachedDoc[]> = {};

        if (dbDocs) {
          dbDocs.forEach((d: any) => {
            const docObj: AttachedDoc = {
              id: d.id,
              name: d.name,
              size: d.size || undefined,
              type: d.type || 'doc',
              source: d.source || (d.type === 'space' ? 'omni_space' : 'local'),
              url: d.url || undefined,
              uploadedAt: d.created_at ? format(new Date(d.created_at), 'h:mm a') : 'Just now'
            };
            if (d.item_id) {
              if (!itemAttachments[d.item_id]) itemAttachments[d.item_id] = [];
              itemAttachments[d.item_id].push(docObj);
            } else if (d.date) {
              if (!dateAtts[d.date]) dateAtts[d.date] = [];
              dateAtts[d.date].push(docObj);
            }
          });
        }

        const mappedItems: OmniAgendaItem[] = dbItems.map((it: any) => ({
          id: it.id,
          title: it.title,
          startTime: it.start_time,
          endTime: it.end_time,
          type: it.type as 'event' | 'task',
          category: (it.category || 'work') as EventCategory,
          color: it.type === 'task' ? TASK_GREEN : EVENT_BLUE,
          completed: it.is_completed,
          description: it.description || undefined,
          attachments: itemAttachments[it.id] || []
        }));

        setItems(mappedItems);
        setDateAttachments(dateAtts);
      }
    } catch (err) {
      console.warn('Error fetching user data from Supabase:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      // Realtime subscription
      const channel = supabase.channel('omni_agenda_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda_items' }, () => {
          fetchUserData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
          fetchUserData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Revert to clean localStorage when logged out
      setItems(cleanStoredItems(localStorage.getItem('omni_agenda_items')));
      setDateAttachments(cleanStoredDocs(localStorage.getItem('omni_date_attachments')));
    }
  }, [user, fetchUserData]);

  // Persist local copy
  useEffect(() => {
    if (!user) {
      localStorage.setItem('omni_agenda_items', JSON.stringify(items));
    }
  }, [items, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('omni_date_attachments', JSON.stringify(dateAttachments));
    }
  }, [dateAttachments, user]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      if (!modalState.isOpen && !isCommandPaletteOpen) {
        if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          setCurrentDate(new Date());
        } else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          setViewMode('day');
        } else if (e.key.toLowerCase() === 'w') {
          e.preventDefault();
          setViewMode('week');
        } else if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          setViewMode('month');
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          openNewModal();
        } else if (e.key.toLowerCase() === '[') {
          e.preventDefault();
          setIsSidebarOpen(prev => !prev);
        } else if (e.key.toLowerCase() === ']') {
          e.preventDefault();
          setIsRightPanelOpen(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState.isOpen, isCommandPaletteOpen]);

  const addItem = async (itemData: Omit<OmniAgendaItem, 'id'>) => {
    const newItemId = `agenda-${Date.now()}`;
    const newItem: OmniAgendaItem = {
      ...itemData,
      id: newItemId,
      color: itemData.type === 'task' ? TASK_GREEN : EVENT_BLUE
    };
    
    // Optimistic local update
    setItems(prev => [...prev, newItem]);

    // Supabase persist
    if (user) {
      try {
        const dateStr = newItem.startTime.split('T')[0];
        await supabase.from('agenda_items').insert({
          id: newItemId,
          user_id: user.id,
          title: newItem.title,
          date: dateStr,
          start_time: newItem.startTime,
          end_time: newItem.endTime,
          type: newItem.type,
          category: newItem.category,
          is_completed: newItem.completed ?? false,
          description: newItem.description || null
        });
      } catch (e) {
        console.error('Supabase addItem error', e);
      }
    }
  };

  const updateItem = async (id: string, updatedFields: Partial<OmniAgendaItem>) => {
    setItems(prev => prev.map(it => {
      if (it.id === id) {
        const nextType = updatedFields.type ?? it.type;
        const nextColor = updatedFields.color ?? (nextType === 'task' ? TASK_GREEN : EVENT_BLUE);
        return { ...it, ...updatedFields, type: nextType, color: nextColor };
      }
      return it;
    }));

    if (user) {
      try {
        const payload: any = {};
        if (updatedFields.title !== undefined) payload.title = updatedFields.title;
        if (updatedFields.startTime !== undefined) {
          payload.start_time = updatedFields.startTime;
          payload.date = updatedFields.startTime.split('T')[0];
        }
        if (updatedFields.endTime !== undefined) payload.end_time = updatedFields.endTime;
        if (updatedFields.type !== undefined) payload.type = updatedFields.type;
        if (updatedFields.category !== undefined) payload.category = updatedFields.category;
        if (updatedFields.completed !== undefined) payload.is_completed = updatedFields.completed;
        if (updatedFields.description !== undefined) payload.description = updatedFields.description;
        await supabase.from('agenda_items').update(payload).eq('id', id);
      } catch (e) {
        console.error('Supabase updateItem error', e);
      }
    }
  };

  const deleteItem = async (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
    if (user) {
      try {
        await supabase.from('agenda_items').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase deleteItem error', e);
      }
    }
  };

  const toggleItemCompleted = async (id: string) => {
    const it = items.find(x => x.id === id);
    if (!it) return;
    const newStatus = !it.completed;

    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: newStatus } : item));

    if (user) {
      try {
        await supabase.from('agenda_items').update({ is_completed: newStatus }).eq('id', id);
      } catch (e) {
        console.error('Supabase toggleItemCompleted error', e);
      }
    }
  };

  const toggleCategory = (categoryId: EventCategory) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, active: !c.active } : c));
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const navigateNext = () => {
    if (viewMode === 'day') setCurrentDate(prev => addDays(prev, 1));
    else if (viewMode === 'week') setCurrentDate(prev => addWeeks(prev, 1));
    else if (viewMode === 'month') setCurrentDate(prev => addMonths(prev, 1));
  };

  const navigatePrev = () => {
    if (viewMode === 'day') setCurrentDate(prev => subDays(prev, 1));
    else if (viewMode === 'week') setCurrentDate(prev => subWeeks(prev, 1));
    else if (viewMode === 'month') setCurrentDate(prev => subMonths(prev, 1));
  };

  const selectSlot = (slot: TimeSlotSelection) => {
    setActiveTimeSlot(slot);
  };

  const openNewModal = (slot?: TimeSlotSelection) => {
    const finalSlot = slot || activeTimeSlot || {
      date: format(currentDate, 'yyyy-MM-dd'),
      startTime: '12:00',
      endTime: '13:00',
      hour: 12,
      displayTime: '12:00 PM'
    };
    setActiveTimeSlot(finalSlot);
    setModalState({
      isOpen: true,
      item: null,
      slot: finalSlot
    });
  };

  const openEditModal = (item: OmniAgendaItem) => {
    setModalState({
      isOpen: true,
      item,
      slot: null
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Date-level attachment operations
  const attachDocToDate = async (dateStr: string, doc: Omit<AttachedDoc, 'id' | 'uploadedAt'>) => {
    const newDocId = `doc-date-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: AttachedDoc = {
      ...doc,
      id: newDocId,
      uploadedAt: format(new Date(), 'h:mm a')
    };

    setDateAttachments(prev => {
      const existing = prev[dateStr] || [];
      return {
        ...prev,
        [dateStr]: [newDoc, ...existing]
      };
    });

    if (user) {
      try {
        await supabase.from('documents').insert({
          id: newDocId,
          user_id: user.id,
          date: dateStr,
          name: doc.name,
          size: doc.size || null,
          type: doc.type,
          url: doc.url || null
        });
      } catch (e) {
        console.error('Supabase attachDocToDate error', e);
      }
    }
  };

  const removeDocFromDate = async (dateStr: string, docId: string) => {
    setDateAttachments(prev => {
      const existing = prev[dateStr] || [];
      return {
        ...prev,
        [dateStr]: existing.filter(d => d.id !== docId)
      };
    });

    if (user) {
      try {
        await supabase.from('documents').delete().eq('id', docId);
      } catch (e) {
        console.error('Supabase removeDocFromDate error', e);
      }
    }
  };

  // Item-level attachment operations
  const attachDocToItem = async (itemId: string, doc: Omit<AttachedDoc, 'id' | 'uploadedAt'>) => {
    const newDocId = `doc-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: AttachedDoc = {
      ...doc,
      id: newDocId,
      uploadedAt: format(new Date(), 'h:mm a')
    };

    setItems(prev => prev.map(it => {
      if (it.id === itemId) {
        const existing = it.attachments || [];
        return {
          ...it,
          attachments: [newDoc, ...existing]
        };
      }
      return it;
    }));

    if (user) {
      try {
        await supabase.from('documents').insert({
          id: newDocId,
          user_id: user.id,
          item_id: itemId,
          name: doc.name,
          size: doc.size || null,
          type: doc.type,
          url: doc.url || null
        });
      } catch (e) {
        console.error('Supabase attachDocToItem error', e);
      }
    }
  };

  const removeDocFromItem = async (itemId: string, docId: string) => {
    setItems(prev => prev.map(it => {
      if (it.id === itemId && it.attachments) {
        return {
          ...it,
          attachments: it.attachments.filter(d => d.id !== docId)
        };
      }
      return it;
    }));

    if (user) {
      try {
        await supabase.from('documents').delete().eq('id', docId);
      } catch (e) {
        console.error('Supabase removeDocFromItem error', e);
      }
    }
  };

  return (
    <OmniContext.Provider
      value={{
        theme,
        toggleTheme,
        currentDate,
        setCurrentDate,
        viewMode,
        setViewMode,
        items,
        categories,
        dateAttachments,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        modalState,
        activeTimeSlot,
        isSidebarOpen,
        setIsSidebarOpen,
        isRightPanelOpen,
        setIsRightPanelOpen,
        addItem,
        updateItem,
        deleteItem,
        toggleItemCompleted,
        toggleCategory,
        navigateToday,
        navigateNext,
        navigatePrev,
        openNewModal,
        openEditModal,
        closeModal,
        selectSlot,
        attachDocToDate,
        removeDocFromDate,
        attachDocToItem,
        removeDocFromItem
      }}
    >
      {children}
    </OmniContext.Provider>
  );
};

export const useOmni = () => {
  const context = useContext(OmniContext);
  if (!context) throw new Error('useOmni must be used within an OmniProvider');
  return context;
};
