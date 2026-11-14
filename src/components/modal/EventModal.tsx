import React, { useState, useEffect, useRef } from 'react';
import { useOmni } from '../../context/OmniContext';
import { format, parseISO } from '../../utils/dateUtils';
import { 
  X, 
  Trash2, 
  Layers, 
  Check, 
  CalendarCheck,
  Paperclip,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  File,
  Upload,
  Plus,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AgendaItemType, EventCategory, OmniAgendaItem, AttachedDoc } from '../../types';
import { EVENT_BLUE, TASK_GREEN } from '../../data/mockData';

export const EventModal: React.FC = () => {
  const { 
    modalState,
    closeModal,
    addItem, 
    updateItem, 
    deleteItem,
    categories 
  } = useOmni();

  const { isGuest, setIsAuthModalOpen } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState<AgendaItemType>('event');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('13:00');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [category, setCategory] = useState<EventCategory>('work');
  const [isCompleted, setIsCompleted] = useState(false);
  const [attachments, setAttachments] = useState<AttachedDoc[]>([]);
  const [linkToSpace, setLinkToSpace] = useState(false);
  const [spaceDocTitle, setSpaceDocTitle] = useState('New Project Note');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFriendlyTime = (timeStr: string) => {
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const applyDuration = (startStr: string, durationMins: number) => {
    try {
      const [h, m] = startStr.split(':').map(Number);
      const totalMins = h * 60 + m + durationMins;
      const endH = Math.floor(totalMins / 60) % 24;
      const endM = totalMins % 60;
      return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    } catch {
      return '13:00';
    }
  };

  useEffect(() => {
    if (!modalState.isOpen) return;

    if (modalState.item) {
      const item = modalState.item;
      setTitle(item.title);
      setDescription(item.description || '');
      setItemType(item.type);
      setIsCompleted(!!item.completed);
      const s = parseISO(item.startTime);
      const e = parseISO(item.endTime);
      setStartDate(format(s, 'yyyy-MM-dd'));
      setStartTime(format(s, 'HH:mm'));
      setEndTime(format(e, 'HH:mm'));
      setCategory(item.category);
      setAttachments(item.attachments || []);
      if (item.linkedResource) {
        setLinkToSpace(true);
        setSpaceDocTitle(item.linkedResource.title);
      } else {
        setLinkToSpace(false);
      }
    } else if (modalState.slot) {
      const slot = modalState.slot;
      setTitle('');
      setDescription('');
      setItemType('event');
      setIsCompleted(false);
      setStartDate(slot.date);
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
      setSelectedDuration(60);
      setCategory('work');
      setAttachments([]);
      setLinkToSpace(false);
    }
  }, [modalState]);

  if (!modalState.isOpen) return null;

  const handleDurationSelect = (mins: number) => {
    setSelectedDuration(mins);
    setEndTime(applyDuration(startTime, mins));
  };

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    setEndTime(applyDuration(newStartTime, selectedDuration));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newAttachments: AttachedDoc[] = files.map(f => {
      let docType: AttachedDoc['type'] = 'doc';
      if (f.name.endsWith('.pdf')) docType = 'pdf';
      else if (f.name.match(/\.(xlsx|xls|csv)$/)) docType = 'sheet';
      else if (f.name.match(/\.(png|jpg|jpeg|svg|webp)$/)) docType = 'image';

      return {
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        size: `${(f.size / 1024).toFixed(0)} KB`,
        type: docType,
        source: 'local',
        uploadedAt: format(new Date(), 'h:mm a')
      };
    });

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleAddSpaceDoc = (docName: string) => {
    const spaceDoc: AttachedDoc = {
      id: `space-${Date.now()}`,
      name: docName,
      size: 'OMNI Space',
      type: 'space',
      source: 'omni_space',
      uploadedAt: format(new Date(), 'h:mm a')
    };
    setAttachments(prev => [...prev, spaceDoc]);
  };

  const getDocIcon = (type: AttachedDoc['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'sheet': return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      case 'space': return <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      default: return <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const start = new Date(startDate);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(startDate);
    end.setHours(endH, endM, 0, 0);

    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    const itemPayload: Omit<OmniAgendaItem, 'id'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      type: itemType,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      category,
      color: itemType === 'task' ? TASK_GREEN : EVENT_BLUE,
      completed: itemType === 'task' ? isCompleted : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      linkedResource: linkToSpace ? {
        module: 'space',
        type: 'doc',
        id: `space-${Date.now()}`,
        title: spaceDocTitle.trim() || 'OMNI Space Document'
      } : undefined
    };

    if (modalState.item) {
      updateItem(modalState.item.id, itemPayload);
    } else {
      addItem(itemPayload);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (modalState.item) {
      deleteItem(modalState.item.id);
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="glass-panel w-full max-w-lg max-h-[92vh] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col bg-[#1E2238]"
        onClick={e => e.stopPropagation()}
      >
        {/* Pinned Modal Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: itemType === 'task' ? TASK_GREEN : EVENT_BLUE }}
            />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              {modalState.item ? `Edit ${itemType === 'task' ? 'Task' : 'Event'}` : 'Schedule Agenda Item'}
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="event-modal-form" onSubmit={handleSave} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-slate-200">
          {/* Auto-filled Slot Banner */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/25">
            <div className="flex items-center gap-2 text-xs">
              <CalendarCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="text-slate-300">
                Slot: <span className="font-semibold text-purple-200">{formatFriendlyTime(startTime)} – {formatFriendlyTime(endTime)}</span>
                <span className="text-slate-400 ml-1 font-mono text-[11px]">({selectedDuration}m)</span>
              </div>
            </div>
            <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold tracking-wider">
              Auto-filled
            </span>
          </div>

          {/* Type Selector Tabs (Event Blue vs Task Green) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setItemType('event')}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                itemType === 'event'
                  ? 'bg-blue-600/30 text-blue-200 border-2 border-blue-500 shadow-sm shadow-blue-500/20'
                  : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
              <span>Event (Blue)</span>
            </button>
            <button
              type="button"
              onClick={() => setItemType('task')}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                itemType === 'task'
                  ? 'bg-emerald-600/30 text-emerald-200 border-2 border-emerald-500 shadow-sm shadow-emerald-500/20'
                  : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span>Task (Green)</span>
            </button>
          </div>

          {/* Title Input */}
          <div>
            <input
              type="text"
              required
              autoFocus
              placeholder={itemType === 'task' ? 'Task title (e.g. Prepare deck, Ship PR)...' : 'Event title (e.g. Design review meeting)...'}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => handleStartTimeChange(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Duration Pills */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Duration
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[15, 30, 45, 60, 90, 120].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleDurationSelect(mins)}
                  className={`py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedDuration === mins
                      ? 'bg-purple-600 text-white font-semibold shadow-sm'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {mins < 60 ? `${mins}m` : mins === 60 ? '1h' : `${mins / 60}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                    category === cat.id
                      ? 'bg-white/15 text-white font-medium ring-1 ring-white/30'
                      : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                  }`}
                >
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: cat.color }} 
                  />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                <span>Attached Files & Docs</span>
              </label>
              {isGuest ? (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Locked for Guests</span>
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                  </button>
                </div>
              )}
            </div>

            {/* Attached List or Empty State or Guest Lock */}
            {isGuest ? (
              <div 
                onClick={() => {
                  closeModal();
                  setIsAuthModalOpen(true);
                }}
                className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 text-center text-slate-400 text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-500/[0.08] transition"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-200/90 text-[11px]">
                  Document attachments require a Google account. <strong className="underline text-amber-300">Sign in to unlock</strong>
                </span>
              </div>
            ) : attachments.length > 0 ? (
              <div className="space-y-1">
                {attachments.map(att => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.04] border border-white/5 text-xs text-slate-200"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getDocIcon(att.type)}
                      <span className="truncate">{att.name}</span>
                      {att.size && <span className="text-[10px] text-slate-500 font-mono">({att.size})</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl border border-dashed border-white/10 hover:border-purple-500/40 hover:bg-purple-500/[0.02] transition-colors cursor-pointer text-center text-slate-400 text-xs flex items-center justify-center gap-2"
              >
                <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                <span>Click to attach documents, PDFs, or slides</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Notes & Agenda Details
            </label>
            <textarea
              rows={2}
              placeholder="Add key notes or goals..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </form>

        {/* PINNED MODAL FOOTER - NEVER GETS CUT OFF */}
        <div className="px-5 py-3 border-t border-white/10 bg-slate-900/80 flex items-center justify-between shrink-0">
          {modalState.item ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={closeModal}
              className="px-3.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="event-modal-form"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{modalState.item ? 'Save Changes' : 'Schedule Item'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
