import React, { useState, useEffect, useRef } from 'react';
import { useOmni } from '../../context/OmniContext';
import { format, isSameDay, parseISO } from '../../utils/dateUtils';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2, 
  Calendar, 
  Layers, 
  Paperclip,
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AgendaItemType, OmniAgendaItem, AttachedDoc } from '../../types';
import { EVENT_BLUE, TASK_GREEN } from '../../data/mockData';

export const RightPanel: React.FC = () => {
  const { 
    currentDate, 
    items, 
    activeTimeSlot,
    dateAttachments,
    attachDocToDate,
    removeDocFromDate,
    addItem, 
    deleteItem, 
    toggleItemCompleted, 
    openEditModal,
    isRightPanelOpen 
  } = useOmni();

  const { isGuest, setIsAuthModalOpen } = useAuth();

  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState<AgendaItemType>('event');
  const [startTimeStr, setStartTimeStr] = useState('12:00');
  const [durationMins, setDurationMins] = useState(60);
  const [isDayDocsOpen, setIsDayDocsOpen] = useState(true);

  const dayFileInputRef = useRef<HTMLInputElement>(null);

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const currentDayAttachments = dateAttachments[dateStr] || [];

  // Automatically synchronize time whenever ANY calendar slot box is clicked!
  useEffect(() => {
    if (activeTimeSlot) {
      setStartTimeStr(activeTimeSlot.startTime);
    }
  }, [activeTimeSlot]);

  if (!isRightPanelOpen) return null;

  // Filter items for the selected day
  const dayItems = items.filter(it => {
    try {
      return isSameDay(parseISO(it.startTime), currentDate);
    } catch {
      return false;
    }
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const eventCount = dayItems.filter(i => i.type === 'event').length;
  const taskCount = dayItems.filter(i => i.type === 'task').length;
  const completedTaskCount = dayItems.filter(i => i.type === 'task' && i.completed).length;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const start = new Date(currentDate);
    start.setHours(hours, minutes, 0, 0);

    const end = new Date(start);
    end.setMinutes(start.getMinutes() + durationMins);

    addItem({
      title: title.trim(),
      type: itemType,
      color: itemType === 'task' ? TASK_GREEN : EVENT_BLUE,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      category: 'work',
      completed: itemType === 'task' ? false : undefined
    });

    setTitle('');
  };

  // Upload document directly to this date
  const handleDateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach(file => {
      let fileType: AttachedDoc['type'] = 'doc';
      if (file.type.includes('pdf')) fileType = 'pdf';
      else if (file.type.includes('image')) fileType = 'image';
      else if (file.name.endsWith('.sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) fileType = 'sheet';

      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      attachDocToDate(dateStr, {
        name: file.name,
        size: sizeStr,
        type: fileType,
        source: 'local'
      });
    });

    if (dayFileInputRef.current) dayFileInputRef.current.value = '';
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

  return (
    <aside className="w-80 border-l border-white/5 bg-[#171A2B] flex flex-col h-[calc(100vh-3.5rem)] select-none shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-gradient-to-b from-slate-900/40 to-transparent">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
              Agenda
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {format(currentDate, 'EEE, MMM d')}
          </span>
        </div>

        {/* Counts Bar */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-[11px]">
          <span className="flex items-center gap-1 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
            {taskCount > 0 && ` (${completedTaskCount}/${taskCount} done)`}
          </span>
        </div>
      </div>

      {/* SECTION: Documents Attached to this Date */}
      <div className="p-3.5 border-b border-white/5 bg-purple-950/[0.15]">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setIsDayDocsOpen(prev => !prev)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 uppercase tracking-wider hover:text-white transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5 text-purple-400" />
            <span>Date Documents</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">
              {currentDayAttachments.length}
            </span>
            {isDayDocsOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          {/* Upload Document to Date */}
          <input
            type="file"
            multiple
            ref={dayFileInputRef}
            onChange={handleDateFileUpload}
            className="hidden"
          />
          {isGuest ? (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 transition-colors font-medium"
              title="Attaching files is locked in Guest mode. Sign in with Google to enable."
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Locked</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => dayFileInputRef.current?.click()}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 transition-colors"
            >
              <Upload className="w-3 h-3" />
              <span>Attach File</span>
            </button>
          )}
        </div>

        {isDayDocsOpen && (
          <div className="mt-2.5 space-y-1.5">
            {isGuest ? (
              <div 
                onClick={() => setIsAuthModalOpen(true)}
                className="p-2.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 text-xs text-slate-400 cursor-pointer hover:bg-amber-500/[0.08] transition"
              >
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px] mb-0.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Attachments Disabled for Guests</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Sign in with Google to upload files and sync documents to your calendar.
                </p>
              </div>
            ) : currentDayAttachments.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-1">
                No documents attached to this date yet. Click "Attach File" to add files for today.
              </p>
            ) : (
              currentDayAttachments.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-colors group/doc"
                >
                  <div className="flex items-center gap-2 truncate">
                    {getDocIcon(doc.type)}
                    <span className="text-xs text-slate-200 truncate">{doc.name}</span>
                    {doc.size && (
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">
                        ({doc.size})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeDocFromDate(dateStr, doc.id)}
                    className="opacity-0 group-hover/doc:opacity-100 p-0.5 text-slate-400 hover:text-rose-400 rounded transition-all shrink-0"
                    title="Remove attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add to Agenda Section */}
      <div className="p-4 border-b border-white/5 bg-black/10">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Add to Agenda
        </div>

        <form onSubmit={handleQuickAdd} className="space-y-2.5">
          <input
            type="text"
            placeholder="Title (e.g. Design review, Team sync)..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />

          {/* Type Toggle: Event (Blue) vs Task (Green) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setItemType('event')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                itemType === 'event'
                  ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50 shadow-sm shadow-blue-500/20'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-300 hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span>Event</span>
            </button>

            <button
              type="button"
              onClick={() => setItemType('task')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                itemType === 'task'
                  ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-300 hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>Task</span>
            </button>
          </div>

          {/* Time & Duration Row */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[9px] text-slate-400 mb-0.5">Time</label>
              <input
                type="time"
                value={startTimeStr}
                onChange={e => setStartTimeStr(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="w-24">
              <label className="block text-[9px] text-slate-400 mb-0.5">Duration</label>
              <select
                value={durationMins}
                onChange={e => setDurationMins(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-md px-1.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value={15} className="bg-slate-900">15m</option>
                <option value={30} className="bg-slate-900">30m</option>
                <option value={45} className="bg-slate-900">45m</option>
                <option value={60} className="bg-slate-900">1h</option>
                <option value={90} className="bg-slate-900">1.5h</option>
                <option value={120} className="bg-slate-900">2h</option>
              </select>
            </div>
            <button
              type="submit"
              className="mt-3.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Unified Agenda List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <span>Scheduled Agenda</span>
          <span className="text-slate-400 font-mono text-[10px]">{dayItems.length} total</span>
        </div>

        {dayItems.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No events or tasks scheduled for {format(currentDate, 'EEEE')}.
          </div>
        ) : (
          dayItems.map(item => {
            const isTask = item.type === 'task';
            return (
              <div
                key={item.id}
                onClick={() => openEditModal(item)}
                style={{
                  borderLeftColor: isTask ? TASK_GREEN : EVENT_BLUE,
                  backgroundColor: isTask ? 'rgba(16, 185, 129, 0.05)' : 'rgba(59, 130, 246, 0.05)'
                }}
                className={`group flex items-start gap-2.5 p-2.5 rounded-lg border-l-4 border-r border-t border-b border-white/5 hover:brightness-110 transition-all cursor-pointer ${
                  item.completed ? 'opacity-50 line-through' : ''
                }`}
              >
                {/* Task Checkbox or Event Icon */}
                {isTask ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemCompleted(item.id);
                    }}
                    className="mt-0.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <div className="mt-0.5 text-blue-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {item.title}
                    </span>
                    <span 
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider shrink-0 ${
                        isTask 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                    <span>
                      {format(parseISO(item.startTime), 'h:mm a')} – {format(parseISO(item.endTime), 'h:mm a')}
                    </span>
                  </div>

                  {/* Attached Documents Tags on Agenda Item */}
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.attachments.map(att => (
                        <div 
                          key={att.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[9px] text-purple-200 truncate max-w-[190px]"
                        >
                          <Paperclip className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                          <span className="truncate">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.linkedResource && (
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-purple-300 truncate">
                      <Layers className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{item.linkedResource.title}</span>
                    </div>
                  )}
                </div>

                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-all rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
