
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { MediaFile } from '../types';
import { X, Calendar, Database, FileType, Info, ShieldCheck, Download, Trash2, ExternalLink, HardDrive, FileJson, Hash, Clock, MapPin, Tag, Activity } from 'lucide-react';

interface MediaPreviewModalProps {
  file: MediaFile;
  onClose: () => void;
}

export const MediaPreviewModal: FC<MediaPreviewModalProps> = ({ file, onClose }) => {
  const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mov') || file.name.toLowerCase().endsWith('.mp4');
  const [activeTab, setActiveTab] = useState<'preview' | 'forensics'>('preview');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const statusColors: Record<string, string> = {
    healthy: 'bg-prism-lime/10 text-prism-lime border-prism-lime/20',
    needs_fix: 'bg-prism-orange/10 text-prism-orange border-prism-orange/20',
    duplicate: 'bg-prism-pink/10 text-prism-pink border-prism-pink/20',
    optimized: 'bg-prism-azure/10 text-prism-azure border-prism-azure/20',
    pending_move: 'bg-prism-indigo/10 text-prism-indigo border-prism-indigo/20',
    moved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    deleted: 'bg-red-500/10 text-red-500 border-red-500/20',
    corrupted: 'bg-red-700/10 text-red-700 border-red-700/20'
  };

  return (
    <div className={`fixed inset-0 z-[600] flex items-center justify-center p-2 sm:p-6 bg-slate-950/95 backdrop-blur-3xl transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div 
        className="absolute inset-0 cursor-zoom-out" 
        onClick={handleClose} 
      />
      
      <div className={`relative bg-white dark:bg-zinc-950 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] max-w-6xl w-full h-[90dvh] md:h-[80vh] flex flex-col md:flex-row border border-white/10 transition-transform duration-300 ${isClosing ? 'scale-95' : 'scale-100'}`}>
        
        {/* Close Button Mobile */}
        <button
          onClick={handleClose}
          aria-label="Close preview"
          title="Close"
          className="md:hidden absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-xl text-white rounded-full border border-white/20"
        >
          <X size={20} />
        </button>

        {/* Content Viewer */}
        <div className="flex-1 bg-black flex flex-col relative overflow-hidden group/viewer">
          <div className="flex-1 flex items-center justify-center p-0 md:p-4 overflow-hidden">
            {activeTab === 'preview' ? (
              isVideo ? (
                <video 
                  src={file.thumbnailUrl} 
                  controls 
                  autoPlay 
                  loop
                  muted
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
              ) : (
                <img 
                  src={file.thumbnailUrl} 
                  alt={file.name}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
              )
            ) : (
              <div className="w-full h-full p-8 overflow-y-auto scrollbar-hide flex flex-col items-center justify-center">
                 <div className="w-full max-w-md space-y-6">
                    <div className="flex items-center gap-4 text-prism-azure">
                       <Activity size={32} className="animate-pulse" />
                       <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Neural Bit-Audit</h3>
                    </div>
                    <div className="space-y-3">
                       <ForensicBit label="SHA-256 Hash" value={file.hash} icon={<Hash size={14}/>} />
                       <ForensicBit label="Visual Signature" value={file.visualHash || 'N/A'} icon={<Tag size={14}/>} />
                       <ForensicBit label="Protocol Method" value={file.recoveryMethod || 'None'} icon={<Clock size={14}/>} />
                       <ForensicBit label="Filing Path" value={file.proposedPath || file.relativePath || '/root'} icon={<HardDrive size={14}/>} />
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Viewer Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 opacity-0 group-hover/viewer:opacity-100 transition-opacity">
            <button 
              onClick={() => setActiveTab('preview')}
              aria-label="Switch to visual tab"
              title="Visual"
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
            >
              Visual
            </button>
            <button 
              onClick={() => setActiveTab('forensics')}
              aria-label="Switch to forensics tab"
              title="Forensics"
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'forensics' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
            >
              Forensics
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-zinc-950 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 flex flex-col shrink-0">
          <header className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-1 leading-none">Asset ID: {file.id}</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-[200px] tracking-tight leading-none">{file.name}</h2>
            </div>
            <button onClick={handleClose} aria-label="Close preview" title="Close" className="hidden md:flex p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {/* Status Section */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} /> Integrity State
              </h3>
              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${statusColors[file.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                <span className="text-xs font-black uppercase tracking-widest">{file.status.replace('_', ' ')}</span>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              </div>
            </section>

            {/* Metrics Grid */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest flex items-center gap-2">
                <Database size={14} /> Physical Metrics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <MetricBox label="Volume" value={formatBytes(file.size)} icon={<HardDrive size={14}/>} />
                <MetricBox label="Type" value={file.type.split('/')[1]?.toUpperCase() || 'RAW'} icon={<FileType size={14}/>} />
                <MetricBox 
                  label="Timeline" 
                  value={file.capturedDate ? new Date(file.capturedDate).toLocaleDateString() : 'Corrupted'} 
                  icon={<Calendar size={14}/>} 
                  alert={!file.capturedDate}
                />
                <MetricBox label="Sidecar" value={file.hasSidecar ? 'Found' : 'Missing'} icon={<FileJson size={14}/>} />
              </div>
            </section>

            {/* Path Forensics */}
            <section className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Path Forensics
              </h3>
              <div className="space-y-2">
                <PathRow label="Source" value={file.originalPath || file.name} />
                <PathRow label="Pipeline" value={file.proposedPath || 'Awaiting map...'} />
              </div>
            </section>
          </div>

          <footer className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex gap-3">
            <button aria-label="Extract source" title="Extract source" className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
              <Download size={14} /> Extract Source
            </button>
            <button aria-label="Delete asset" title="Delete" className="p-4 bg-white dark:bg-white/5 text-red-500 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-90">
              <Trash2 size={18} />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

const ForensicBit = ({ label, value, icon }: any) => (
  <div className="space-y-1.5 w-full">
    <div className="flex items-center gap-2 text-white/40">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="p-3 bg-white/5 rounded-xl border border-white/10 group hover:border-prism-azure transition-colors">
       <code className="text-[10px] font-mono text-slate-300 break-all leading-tight block">{value}</code>
    </div>
  </div>
);

const MetricBox = ({ label, value, icon, alert }: any) => (
  <div className={`p-4 rounded-2xl border transition-all ${alert ? 'bg-prism-orange/5 border-prism-orange/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10'}`}>
    <div className="flex items-center gap-2 mb-2 text-slate-400 dark:text-white/20">
      {icon}
      <span className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
    <p className={`text-xs font-black tracking-tight ${alert ? 'text-prism-orange' : 'text-slate-900 dark:text-white'}`}>{value}</p>
  </div>
);

const PathRow = ({ label, value }: any) => (
  <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden">
    <span className="text-[8px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">{label}</span>
    <p className="text-[10px] font-bold text-slate-600 dark:text-white/60 truncate italic">{value}</p>
  </div>
);
