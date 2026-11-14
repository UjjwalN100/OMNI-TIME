import React, { createContext, useContext, useState, useEffect } from 'react';
import { OmniAgendaItem, CategoryFilter, ViewMode, EventCategory, TimeSlotSelection, AttachedDoc } from '../types';
import { INITIAL_CATEGORIES, INITIAL_ITEMS, INITIAL_DATE_ATTACHMENTS, EVENT_BLUE, TASK_GREEN } from '../data/mockData';
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, format } from '../utils/dateUtils';

export interface ModalState {
  isOpen: boolean;
  item: OmniAgendaItem | null;
  slot: TimeSlotSelection | null;
}

interface OmniContextType {
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

export const OmniProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  
  const [items, setItems] = useState<OmniAgendaItem[]>(() => {
    const saved = localStorage.getItem('omni_agenda_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [dateAttachments, setDateAttachments] = useState<Record<string, AttachedDoc[]>>(() => {
    const saved = localStorage.getItem('omni_date_attachments');
    return saved ? JSON.parse(saved) : INITIAL_DATE_ATTACHMENTS;
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

  useEffect(() => {
    localStorage.setItem('omni_agenda_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('omni_date_attachments', JSON.stringify(dateAttachments));
  }, [dateAttachments]);

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

  const addItem = (itemData: Omit<OmniAgendaItem, 'id'>) => {
    const newItem: OmniAgendaItem = {
      ...itemData,
      id: `agenda-${Date.now()}`,
      color: itemData.type === 'task' ? TASK_GREEN : EVENT_BLUE
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, updatedFields: Partial<OmniAgendaItem>) => {
    setItems(prev => prev.map(it => {
      if (it.id === id) {
        const nextType = updatedFields.type ?? it.type;
        const nextColor = updatedFields.color ?? (nextType === 'task' ? TASK_GREEN : EVENT_BLUE);
        return { ...it, ...updatedFields, type: nextType, color: nextColor };
      }
      return it;
    }));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const toggleItemCompleted = (id: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, completed: !it.completed } : it));
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
  const attachDocToDate = (dateStr: string, doc: Omit<AttachedDoc, 'id' | 'uploadedAt'>) => {
    const newDoc: AttachedDoc = {
      ...doc,
      id: `doc-date-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      uploadedAt: format(new Date(), 'h:mm a')
    };

    setDateAttachments(prev => {
      const existing = prev[dateStr] || [];
      return {
        ...prev,
        [dateStr]: [newDoc, ...existing]
      };
    });
  };

  const removeDocFromDate = (dateStr: string, docId: string) => {
    setDateAttachments(prev => {
      const existing = prev[dateStr] || [];
      return {
        ...prev,
        [dateStr]: existing.filter(d => d.id !== docId)
      };
    });
  };

  // Item-level attachment operations
  const attachDocToItem = (itemId: string, doc: Omit<AttachedDoc, 'id' | 'uploadedAt'>) => {
    const newDoc: AttachedDoc = {
      ...doc,
      id: `doc-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
  };

  const removeDocFromItem = (itemId: string, docId: string) => {
    setItems(prev => prev.map(it => {
      if (it.id === itemId && it.attachments) {
        return {
          ...it,
          attachments: it.attachments.filter(d => d.id !== docId)
        };
      }
      return it;
    }));
  };

  return (
    <OmniContext.Provider
      value={{
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
