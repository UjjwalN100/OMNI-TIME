import React, { useState, useEffect } from 'react';
import { useOmni } from '../../context/OmniContext';
import { 
  Search, 
  Calendar, 
  Clock, 
  Plus, 
  Home, 
  Layers, 
  Sparkles, 
  X
} from 'lucide-react';
import { format, parseISO } from '../../utils/dateUtils';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setViewMode, 
    navigateToday, 
    openNewModal, 
    items, 
    openEditModal 
  } = useOmni();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredItems = items.filter(e => 
    e.title.toLowerCase().includes(query.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(query.toLowerCase()))
  );

  const navigationCommands = [
    { label: 'Go to Today', shortcut: 'T', action: () => { navigateToday(); setIsCommandPaletteOpen(false); }, icon: Calendar },
    { label: 'Switch to Day View', shortcut: 'D', action: () => { setViewMode('day'); setIsCommandPaletteOpen(false); }, icon: Clock },
    { label: 'Switch to Week View', shortcut: 'W', action: () => { setViewMode('week'); setIsCommandPaletteOpen(false); }, icon: Calendar },
    { label: 'Switch to Month View', shortcut: 'M', action: () => { setViewMode('month'); setIsCommandPaletteOpen(false); }, icon: Calendar },
    { label: 'Add to Agenda (New Event/Task)', shortcut: 'C', action: () => { setIsCommandPaletteOpen(false); openNewModal(); }, icon: Plus },
  ].filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  const ecosystemModules = [
    { name: 'OMNI Home', desc: 'Central dashboard connecting the ecosystem', icon: Home, status: 'Connected' },
    { name: 'OMNI Space', desc: 'Cloud storage, Notes, Docs, Sheets & Slides', icon: Layers, status: 'Connected' },
    { name: 'OMNI Intelligence', desc: 'AI assistance and intelligent scheduling', icon: Sparkles, status: 'Connected' },
  ].filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.desc.toLowerCase().includes(query.toLowerCase()));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div 
        className="glass-panel w-full max-w-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, search agenda items, or jump across OMNI..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none border-none"
          />
          <button 
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions & Navigation */}
          {navigationCommands.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-1 mt-1">
                {navigationCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={idx}
                      onClick={cmd.action}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-indigo-400" />
                        <span>{cmd.label}</span>
                      </div>
                      <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded text-slate-300 font-mono">
                        {cmd.shortcut}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matching Agenda Items */}
          {query.trim() && filteredItems.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Agenda Items
              </div>
              <div className="space-y-1 mt-1">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsCommandPaletteOpen(false);
                      openEditModal(item);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[9px] px-1 rounded uppercase font-semibold text-slate-400">
                        {item.type}
                      </span>
                      <span className={`truncate ${item.completed ? 'line-through text-slate-400' : ''}`}>
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {format(parseISO(item.startTime), 'MMM d, h:mm a')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ecosystem Links */}
          {ecosystemModules.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Connected OMNI Ecosystem
              </div>
              <div className="space-y-1 mt-1">
                {ecosystemModules.map((m, idx) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-200">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.desc}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {m.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-black/20 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with arrows, Enter to select</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white/5 rounded font-mono">ESC to close</kbd>
        </div>
      </div>
    </div>
  );
};
