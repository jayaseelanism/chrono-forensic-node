import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { MediaFile } from '../types';
import { 
  Calendar, ChevronRight, Check, RotateCcw, AlertCircle, 
  History, Sparkles, Database, FileCheck, Layers, Info, ShieldCheck, 
  Trash2, SearchCode, Zap, ChevronDown
} from 'lucide-react';

interface RecoveryPanelProps {
  files: MediaFile[];
  onApplyFix: (fileIds: string[]) => void;
}

export const RecoveryPanel: FC<RecoveryPanelProps> = ({ files, onApplyFix }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'timestamps' | 'collisions'>('timestamps');

  // Logic: Missing timestamps OR corrupted metadata
  const issues = useMemo(() => files.filter(f => f.status === 'needs_fix' || !f.capturedDate), [files]);

  // Logic: Duplicate collisions needing Master identification
  const collisions = useMemo(() => {
    const map = new Map<string, MediaFile[]>();
    files.forEach(f => {
      if (f.status === 'duplicate' && f.duplicateOf) {
        if (!map.has(f.duplicateOf)) {
          const p = files.find(item => item.id === f.duplicateOf);
          if (p) map.set(f.duplicateOf, [p]);
        }
        map.get(f.duplicateOf)?.push(f);
      }
    });
    return Array.from(map.entries()).map(([id, group]) => {
      // MASTER RULE: OLDEST TIMESTAMP -> LARGEST BIT-DENSITY (SIZE)
      const master = [...group].sort((a, b) => {
        if (a.lastModified !== b.lastModified) return a.lastModified - b.lastModified;
        return b.size - a.size;
      })[0];
      return { id, master, group };
    });
  }, [files]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleFixSelected = () => {
    onApplyFix(Array.from(selected));
    setSelected(new Set());
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in slide-in-from-bottom-8 duration-500 pb-32">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-10 px-1 sm:px-0">
        <div>
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Repair_Hub</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 sm:mt-3 tracking-tight max-w-2xl">
            Detecting and resolving chronological collisions. Identifying Archive Masters based on quality and historical priority.
          </p>
        </div>
        
        <button 
          onClick={handleFixSelected}
          disabled={selected.size === 0}
          className="w-full lg:w-auto px-6 sm:px-12 py-4 sm:py-5 bg-fluid-indigo text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl disabled:opacity-30 flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw size={16} /> Commit Repairs ({selected.size})
        </button>
      </header>

      <div className="flex p-0.5 sm:p-1 bg-slate-100 dark:bg-white/5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 w-fit">
        <TabBtn active={activeTab === 'timestamps'} onClick={() => setActiveTab('timestamps')} label="Temporal Drift" count={issues.length} />
        <TabBtn active={activeTab === 'collisions'} onClick={() => setActiveTab('collisions')} label="Duplicate Collisions" count={collisions.length} />
      </div>

      {activeTab === 'timestamps' ? (
        <div className="bento-card overflow-hidden">
           <div className="overflow-x-auto scrollbar-none">
             <table className="w-full text-left border-collapse min-w-[600px]">
               <thead className="bg-slate-900 text-white">
                 <tr>
                   <th className="px-6 sm:px-10 py-4 sm:py-6 w-16 text-center">
                     <input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(issues.map(i => i.id)) : new Set())} />
                   </th>
                   <th className="px-4 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Asset Node</th>
                   <th className="px-4 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Drift</th>
                   <th className="px-4 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Repair</th>
                   <th className="px-4 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-transparent">
                 {issues.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="py-24 sm:py-32 text-center text-slate-400 font-bold italic text-sm">No temporal drift detected.</td>
                   </tr>
                 ) : (
                   issues.map(file => (
                    <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 sm:px-10 py-4 text-center">
                        <input aria-label={`Select ${file.name}`} type="checkbox" checked={selected.has(file.id)} onChange={() => toggleSelect(file.id)} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
                            <img src={file.thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="max-w-[120px] sm:max-w-[150px]">
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate leading-none mb-1">{file.name}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 line-through tracking-tight">
                          {new Date(file.lastModified).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <ChevronRight size={12} className="text-slate-300 hidden sm:block" />
                          <div className="px-2 sm:px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                            <span className="text-[9px] sm:text-xs font-black tracking-tight">{file.suggestedDate ? new Date(Number(file.suggestedDate)).toLocaleDateString() : 'Analyzing...'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button aria-label={`Apply repair to ${file.name}`} onClick={() => onApplyFix([file.id])} className="p-2 sm:p-3 bg-white dark:bg-white/10 rounded-lg hover:bg-emerald-500 hover:text-white transition-all border border-slate-200 dark:border-white/10 shadow-sm">
                          <Check size={16} strokeWidth={3} />
                        </button>
                      </td>
                    </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-12">
             {collisions.map((collision, idx) => (
             <div key={collision.id} className={`bento-card overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all hover:border-fluid-indigo/30 animate-in slide-in-from-bottom-8 ${(() => {
               const delay = Math.min(1000, idx * 50);
               return `anim-delay-50-${delay}`;
             })()}`}>
                <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-100 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Layers size={12} className="text-fluid-indigo" />
                        <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400">Cluster: {collision.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{collision.group.length} Collision Signatures</h3>
                   </div>
                   <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 bg-slate-50 dark:bg-white/5 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-white/10">
                      <div className="p-1.5 sm:p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                        {/* Fix: Removed non-existent sm prop */}
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <p className="text-[7px] sm:text-[8px] font-black uppercase text-slate-400 mb-0.5">Identified Archive Master</p>
                        <p className="text-[10px] sm:text-xs font-black text-emerald-600 truncate max-w-[120px] sm:max-w-[150px]">{collision.master.name}</p>
                      </div>
                   </div>
                </div>
                
                <div className="p-6 sm:p-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                   {collision.group.map(f => (
                    <div key={f.id} role="button" tabIndex={0} aria-label={`Select ${f.name}`} className={`group relative p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-all ${f.id === collision.master.id ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-500 shadow-xl' : 'bg-slate-50 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100'}`}>
                      <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 border border-black/5">
                        <img src={f.thumbnailUrl} alt={f.name} className="w-full h-full object-cover" />
                      </div>
                        <div className="space-y-2 sm:space-y-3">
                           <div className="flex justify-between items-center">
                              <p className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white truncate max-w-[80px] sm:max-w-[120px]">{f.name}</p>
                              {f.id === collision.master.id ? (
                                <Sparkles size={12} className="text-emerald-500 animate-pulse" />
                              ) : (
                                <History size={12} className="text-slate-300" />
                              )}
                           </div>
                           <div className="space-y-1">
                             <div className="flex justify-between text-[7px] sm:text-[9px] font-black uppercase">
                                <span className="text-slate-400">Timeline</span>
                                <span className={f.id === collision.master.id ? 'text-emerald-600' : 'text-slate-500'}>{new Date(f.lastModified).toLocaleDateString()}</span>
                             </div>
                             <div className="flex justify-between text-[7px] sm:text-[9px] font-black uppercase">
                                <span className="text-slate-400">Density</span>
                                <span className={f.id === collision.master.id ? 'text-emerald-600' : 'text-slate-500'}>{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                             </div>
                           </div>
                        </div>

                        {f.id === collision.master.id && (
                          <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-[7px] font-black uppercase rounded shadow-lg border border-white/20">
                            Master
                          </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 sm:gap-4 ${
      active 
        ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xl border border-slate-200 dark:border-white/10' 
        : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    {label}
    {count > 0 && <span className={`px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] ${active ? 'bg-fluid-indigo text-white shadow-lg' : 'bg-slate-200 dark:bg-white/10'}`}>{count}</span>}
  </button>
);