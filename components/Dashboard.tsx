import type { FC } from 'react';
import { LibraryStats, MediaFile } from '../types';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { Sparkles, Database, LayoutGrid, Zap, ArrowUpRight, Upload } from 'lucide-react';

interface DashboardProps {
  stats: LibraryStats;
  files: MediaFile[];
  activityLog: { id: string, timestamp: string, message: string, type: string }[];
  onReset: () => void;
  onAIDiagnostic: () => void;
  onGrowthStats: () => void;
}

export const Dashboard: FC<DashboardProps> = ({ stats, files, activityLog, onReset, onAIDiagnostic, onGrowthStats }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  const chartData = [
    { name: 'Mon', val: 1200 }, { name: 'Tue', val: 2100 }, { name: 'Wed', val: 1800 },
    { name: 'Thu', val: 2400 }, { name: 'Fri', val: 2800 }, { name: 'Sat', val: 3200 },
    { name: 'Sun', val: stats.totalFiles || 4000 },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
        
        {/* Welcome Card - Dynamic sizing for all viewports */}
        <div className="md:col-span-2 lg:col-span-4 bento-card p-6 sm:p-12 flex flex-col justify-between overflow-hidden relative group min-h-[250px] sm:min-h-[350px] lg:min-h-[400px]">
          <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
            <Sparkles size={180} className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 sm:mb-8 leading-tight">Your Archive,<br/><span className="text-fluid-indigo">Perfectly Fluid.</span></h1>
            <p className="text-xs sm:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">The core node is active. All forensic signatures are currently synced and verified across the network.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 relative z-10">
            <button onClick={onAIDiagnostic} className="px-6 py-4 sm:px-10 sm:py-5 bg-fluid-indigo text-white rounded-xl sm:rounded-3xl font-black text-[10px] sm:text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 sm:gap-3">
              Neural Audit <ArrowUpRight size={18} />
            </button>
            <button onClick={onReset} className="px-6 py-4 sm:px-10 sm:py-5 bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-3xl font-black text-[10px] sm:text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2 sm:gap-3">
              Add More <Upload size={18} />
            </button>
          </div>
        </div>

        {/* Stats Grid - Adjusts for tablets */}
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
          <div className="bento-card p-6 sm:p-8 flex flex-col justify-between min-h-[160px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-white/5 text-fluid-indigo flex items-center justify-center border border-indigo-100 dark:border-white/10">
              <LayoutGrid size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="mt-4 sm:mt-8">
              <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[9px] sm:text-[11px] tracking-widest mb-1">Total Assets</p>
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">{stats.totalFiles.toLocaleString()}</h2>
            </div>
          </div>

          <div className="bento-card p-6 sm:p-8 flex flex-col justify-between min-h-[160px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-50 dark:bg-white/5 text-fluid-violet flex items-center justify-center border border-violet-100 dark:border-white/10">
              <Database size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="mt-4 sm:mt-8">
              <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[9px] sm:text-[11px] tracking-widest mb-1">Vault Size</p>
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none truncate">
                {formatBytes(stats.totalSize).split(/(\D+)/)[0]}
                <span className="text-lg sm:text-2xl ml-1 sm:ml-2 text-slate-400 dark:text-slate-500">{formatBytes(stats.totalSize).replace(/[0-9.]/g, '')}</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Growth & Activity - Full width on mobile/tablet, 4-col on XL */}
        <div className="md:col-span-2 lg:col-span-4 bento-card p-6 sm:p-12 min-h-[300px] sm:min-h-[350px] flex flex-col">
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[9px] sm:text-[11px] tracking-widest leading-none">Growth Telemetry</p>
            <div className="px-3 py-1 sm:px-4 sm:py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[8px] sm:text-[10px] font-black border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-widest">Operational</div>
          </div>
          <div className="flex-1 -mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 15px 40px rgba(0,0,0,0.1)', 
                    fontSize: '11px', 
                    fontWeight: '900',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    textTransform: 'uppercase'
                  }}
                />
                <Area type="monotone" dataKey="val" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar stats/redundancy */}
        <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-4 sm:gap-6 lg:gap-8">
          <div className="bento-card p-6 sm:p-8 flex flex-col justify-between flex-1 min-h-[200px]">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center border border-red-100 dark:border-red-900/20 shrink-0">
                    <Zap size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white uppercase leading-none">Redundancy</h3>
                </div>
                <button onClick={onGrowthStats} aria-label="View growth stats" title="View growth stats" className="text-slate-400 hover:text-fluid-indigo transition-colors p-2">
                  <ArrowUpRight size={20} className="sm:w-6 sm:h-6" />
                </button>
             </div>
             <div className="mt-6 sm:mt-8">
                <h2 className={`text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter ${stats.duplicatesFound > 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'} leading-none`}>
                  {stats.duplicatesFound}
                </h2>
                <p className="text-[9px] sm:text-[11px] font-black uppercase text-slate-400 tracking-widest mt-2">Collision Nodes Identified</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};