
import type { FC } from 'react';
import { AppView, UserTier } from '../types';
import { NAVIGATION_ITEMS } from '../constants';
import { ShieldCheck } from 'lucide-react';

interface NavigationProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  onReset: () => void;
  onUpgrade: () => void;
  tier: UserTier;
}

export const Navigation: FC<NavigationProps> = ({ activeView, onViewChange, onReset, onUpgrade, tier }) => {
  return (
    <div className="fixed bottom-4 sm:bottom-8 left-0 right-0 px-4 sm:px-6 flex justify-center z-[200] pointer-events-none pb-[var(--sab)]">
      <nav className="glass-dock p-1.5 sm:p-2 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center gap-1 sm:gap-2 pointer-events-auto max-w-full lg:max-w-4xl overflow-x-auto scrollbar-none shadow-2xl">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-nowrap px-1">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as AppView)}
              aria-label={item.label}
              title={item.label}
              className={`group relative p-2.5 sm:p-4 rounded-xl sm:rounded-[1.5rem] transition-all duration-300 shrink-0 ${
                activeView === item.id 
                  ? 'bg-fluid-indigo text-white shadow-lg scale-105' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10'
              }`}
            >
              <div className="sm:scale-100 scale-90">
                {item.icon}
              </div>
              
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 pointer-events-none z-[210] hidden lg:block">
                <span className="block px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-void text-[9px] font-black rounded-xl scale-50 opacity-0 translate-y-8 group-hover:scale-100 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap shadow-2xl border border-white/10 dark:border-black/10 uppercase tracking-[0.2em]">
                  {item.label}
                </span>
                <div className="w-2 h-2 bg-slate-900 dark:bg-white rotate-45 mx-auto -mt-1 scale-50 opacity-0 translate-y-8 group-hover:scale-100 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 border-r border-b border-white/10 dark:border-black/10" />
              </div>
            </button>
          ))}
          
          <div className="w-px h-6 sm:h-8 bg-slate-200 dark:bg-white/10 mx-1 sm:mx-2 shrink-0" />
          
          <button 
            onClick={onUpgrade}
            aria-label="Tier Status"
            title="Tier Status"
            className={`group relative p-2.5 sm:p-4 rounded-xl sm:rounded-[1.5rem] transition-all shrink-0 ${
              tier === 'pro' 
                ? 'text-fluid-violet bg-fluid-violet/10' 
                : 'text-slate-400 hover:text-fluid-indigo'
            }`}
          >
            <div className="sm:scale-100 scale-90">
              <ShieldCheck size={20} />
            </div>
            
            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 pointer-events-none z-[210] hidden lg:block">
              <span className="block px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-void text-[9px] font-black rounded-xl scale-50 opacity-0 translate-y-8 group-hover:scale-100 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap shadow-2xl border border-white/10 dark:border-black/10 uppercase tracking-[0.2em]">
                Tier_Status
              </span>
              <div className="w-2 h-2 bg-slate-900 dark:bg-white rotate-45 mx-auto -mt-1 scale-50 opacity-0 translate-y-8 group-hover:scale-100 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 border-r border-b border-white/10 dark:border-black/10" />
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
};
