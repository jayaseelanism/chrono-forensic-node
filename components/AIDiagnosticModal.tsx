
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Cpu, X, Loader2, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { generateDiagnostic } from '../services/aiService';
import { LibraryStats } from '../types';

interface AIDiagnosticModalProps {
  stats: LibraryStats;
  onClose: () => void;
}

export const AIDiagnosticModal: FC<AIDiagnosticModalProps> = ({ stats, onClose }) => {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        const result = await generateDiagnostic(stats);
        setReport(result || "Diagnostic failed to generate. No signal received.");
      } catch (err) {
        setReport("Critical link failure. Ensure Intelligence Node is active.");
      } finally {
        setIsLoading(false);
      }
    };
    runDiagnostic();
  }, [stats]);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-3xl glass rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border-white/40">
        <header className="p-8 border-b border-black/5 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center shadow-lg border border-blue-500/20">
              <Cpu size={28} className={isLoading ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight leading-none">Forensic Intelligence Audit</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Intelligence Layer v4.1 • Active Link</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close diagnostic modal" title="Close" className="p-3 bg-white/10 rounded-xl hover:bg-white hover:text-slate-950 transition-all text-slate-400 border border-white/10">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 p-10 overflow-y-auto max-h-[60vh] scrollbar-hide bg-slate-50/30">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-6">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <div>
                <p className="text-slate-950 font-black text-xl tracking-tight">Analyzing Library Entropy...</p>
                <p className="text-slate-600 font-medium text-sm mt-1 tracking-tight">Gemini 3 Flash is processing your library signatures across the physical node.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-5 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 shadow-sm">
                <ShieldCheck className="text-blue-700 shrink-0" size={28} />
                <p className="text-sm font-bold text-slate-900 leading-relaxed tracking-tight">
                  Forensic audit complete. Intelligence suggests a library integrity score of <span className="text-blue-700 font-black text-lg">{(100 - (stats.duplicatesFound / (stats.totalFiles || 1) * 100)).toFixed(0)}%</span>.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Detailed Forensic Assessment</h3>
                <div className="prose prose-slate max-w-none">
                  {report?.split('\n').map((line, i) => (
                    <p key={i} className="text-slate-900 font-bold leading-relaxed mb-4 text-sm tracking-tight">{line}</p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                  <Activity size={20} className="text-blue-600 mb-3" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Metadata Variance</p>
                  <p className="text-3xl font-black text-slate-950 mt-2 tracking-tighter leading-none">{stats.timeIssuesFound}</p>
                </div>
                <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
                  <AlertCircle size={20} className="text-amber-600 mb-3" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Redundancy Density</p>
                  <p className="text-3xl font-black text-slate-950 mt-2 tracking-tighter leading-none">{((stats.duplicatesFound / (stats.totalFiles || 1)) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="p-8 border-t border-black/5 bg-slate-50/80">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-2xl active:scale-95 border border-white/10"
          >
            Acknowledge Forensic Report
          </button>
        </footer>
      </div>
    </div>
  );
};
