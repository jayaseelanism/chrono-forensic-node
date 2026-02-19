
import type { FC } from 'react';
import { X, Clock, FolderTree, Trash2, CheckCircle2 } from 'lucide-react';

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  onFixTimestamps: () => void;
  onOrganize: () => void;
  onRemove: () => void;
}

export const BulkActionBar: FC<BulkActionBarProps> = ({ count, onClear, onFixTimestamps, onOrganize, onRemove }) => {
  return (
    <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-2xl animate-in slide-in-from-bottom-8 duration-500">
      <div className="liquid-glass rounded-[2rem] p-4 lg:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl border-prism-azure/20 ring-1 ring-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClear}
            aria-label="Clear selection"
            title="Clear selection"
            className="w-10 h-10 rounded-xl bg-slate-900/5 dark:bg-white/5 hover:bg-prism-pink/10 hover:text-prism-pink text-slate-500 transition-colors flex items-center justify-center"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col">
            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{count}</p>
            <p className="text-[9px] font-black uppercase text-slate-400 dark:text-white/30 tracking-[0.2em] mt-1">Assets Selected</p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
          <ActionButton 
            onClick={onFixTimestamps} 
            icon={<Clock size={16} />} 
            label="Fix Dates" 
            color="bg-prism-azure" 
          />
          <ActionButton 
            onClick={onOrganize} 
            icon={<FolderTree size={16} />} 
            label="Organize" 
            color="bg-prism-indigo" 
          />
          <ActionButton 
            onClick={onRemove} 
            icon={<Trash2 size={16} />} 
            label="Purge" 
            color="bg-prism-pink" 
          />
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ onClick, icon, label, color }: any) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 ${color} text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);
