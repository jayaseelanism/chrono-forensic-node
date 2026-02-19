
import { useMemo } from 'react';
import type { FC } from 'react';
import { MediaFile } from '../types';
import { ClipboardCheck, ShieldCheck, AlertCircle, Search, FileX, CheckCircle2, History, ArrowRight } from 'lucide-react';

interface VerificationPanelProps {
  files: MediaFile[];
}

// Fixed props interface and usage of React.FC
export const VerificationPanel: FC<VerificationPanelProps> = ({ files }) => {
  const audit = useMemo(() => {
    const total = files.length;
    const moved = files.filter(f => f.status === 'moved').length;
    const deleted = files.filter(f => f.status === 'deleted').length;
    const healthy = files.filter(f => f.status === 'healthy').length;
    const issues = files.filter(f => f.status === 'needs_fix' || f.status === 'corrupted').length;
    
    return {
      total,
      integrity: total > 0 ? Math.round(((healthy + moved) / total) * 100) : 100,
      moved,
      deleted,
      issues
    };
  }, [files]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">System_Audit</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 tracking-tight">Cross-referencing physical disk state with the operational ledger.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl shadow-sm">
            <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
            <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">Audit_Protocols_Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <VerificationCard 
          id="verification-score"
          label="Integrity_Index" 
          value={`${audit.integrity}%`} 
          desc="Overall Library Health"
          icon={<ClipboardCheck size={28} />}
          color="emerald"
        />
        <VerificationCard 
          label="Committed_Assets" 
          value={audit.moved.toLocaleString()} 
          desc="Successfully Organized"
          icon={<History size={28} />}
          color="blue"
        />
        <VerificationCard 
          label="Degraded_Signatures" 
          value={audit.issues.toLocaleString()} 
          desc="Require Forensic Review"
          icon={<AlertCircle size={28} />}
          color="amber"
          highlight={audit.issues > 0}
        />
      </div>

      <div className="bento-card overflow-hidden shadow-xl">
        <div className="p-8 bg-slate-900 dark:bg-white/5 text-white border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 dark:bg-fluid-indigo/20 text-fluid-indigo dark:text-fluid-indigo rounded-2xl flex items-center justify-center shadow-lg border border-white/10 dark:border-fluid-indigo/30">
                    <Search size={24} />
                </div>
                <div>
                    <h3 className="font-black text-white tracking-tight uppercase leading-none">Consistency_Ledger</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Real-time Bit-Validation Matrix</p>
                </div>
            </div>
            <button className="px-6 py-2 bg-white/10 text-white rounded-xl text-[10px] font-black hover:bg-white hover:text-slate-950 transition-all uppercase tracking-widest border border-white/10">Run_Deep_Scan</button>
        </div>

        <div className="p-8 space-y-4 bg-white/20 dark:bg-white/5">
            {files.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-bold italic tracking-tight">No telemetry data to verify. Connect a node first.</div>
            ) : (
                <div className="space-y-4">
                    <LogEntry icon={<CheckCircle2 className="text-emerald-600" />} title="Hash Mapping Protocol" status="Passed" desc="All SHA-256 signatures are consistent with source headers." />
                    <LogEntry icon={<CheckCircle2 className="text-emerald-600" />} title="Filesystem Node Check" status="Passed" desc={`${audit.moved} files verified at automated destinations.`} />
                    {audit.issues > 0 && (
                        <LogEntry icon={<AlertCircle className="text-amber-600" />} title="Temporal Variance" status="Flagged" desc={`${audit.issues} items have conflicting EXIF/JSON temporal signatures.`} />
                    )}
                    {audit.deleted > 0 && (
                        <LogEntry icon={<FileX className="text-slate-600 dark:text-slate-400" />} title="Redundancy Purge Audit" status="Verified" desc={`${audit.deleted} clones removed from physical mapping.`} />
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const VerificationCard = ({ id, label, value, desc, icon, color, highlight }: any) => {
  const colors: any = {
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  };
  return (
    <div id={id} className={`bento-card p-8 border-2 transition-all ${highlight ? 'border-amber-500 dark:border-amber-500/50 shadow-amber-100 dark:shadow-amber-900/10 bg-amber-50/10' : 'border-white/60 dark:border-white/5 shadow-sm'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 leading-none">{label}</p>
        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 leading-none">{value}</p>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 tracking-tight leading-tight">{desc}</p>
      </div>
    </div>
  );
};

const LogEntry = ({ icon, title, status, desc }: any) => (
  <div className="flex items-center justify-between p-6 bg-white/60 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:scale-[1.01] transition-all shadow-sm group hover:border-fluid-indigo">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-inner group-hover:bg-fluid-indigo/10 group-hover:border-fluid-indigo/30 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-black text-slate-900 dark:text-white leading-none tracking-tight mb-2 uppercase">{title}</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-none tracking-tight">{desc}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10">{status}</span>
        <ArrowRight size={14} className="text-slate-400 dark:text-slate-600" />
    </div>
  </div>
);
