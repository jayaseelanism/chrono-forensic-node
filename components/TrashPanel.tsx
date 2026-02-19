
import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { MediaFile } from '../types';
import { Trash2, RotateCcw, AlertCircle, ShieldAlert, Trash, Clock, Info } from 'lucide-react';

interface TrashPanelProps {
  files: MediaFile[];
  onRestore: (fileIds: string[]) => void;
  onPermanentDelete: (fileIds: string[]) => void;
}

export const TrashPanel: FC<TrashPanelProps> = ({ files, onRestore, onPermanentDelete }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const getDaysRemaining = (deletedAt?: number) => {
    if (!deletedAt) return 30;
    const elapsed = Date.now() - deletedAt;
    const remaining = Math.max(0, 30 - Math.floor(elapsed / (24 * 60 * 60 * 1000)));
    return remaining;
  };

  if (files.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-300">
          <Trash2 size={40} />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Trash Node Empty</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NO ASSETS ARE CURRENTLY QUARANTINED.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header id="trash-header" className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-prism-pink/10 text-prism-pink rounded-xl flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Trash Node</h2>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QUARANTINED ASSETS ARE PURGED AFTER 30 DAYS.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={selectedIds.size === 0}
            onClick={() => { onRestore(Array.from(selectedIds)); setSelectedIds(new Set()); }}
            className="px-6 py-4 bg-prism-azure text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center gap-2"
          >
            <RotateCcw size={14} /> Restore Selected ({selectedIds.size})
          </button>
          <button 
            disabled={selectedIds.size === 0}
            onClick={() => { if(confirm("Confirm permanent wipe?")) onPermanentDelete(Array.from(selectedIds)); setSelectedIds(new Set()); }}
            className="px-6 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-30 transition-all active:scale-95 flex items-center gap-2"
          >
            <Trash size={14} /> Wipe Bitstream
          </button>
        </div>
      </header>

      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-600">
        <ShieldAlert size={20} className="shrink-0" />
        <p className="text-[10px] font-black uppercase tracking-widest leading-none">Warning: Permanent deletion cannot be undone once the cache is purged.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {files.map(file => {
          const daysLeft = getDaysRemaining(file.deletedAt);
          return (
            <div
              key={file.id}
              role="button"
              tabIndex={0}
              aria-pressed={selectedIds.has(file.id) ? 'true' : 'false'}
              aria-label={`${selectedIds.has(file.id) ? 'Deselect' : 'Select'} ${file.name}`}
              onClick={() => toggleSelect(file.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSelect(file.id); }}
              className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                selectedIds.has(file.id) ? 'border-prism-azure scale-[0.98]' : 'border-white/10 grayscale-[50%] hover:grayscale-0'
              }`}
            >
              <img src={file.thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <div className={`p-2 rounded-lg ${selectedIds.has(file.id) ? 'bg-prism-azure text-white' : 'bg-white/10 text-white'}`}>
                    {selectedIds.has(file.id) ? <RotateCcw size={20} /> : <Trash2 size={20} />}
                 </div>
              </div>
              <div className="absolute top-2 left-2 right-2 flex justify-between">
                 <div className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[7px] font-black text-white uppercase tracking-widest border border-white/10 flex items-center gap-1">
                    <Clock size={8} /> {daysLeft}D LEFT
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
