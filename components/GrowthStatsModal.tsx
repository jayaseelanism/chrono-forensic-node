
import type { FC } from 'react';
import './generated-utilities.css';
import { TrendingUp, X, BarChart3, PieChart as PieChartIcon, Zap, Target } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { LibraryStats, MediaFile } from '../types';

interface GrowthStatsModalProps {
  stats: LibraryStats;
  files: MediaFile[];
  onClose: () => void;
}

export const GrowthStatsModal: FC<GrowthStatsModalProps> = ({ stats, files, onClose }) => {
  const fileTypes = [
    { name: 'Images', value: files.filter(f => f.type.startsWith('image/')).length, color: '#3b82f6' },
    { name: 'Videos', value: files.filter(f => f.type.startsWith('video/')).length, color: '#8b5cf6' },
    { name: 'Sidecars', value: stats.jsonFilesFound, color: '#f59e0b' },
    { name: 'Others', value: files.filter(f => !f.type.startsWith('image/') && !f.type.startsWith('video/')).length, color: '#94a3b8' },
  ];

  const formatBytes = (bytes: number) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-5xl glass rounded-[4rem] overflow-hidden flex flex-col shadow-2xl border-white/40 h-[85vh]">
        <header className="p-10 border-b border-black/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Growth Projection</h2>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Capacity Planning & Type Distribution</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close growth stats" title="Close" className="p-4 glass rounded-2xl hover:bg-white transition-all text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Composition Chart */}
            <div className="glass rounded-[2.5rem] p-8 border-white/60">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <PieChartIcon size={14} /> Library Composition
              </h3>
              <div className="h-64 flex items-center gap-8">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={fileTypes} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                        {fileTypes.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {fileTypes.map((type, idx) => (
                    <div key={type.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full dot-${idx}`} />
                        <span className="font-bold text-slate-600">{type.name}</span>
                      </div>
                      <span className="font-black text-slate-900">{type.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Projected Savings */}
            <div className="glass rounded-[2.5rem] p-8 border-white/60 flex flex-col justify-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Zap size={14} /> Optimization Efficiency
              </h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Current Footprint</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatBytes(stats.totalSize)}</p>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <p className="text-sm font-black text-emerald-600 uppercase tracking-tight">Projected Footprint</p>
                    <p className="text-2xl font-black text-emerald-600 tracking-tighter">{formatBytes(stats.totalSize - stats.optimizedSize)}</p>
                  </div>
                  <div className="h-4 bg-emerald-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-emerald-500 ${(() => {
                        const pct = Math.round(((stats.totalSize - stats.optimizedSize) / stats.totalSize) * 100);
                        const rounded = Math.max(0, Math.min(100, Math.round(pct / 5) * 5));
                        return `w-p-${rounded}`;
                      })()}`} />
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-emerald-50 rounded-2xl flex items-center gap-4 text-emerald-700 font-bold text-sm">
                <Target size={20} />
                Potential to recover {formatBytes(stats.optimizedSize)} in redundant storage.
              </div>
            </div>
          </div>

          {/* Bar Chart Type Breakdown */}
          <div className="glass rounded-[3rem] p-10 border-white/60">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2">
              <BarChart3 size={14} /> Type Breakdown per Logic Node
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fileTypes}>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {fileTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <footer className="p-10 border-t border-black/5 bg-slate-50/50 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl active:scale-95 shadow-indigo-200"
          >
            Export Distribution Report
          </button>
        </footer>
      </div>
    </div>
  );
};
