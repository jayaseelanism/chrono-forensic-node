import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { MediaFile, UserSettings } from '../types';
import { 
  FolderTree, CheckCircle2, SearchCode, Loader2, CalendarRange, 
  ChevronDown, ChevronRight, ShieldAlert, FolderPlus, Info
} from 'lucide-react';

interface OrganizePanelProps {
  files: MediaFile[];
  jsonCount: number;
  onExecute: () => void;
  settings: UserSettings;
  onSettingsChange: (newSettings: UserSettings) => void;
  onUpgradeClick: () => void;
}

export const OrganizePanel: FC<OrganizePanelProps> = ({ files, jsonCount, onExecute, settings, onSettingsChange, onUpgradeClick }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [hasConfirmedSafety, setHasConfirmedSafety] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  const toggleYear = (year: string) => {
    const next = new Set(expandedYears);
    if (next.has(year)) next.delete(year);
    else next.add(year);
    setExpandedYears(next);
  };

  const hierarchy = useMemo(() => {
    const tree: Record<string, Record<string, number>> = {};
    files.forEach(f => {
      const parts = (f.proposedPath || "Unknown/Unknown").split('/');
      const year = parts[0];
      const month = parts[1];
      if (!tree[year]) tree[year] = {};
      tree[year][month] = (tree[year][month] || 0) + 1;
    });
    return tree;
  }, [files]);

  const sortedYears = Object.keys(hierarchy).sort().reverse();

  const handleDeepAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleRun = () => {
    if (settings.tier === 'free' && files.length > 2000) {
      onUpgradeClick();
      return;
    }
    if (!isDryRun && !hasConfirmedSafety) return;
    
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      onExecute();
    }, 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in slide-in-from-right duration-500 pb-32">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-1 sm:px-0">
        <div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Structure_Automator</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 tracking-tight">Deep metadata analysis for archival Year/Month organization.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-white/50 dark:bg-white/5 p-2 sm:p-3 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-xl">
          <button 
            onClick={handleDeepAnalysis}
            disabled={isAnalyzing}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              isAnalyzing ? 'bg-fluid-violet/20 text-fluid-violet animate-pulse' : 'bg-fluid-violet text-white shadow-lg'
            }`}
          >
            {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <SearchCode size={12} />}
            Analysis
          </button>

          <button
            onClick={handleRun}
            disabled={isExecuting || (!isDryRun && !hasConfirmedSafety)}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
              isDryRun ? 'bg-amber-600 shadow-amber-200' : 'bg-slate-900 dark:bg-white dark:text-slate-900 shadow-2xl'
            }`}
          >
            {isExecuting ? '...' : isDryRun ? 'Simulate' : 'Execute'}
          </button>
        </div>
      </header>

      {isAnalyzing && (
        <div className="bento-card p-6 sm:p-12 bg-fluid-violet/5 border-fluid-violet/20 animate-in zoom-in-95">
           <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4 text-fluid-violet">
                {/* Fix: Removed non-existent sm prop and adjusted size */}
                <CalendarRange size={32} className="animate-bounce" />
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-center">Synthesizing Archive Tree</h3>
              </div>
              <div className="w-full max-w-xl h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-fluid-violet shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 ${(() => {
                    const p = Math.max(0, Math.min(100, Math.round(analysisProgress)));
                    const rounded = Math.round(p / 5) * 5;
                    return `w-p-${rounded}`;
                  })()}`} />
              </div>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Processing chronological properties • {analysisProgress}%</p>
           </div>
        </div>
      )}

      {!isDryRun && (
        <div className="p-4 sm:p-8 bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="flex items-center gap-3 sm:gap-5">
              {/* Fix: Removed non-existent sm prop and adjusted size */}
              <ShieldAlert className="text-amber-500 shrink-0" size={28} />
              <p className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-500">Warning: Reorganizing will permanently move local files.</p>
           </div>
           <label className="flex items-center justify-between sm:justify-start gap-3 cursor-pointer p-3 sm:p-4 bg-white/50 dark:bg-white/5 rounded-xl sm:rounded-2xl border border-white/20">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Authorize</span>
              <input type="checkbox" checked={hasConfirmedSafety} onChange={e => setHasConfirmedSafety(e.target.checked)} className="rounded" />
           </label>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
           <div className="bento-card p-6 sm:p-8 space-y-6 sm:space-y-8">
              <h3 className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest">Audit Summary</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                <AuditStat label="Total Nodes" value={files.length} color="text-fluid-indigo" />
                <AuditStat label="Years Detected" value={sortedYears.length} color="text-emerald-500" />
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 bento-card overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 sm:px-10 py-4 sm:py-6 bg-slate-900 dark:bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
            <h3 className="text-[8px] sm:text-[10px] font-black text-white/70 uppercase tracking-widest">Proposed Archive Tree (YYYY / MM)</h3>
          </div>
          <div className="p-4 sm:p-10 flex-1 overflow-y-auto max-h-[500px] space-y-3 sm:space-y-4 scrollbar-none">
            {sortedYears.length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                  {/* Fix: Removed non-existent sm prop and adjusted size */}
                  <FolderTree size={48} className="opacity-20 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No mapping generated.</p>
               </div>
            ) : sortedYears.map(year => (
              <div key={year} className="space-y-2">
                <button 
                  onClick={() => toggleYear(year)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-white/5 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-white/10 hover:border-fluid-indigo transition-all group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-fluid-indigo">{expandedYears.has(year) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
                    <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tighter">{year}</span>
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{Object.keys(hierarchy[year]).length} Months</span>
                </button>
                
                {expandedYears.has(year) && (
                  <div className="pl-6 sm:pl-12 space-y-2 animate-in slide-in-from-left-4">
                    {Object.entries(hierarchy[year]).sort().map(([month, count]) => (
                      <div key={month} className="flex items-center justify-between p-3 sm:p-4 border-l-2 border-slate-200 dark:border-white/10 hover:border-fluid-indigo transition-all group">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <FolderTree size={14} className="text-slate-400 group-hover:text-fluid-indigo" />
                          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{month.replace(/^\d+_/, '')}</span>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded-lg text-[8px] sm:text-[10px] font-black text-slate-500 uppercase">{count} Assets</span>
                          <CheckCircle2 size={14} className="text-emerald-500 opacity-20 group-hover:opacity-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AuditStat = ({ label, value, color }: any) => (
  <div className="space-y-1">
    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
    <p className={`text-2xl sm:text-4xl font-black tracking-tighter leading-none ${color}`}>{value}</p>
  </div>
);