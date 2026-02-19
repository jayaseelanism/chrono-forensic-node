
import type { FC } from 'react';
import { AppView, UserTier } from '../types';
import { NAVIGATION_ITEMS } from '../constants';
import { X, Crown, Power, Terminal } from 'lucide-react';

interface SidebarProps {
  activeView: AppView;
  tier: UserTier;
  onViewChange: (view: AppView) => void;
  onUpgradeClick: () => void;
  onReset: () => void;
  onOpenHelp: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export const Sidebar: FC<SidebarProps> = ({ activeView, tier, onViewChange, onUpgradeClick, onReset, onOpenHelp, onClose, isMobile }) => {
  return (
    <div className={`
      ${isMobile ? 'fixed inset-y-0 left-0 w-64 z-[100]' : 'w-16 hover:w-64'}
      bg-[#050505] border-r border-white/5 flex flex-col transition-all duration-300 group z-50 overflow-hidden
    `}>
      {/* Technical Brand Area */}
      <div className="h-16 flex items-center px-4 shrink-0 border-b border-white/5 bg-white/5">
        <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center text-white font-black shrink-0">
          C
        </div>
        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <span className="mono font-bold text-xs tracking-widest">CHRONO_NODE</span>
        </div>
      </div>

      <div className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as AppView)}
            aria-label={item.label}
            title={item.label}
            className={`w-full flex items-center px-4 py-4 transition-all relative ${
              activeView === item.id 
                ? 'bg-indigo-600/10 text-indigo-400' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className={`shrink-0 transition-all ${activeView === item.id ? 'scale-110' : ''}`}>
              {item.icon}
            </div>
            <span className="ml-6 mono text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {item.label}
            </span>
            {activeView === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500" />
            )}
          </button>
        ))}
      </div>

      <div className="p-3 mt-auto space-y-2">
        <button 
          onClick={onUpgradeClick}
          aria-label="Upgrade Node"
          title="Upgrade Node"
          className="w-full flex items-center gap-4 p-2.5 rounded-sm bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all overflow-hidden"
        >
          <Crown size={20} className="shrink-0" />
          <span className="mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Upgrade Node</span>
        </button>
        <button 
          onClick={onReset}
          aria-label="Disconnect"
          title="Disconnect"
          className="w-full flex items-center gap-4 p-2.5 rounded-sm text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all overflow-hidden"
        >
          <Power size={20} className="shrink-0" />
          <span className="mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Disconnect</span>
        </button>
      </div>
    </div>
  );
};
