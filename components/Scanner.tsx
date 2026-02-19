import { useRef, useState } from 'react';
import type { FC } from 'react';
import { FolderOpen, Files, Zap, Loader2, Activity, Database, ShieldCheck } from 'lucide-react';
import { quickProcess } from '../services/mediaEngine';
import { MediaFile, UserTier } from '../types';

interface ScannerProps {
  tier: UserTier;
  onFilesProcessed: (newFiles: MediaFile[], folderName: string, jsonCount: number) => void;
  onLimitReached: () => void;
  onGoToRecovery: () => void;
  onLog: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  hasIssues: boolean;
}

export const Scanner: FC<ScannerProps> = ({ tier, onFilesProcessed, onLimitReached, onGoToRecovery, onLog, hasIssues }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [lastFileName, setLastFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[], rootName: string) => {
    if (!files || files.length === 0) return;
    setIsScanning(true);
    setDiscoveredCount(0);
    const start = Date.now();
    onLog(`QUANTUM_INTAKE_ACTIVE: ANALYZING_VECTORS`, 'info');

    const fileArray = Array.from(files);
    const mediaFiles = fileArray.filter(f => 
      f.type.startsWith('image/') || 
      f.type.startsWith('video/') || 
      f.name.match(/\.(jpg|jpeg|png|gif|mp4|mov|heic|webp)$/i)
    );
    
    const totalCount = mediaFiles.length;
    const processedResults: MediaFile[] = [];
    
    const BATCH_SIZE = 250;
    for (let i = 0; i < totalCount; i += BATCH_SIZE) {
      const batch = mediaFiles.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(file => quickProcess(file)));
      processedResults.push(...results);
      
      if (i % 500 === 0 || i + BATCH_SIZE >= totalCount) {
        setDiscoveredCount(processedResults.length);
        setLastFileName(batch[batch.length - 1].name);
      }

      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const duration = (Date.now() - start) / 1000;
    onLog(`SYNC_COMPLETE: ${totalCount} NODES AT ${(totalCount / duration).toFixed(0)} Hz`, 'success');
    
    onFilesProcessed(processedResults, rootName, 0);
    setIsScanning(false);
  };

  return (
    <div className="w-full flex flex-col items-center py-8 sm:py-16 px-4 sm:px-8 bg-white dark:bg-void transition-all duration-500">
      <div className="max-w-4xl w-full flex flex-col items-center gap-8 lg:gap-16">
        
        {isScanning ? (
          <div className="w-full space-y-10 lg:space-y-20 animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="relative inline-block">
               <div className="w-32 h-32 sm:w-64 sm:h-64 rounded-[2.5rem] sm:rounded-[4.5rem] border-4 border-slate-100 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl bg-slate-50 dark:bg-white/5">
                  <div className="absolute inset-0 bg-gradient-to-tr from-fluid-indigo/30 to-transparent animate-pulse" />
                  <Loader2 className="animate-spin text-fluid-indigo mb-2 sm:mb-4 w-12 h-12 sm:w-20 sm:h-20" strokeWidth={2.5} />
                  <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Node_Sync</span>
               </div>
               <div className="absolute -bottom-2 -right-2 sm:-bottom-8 sm:-right-8 bg-emerald-500 text-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-white dark:border-void animate-bounce">
                  <Zap size={20} className="sm:w-8 sm:h-8" />
               </div>
            </div>

            <div className="space-y-4 px-4 overflow-hidden">
              <h2 className="text-6xl sm:text-8xl lg:text-[10rem] font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none truncate w-full">
                {discoveredCount.toLocaleString()}
              </h2>
              <p className="text-[10px] sm:text-[12px] font-black uppercase text-fluid-indigo tracking-[0.3em] sm:tracking-[0.6em]">High-Velocity Processing</p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 sm:gap-20 px-4">
               <Stat icon={<Activity size={24} />} label="IOPS" value="Max" />
               <Stat icon={<Database size={24} />} label="Sync" value="Stable" />
            </div>
          </div>
        ) : (
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files, "DRAG_DROP"); }}
            className={`w-full bento-card p-6 sm:p-16 lg:p-24 flex flex-col items-center gap-10 sm:gap-16 transition-all duration-700 relative overflow-hidden ${
              isDragging ? 'scale-[1.02] border-fluid-indigo bg-indigo-50 dark:bg-indigo-900/10 shadow-2xl' : 'shadow-xl'
            }`}
          >
            <div className={`w-24 h-24 sm:w-48 sm:h-48 rounded-[2rem] sm:rounded-[4rem] flex items-center justify-center transition-all duration-700 ${isDragging ? 'bg-fluid-indigo text-white scale-110 shadow-2xl' : 'bg-white dark:bg-white/5 text-fluid-indigo border border-slate-100 dark:border-white/10 shadow-xl'}`}>
              <FolderOpen size={40} className={`sm:w-20 sm:h-20 ${isDragging ? 'animate-pulse' : ''}`} />
            </div>

            <div className="text-center space-y-4 sm:space-y-8 relative z-10 px-2">
              <h1 className="text-5xl sm:text-8xl lg:text-[9rem] font-black tracking-tighter text-slate-900 dark:text-white leading-none">Turbo_Load</h1>
              <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[8px] sm:text-sm tracking-[0.3em] sm:tracking-[0.7em] max-w-2xl mx-auto leading-relaxed">
                Bit-Fingerprinting Optimized for Massive Datasets. 100k+ assets processed in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 w-full max-w-3xl mt-4 relative z-10">
               <button onClick={() => folderInputRef.current?.click()} className="group flex-1 px-8 py-5 sm:py-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl sm:rounded-[3rem] font-black text-sm sm:text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4">
                  Add Folder <Files size={22} className="sm:w-8 sm:h-8" />
               </button>
               <button onClick={() => filesInputRef.current?.click()} className="group flex-1 px-8 py-5 sm:py-8 bg-white dark:bg-white/10 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-white/10 rounded-2xl sm:rounded-[3rem] font-black text-sm sm:text-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-4 shadow-xl">
                  Add Files <Zap size={22} className="sm:w-8 sm:h-8" />
               </button>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-[2rem]">
               <ShieldCheck className="text-emerald-500 w-4 h-4 sm:w-5 sm:h-5" />
               <span className="text-[9px] sm:text-[12px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest leading-none">Private Local Engine Only</span>
            </div>

            <input aria-label="Select folder to add" type="file" ref={folderInputRef} className="hidden" multiple onChange={(e) => handleFiles(e.target.files!, e.target.files?.[0]?.webkitRelativePath.split('/')[0] || "ARCHIVE")} {...({ webkitdirectory: "", directory: "" } as any)} />
            <input aria-label="Select files to add" type="file" ref={filesInputRef} className="hidden" multiple accept="image/*,video/*" onChange={(e) => handleFiles(e.target.files!, "UI_UPLOAD")} />
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }: any) => (
  <div className="flex flex-col items-center gap-2 sm:gap-3">
    <div className="text-fluid-indigo opacity-40">{icon}</div>
    <div className="flex flex-col items-center">
      <p className="text-[8px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">{label}</p>
      <p className="text-xs sm:text-base font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">{value}</p>
    </div>
  </div>
);