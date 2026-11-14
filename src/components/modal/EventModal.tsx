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
  Plus
} from 'lucide-react';
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

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    setEndTime(applyDuration(newStart, selectedDuration));
  };

  const handleDurationClick = (mins: number) => {
    setSelectedDuration(mins);
    setEndTime(applyDuration(startTime, mins));
  };

  // Local File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newDocs: AttachedDoc[] = files.map(file => {
      let fileType: AttachedDoc['type'] = 'doc';
      if (file.type.includes('pdf')) fileType = 'pdf';
      else if (file.type.includes('image')) fileType = 'image';
      else if (file.name.endsWith('.sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) fileType = 'sheet';

      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: sizeStr,
        type: fileType,
        source: 'local',
        uploadedAt: format(new Date(), 'h:mm a')
      };
    });

    setAttachments(prev => [...prev, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick attach from OMNI Space
  const handleAddSpaceDoc = (name: string, type: AttachedDoc['type']) => {
    const newDoc: AttachedDoc = {
      id: `space-${Date.now()}`,
      name,
      size: 'OMNI Space',
      type,
      source: 'omni_space',
      uploadedAt: format(new Date(), 'h:mm a')
    };
    setAttachments(prev => [...prev, newDoc]);
  };

  const removeAttachment = (docId: string) => {
    setAttachments(prev => prev.filter(d => d.id !== docId));
  };

  const getDocIcon = (type: AttachedDoc['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-3.5 h-3.5 text-rose-400" />;
      case 'sheet': return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'space': return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <FileCode className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endIso = new Date(`${startDate}T${endTime}:00`).toISOString();

    const itemPayload: Omit<OmniAgendaItem, 'id'> = {
      title: title.trim(),
      type: itemType,
      description: description.trim() || undefined,
      startTime: startIso,
      endTime: endIso,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="glass-panel w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: itemType === 'task' ? TASK_GREEN : EVENT_BLUE }}
            />
            <h3 className="text-sm font-semibold text-white">
              {modalState.item ? `Edit ${itemType === 'task' ? 'Task' : 'Event'}` : 'Schedule Agenda Item'}
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Prominent Auto-filled Slot Indicator */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/25">
            <div className="flex items-center gap-2 text-xs">
              <CalendarCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="text-slate-300">
                Time slot: <span className="font-semibold text-indigo-200">{formatFriendlyTime(startTime)} – {formatFriendlyTime(endTime)}</span>
                <span className="text-slate-400 ml-1.5 font-mono text-[11px]">({selectedDuration}m)</span>
              </div>
            </div>
            <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold tracking-wider">
              Auto-filled
            </span>
          </div>

          {/* Type Selector (Event Blue vs Task Green) */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Choose Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setItemType('event')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  itemType === 'event'
                    ? 'bg-blue-600/30 text-blue-200 border-2 border-blue-500 shadow-md shadow-blue-500/20'
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
                    ? 'bg-emerald-600/30 text-emerald-200 border-2 border-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span>Task (Green)</span>
              </button>
            </div>
          </div>

          {/* Title input */}
          <div>
            <input
              type="text"
              autoFocus
              placeholder={itemType === 'task' ? 'Task title (e.g. Review legal contract)...' : 'Event title (e.g. Design review meeting)...'}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-medium text-white placeholder-slate-400 border-none outline-none focus:ring-0 px-0"
            />
          </div>

          {/* Date & Start Time */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
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
                  value={startTime}
                  onChange={e => handleStartTimeChange(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Quick Duration Pills */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Duration
              </label>
              <div className="flex items-center gap-2">
                {[15, 30, 45, 60, 90, 120].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleDurationClick(mins)}
                    className={`flex-1 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                      selectedDuration === mins
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
                    }`}
                  >
                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ATTACHMENTS & DOCUMENTS SECTION */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                <span>Attached Documents & Files</span>
                {attachments.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300">
                    {attachments.length}
                  </span>
                )}
              </div>

              {/* Upload trigger button */}
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
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <Upload className="w-3 h-3 text-indigo-400" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {/* Quick Attach from OMNI Space Suggestions */}
            <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1 text-[10px]">
              <span className="text-slate-400 text-[10px] shrink-0">Quick OMNI Space:</span>
              <button
                type="button"
                onClick={() => handleAddSpaceDoc('Architecture_Overview.doc', 'doc')}
                className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/10 text-slate-300 border border-white/5 shrink-0 flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5 text-sky-400" /> Architecture.doc
              </button>
              <button
                type="button"
                onClick={() => handleAddSpaceDoc('Sprint_Budget_Model.sheet', 'sheet')}
                className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/10 text-slate-300 border border-white/5 shrink-0 flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5 text-emerald-400" /> Budget.sheet
              </button>
              <button
                type="button"
                onClick={() => handleAddSpaceDoc('Project_Kickoff_Slides.space', 'space')}
                className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/10 text-slate-300 border border-white/5 shrink-0 flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5 text-cyan-400" /> Slides.space
              </button>
            </div>

            {/* List of Attached Files */}
            {attachments.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {attachments.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getDocIcon(doc.type)}
                      <span className="text-xs text-slate-200 truncate">{doc.name}</span>
                      {doc.size && (
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          ({doc.size})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(doc.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors shrink-0"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl p-3 text-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-white/[0.03]"
              >
                <Paperclip className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-[11px] text-slate-400">Click to attach documents, PDFs, or slides</p>
              </div>
            )}
          </div>

          {/* If Task: Complete status */}
          {itemType === 'task' && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <input
                type="checkbox"
                id="task-complete-chk"
                checked={isCompleted}
                onChange={e => setIsCompleted(e.target.checked)}
                className="rounded border-white/20 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="task-complete-chk" className="text-xs text-emerald-200 cursor-pointer">
                Mark task as completed
              </label>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
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
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Connect to OMNI Space */}
          <div className="p-3 rounded-xl bg-indigo-500/[0.05] border border-indigo-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-200">Connect to OMNI Space</span>
              </div>
              <input
                type="checkbox"
                checked={linkToSpace}
                onChange={e => setLinkToSpace(e.target.checked)}
                className="rounded border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>
            {linkToSpace && (
              <div className="mt-2.5 pt-2 border-t border-indigo-500/10">
                <input
                  type="text"
                  placeholder="Document name in OMNI Space..."
                  value={spaceDocTitle}
                  onChange={e => setSpaceDocTitle(e.target.value)}
                  className="w-full bg-white/[0.05] border border-indigo-500/30 rounded-lg px-2.5 py-1 text-xs text-indigo-100 placeholder-indigo-300/40 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between shrink-0">
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{modalState.item ? 'Save Changes' : 'Schedule to Agenda'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
