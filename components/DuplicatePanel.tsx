import { useMemo, useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { MediaFile, UserTier } from '../types';
import { 
  Fingerprint, Trash2, CheckSquare, Square, CheckCircle, Database, 
  LayoutGrid, AlertCircle, Loader2, BrainCircuit, ScanSearch, History,
  Filter, SortDesc, SortAsc, ShieldAlert, X, Info, Zap, Sparkles, Lock
} from 'lucide-react';
import { registry } from '../services/mediaEngine';
import { detectVisualDuplicatesAI, blobUrlToBase64 } from '../services/aiService';

interface DuplicatePanelProps {
  files: MediaFile[];
  tier: UserTier;
  onRemove: (fileIds: string[]) => void;
  onOptimize: (fileIds: string[]) => void;
  onUndo: () => void;
  canUndo: boolean;
  onUpgradeClick: () => void;
  onAIDetected: (groups: Record<string, string[]>) => void;
}

const MediaCell: FC<{ file: MediaFile; isPrimary: boolean; isSelected: boolean; onClick: () => void }> = ({ file, isPrimary, isSelected, onClick }) => {
  const [url, setUrl] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|m4v)$/i);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '400px', threshold: 0.01 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      setUrl(registry.getThumbnailUrl(file.id));
    } else if (url) {
      registry.revokeUrl(file.id);
      setUrl('');
    }
  }, [isVisible, file.id]);

  return (
    <div 
      ref={containerRef}
      onClick={onClick}
      className={`group relative aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden cursor-pointer border-2 sm:border-4 transition-all duration-300 ${
        isSelected 
          ? 'border-fluid-indigo scale-[0.98] ring-4 sm:ring-8 ring-fluid-indigo/5' 
          : isPrimary 
            ? 'border-emerald-500 shadow-xl scale-105 z-10' 
            : 'border-transparent bg-slate-100 dark:bg-white/5'
      }`}
    >
      {url ? (
        isVideo ? (
          <video src={url} className="w-full h-full object-cover" muted loop onMouseOver={e => (e.target as any).play()} onMouseOut={e => (e.target as any).pause()} />
        ) : (
          <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={file.name} />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-200">
          <Loader2 className="animate-spin" size={20} />
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 sm:p-5 flex flex-col justify-end">
         <p className="text-[8px] sm:text-[10px] font-black text-white uppercase truncate">{file.name}</p>
         <p className="text-[7px] sm:text-[9px] font-black text-white/50 uppercase tracking-widest mt-0.5 sm:mt-1">
          { (file.size / 1024 / 1024).toFixed(1) } MB • { new Date(file.lastModified).toLocaleDateString() }
         </p>
      </div>

      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2">
        {isPrimary ? (
          <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-500 text-white text-[7px] sm:text-[9px] font-black uppercase rounded sm:rounded-lg shadow-xl border border-white/20 flex items-center gap-1 sm:gap-1.5">
            {/* Fix: Removed non-existent sm prop */}
            <CheckCircle size={10} /> PRIMARY
          </div>
        ) : (
          <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-black/60 backdrop-blur-md text-white text-[7px] sm:text-[9px] font-black uppercase rounded sm:rounded-lg border border-white/10 flex items-center gap-1 sm:gap-1.5">
            {/* Fix: Removed non-existent sm prop */}
            <History size={10} /> CLONE
          </div>
        )}
      </div>

      <div className={`absolute top-2 sm:top-4 right-2 sm:top-4 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${
        isSelected ? 'bg-fluid-indigo text-white scale-110 shadow-lg' : 'bg-black/40 backdrop-blur-md text-white border border-white/20'
      }`}>
        {/* Fix: Removed non-existent sm prop and adjusted size */}
        {isSelected ? <CheckSquare size={20} strokeWidth={3} /> : <Square size={20} strokeWidth={2.5} />}
      </div>
    </div>
  );
};

export const DuplicatePanel: FC<DuplicatePanelProps> = ({ 
  files, tier, onRemove, onOptimize, onUpgradeClick 
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'identical' | 'visual'>('identical');
  const [isAIScanning, setIsAIScanning] = useState(false);
  const [aiClusters, setAIClusters] = useState<{ clusterId: string, primaryId: string, ids: string[] }[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showConfirmPurge, setShowConfirmPurge] = useState(false);
  const [showConfirmOptimize, setShowConfirmOptimize] = useState(false);

  const fileMap = useMemo(() => {
    const map = new Map<string, MediaFile>();
    files.forEach(f => map.set(f.id, f));
    return map;
  }, [files]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredBitClusters = useMemo(() => {
    const map = new Map<string, MediaFile[]>();
    files.forEach(f => {
      if (mediaTypeFilter === 'image' && !f.type.startsWith('image/')) return;
      if (mediaTypeFilter === 'video' && !f.type.startsWith('video/')) return;
      if (f.status === 'duplicate' && f.duplicateOf) {
        if (!map.has(f.duplicateOf)) {
          const p = fileMap.get(f.duplicateOf);
          if (p) map.set(f.duplicateOf, [p]);
        }
        map.get(f.duplicateOf)?.push(f);
      }
    });

    return Array.from(map.entries())
      .filter(([_, g]) => g.length > 1)
      .map(([id, g]) => {
        // PRIMARY LOGIC: OLDEST THEN LARGEST
        const sorted = [...g].sort((a, b) => {
          if (a.lastModified !== b.lastModified) return a.lastModified - b.lastModified;
          return b.size - a.size;
        });
        return { id, primaryId: sorted[0].id, group: sorted };
      })
      .sort((a, b) => sortOrder === 'desc' ? b.group.length - a.group.length : a.group.length - b.group.length);
  }, [files, fileMap, mediaTypeFilter, sortOrder]);

  const filteredVisualClusters = useMemo(() => {
    return aiClusters.map(cluster => {
      let group = cluster.ids.map(id => fileMap.get(id)).filter((f): f is MediaFile => !!f);
      if (mediaTypeFilter === 'image') group = group.filter(f => f.type.startsWith('image/'));
      if (mediaTypeFilter === 'video') group = group.filter(f => f.type.startsWith('video/'));
      // PRIMARY LOGIC: OLDEST THEN LARGEST
      const sorted = [...group].sort((a, b) => {
        if (a.lastModified !== b.lastModified) return a.lastModified - b.lastModified;
        return b.size - a.size;
      });
      return { id: cluster.clusterId, primaryId: sorted[0]?.id || '', group: sorted };
    })
    .filter(c => c.group.length > 1)
    .sort((a, b) => sortOrder === 'desc' ? b.group.length - a.group.length : a.group.length - b.group.length);
  }, [aiClusters, fileMap, mediaTypeFilter, sortOrder]);

  const currentClusters = activeTab === 'identical' ? filteredBitClusters : filteredVisualClusters;

  const handleRunAIScan = async () => {
    if (tier === 'free') {
      onUpgradeClick();
      return;
    }
    setIsAIScanning(true);
    setScanProgress(0);
    const start = Date.now();
    try {
      const candidates = files.filter(f => f.type.startsWith('image/')).slice(0, 50);
      const imagesWithData = [];
      for (let i = 0; i < candidates.length; i++) {
        const f = candidates[i];
        const data = await blobUrlToBase64(registry.getThumbnailUrl(f.id));
        imagesWithData.push({ id: f.id, data, mimeType: f.type, metadata: { lastModified: f.lastModified, size: f.size } });
        const progress = Math.round(((i + 1) / candidates.length) * 100);
        setScanProgress(progress);
        const elapsed = (Date.now() - start) / 1000;
        const speed = (i + 1) / elapsed;
        const remaining = (candidates.length - (i + 1)) / speed;
        setEstimatedTime(Math.round(remaining));
      }
      const clusters = await detectVisualDuplicatesAI(imagesWithData);
      setAIClusters(clusters);
      setActiveTab('visual');
    } catch (e) {
      console.error("AI Node Scan Failed", e);
    } finally {
      setIsAIScanning(false);
      setEstimatedTime(null);
    }
  };

  const metrics = useMemo(() => {
    let waste = 0;
    currentClusters.forEach(c => {
      c.group.forEach(f => {
        if (f.id !== c.primaryId) waste += f.size;
      });
    });
    return { groups: currentClusters.length, waste, selected: selectedIds.size };
  }, [currentClusters, selectedIds]);

  const handlePurge = () => {
    onRemove(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowConfirmPurge(false);
  };

  const handleOptimizeAction = () => {
    onOptimize(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowConfirmOptimize(false);
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 pb-48 sm:pb-64">
      {/* Forensic Purge Confirmation */}
      {showConfirmPurge && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-3xl animate-in fade-in">
          <div className="max-w-md w-full bento-card p-6 sm:p-10 bg-white dark:bg-void border-2 border-red-500/20 shadow-2xl">
            <div className="flex items-center gap-4 text-red-500 mb-6 sm:mb-8">
               {/* Fix: Removed non-existent sm prop and adjusted size */}
               <ShieldAlert size={40} strokeWidth={2.5} />
               <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Wipe Confirm</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bold mb-6 sm:mb-8">
              Confirm permanent deletion of <span className="text-slate-900 dark:text-white font-black">{selectedIds.size} nodes</span>.
            </p>
            <div className="p-4 sm:p-6 bg-red-50 dark:bg-red-500/10 rounded-2xl mb-6 sm:mb-10">
               <p className="text-[8px] sm:text-[10px] font-black uppercase text-red-500 mb-1">Recoverable Bitstream</p>
               <p className="text-3xl sm:text-4xl font-black text-red-600 tracking-tighter">{formatBytes(metrics.waste)}</p>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <button onClick={() => setShowConfirmPurge(false)} className="flex-1 py-3 sm:py-4 bg-slate-100 dark:bg-white/5 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase">Cancel</button>
              <button onClick={handlePurge} className="flex-1 py-3 sm:py-4 bg-red-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase shadow-xl">Confirm Purge</button>
            </div>
          </div>
        </div>
      )}

      {/* Neural Optimize Confirmation */}
      {showConfirmOptimize && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-3xl animate-in fade-in">
          <div className="max-w-md w-full bento-card p-6 sm:p-10 bg-white dark:bg-void border-2 border-fluid-indigo/20 shadow-2xl">
            <div className="flex items-center gap-4 text-fluid-indigo mb-6 sm:mb-8">
               {/* Fix: Removed non-existent sm prop and adjusted size */}
               <Sparkles size={40} strokeWidth={2.5} />
               <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Optimize Bits</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bold mb-6 sm:mb-8">
              Run neural bit-compression on <span className="text-slate-900 dark:text-white font-black">{selectedIds.size} nodes</span>. This shrinks footprint while maintaining 100% forensic fidelity.
            </p>
            <div className="p-4 sm:p-6 bg-indigo-50 dark:bg-fluid-indigo/10 rounded-2xl mb-6 sm:mb-10">
               <p className="text-[8px] sm:text-[10px] font-black uppercase text-fluid-indigo mb-1">Neural Compression Protocol</p>
               <p className="text-3xl sm:text-4xl font-black text-fluid-indigo tracking-tighter">AI_ULTRA</p>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <button onClick={() => setShowConfirmOptimize(false)} className="flex-1 py-3 sm:py-4 bg-slate-100 dark:bg-white/5 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase">Cancel</button>
              <button onClick={handleOptimizeAction} className="flex-1 py-3 sm:py-4 bg-fluid-indigo text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase shadow-xl">Start Neural Optimize</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-10 px-1 sm:px-0">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-2xl">
              {/* Fix: Removed non-existent sm prop and adjusted size */}
              <Fingerprint size={48} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Redundancy</h2>
              <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                <button 
                  onClick={handleRunAIScan} 
                  disabled={isAIScanning} 
                  className={`flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                    isAIScanning ? 'bg-fluid-violet/20 text-fluid-violet animate-pulse' : 'bg-fluid-indigo text-white hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20'
                  }`}
                >
                  {/* Fix: Removed non-existent sm prop */}
                  {isAIScanning ? <Loader2 size={12} className="animate-spin" /> : <BrainCircuit size={14} />}
                  Deep Forensic Scan
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex p-0.5 sm:p-1 bg-slate-100 dark:bg-white/5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 w-fit">
              <TabBtn active={activeTab === 'identical'} onClick={() => setActiveTab('identical')} label="Exact Bits" count={filteredBitClusters.length} />
              <TabBtn active={activeTab === 'visual'} onClick={() => setActiveTab('visual')} label="AI Visual" count={filteredVisualClusters.length} />
            </div>
            
            <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-white/10 mx-2" />
            
            <div className="flex items-center gap-1.5 sm:gap-2">
               <button
                 onClick={() => setMediaTypeFilter('all')}
                 aria-label="Show all media types"
                 title="Show all media types"
                 className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all ${mediaTypeFilter === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'border-slate-200 dark:border-white/10 text-slate-400'}`}>
                 <Filter size={16} />
               </button>
               <button onClick={() => setMediaTypeFilter('image')} className={`px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${mediaTypeFilter === 'image' ? 'bg-fluid-indigo text-white border-transparent' : 'border-slate-200 dark:border-white/10 text-slate-400'}`}>Images</button>
               <button onClick={() => setMediaTypeFilter('video')} className={`px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${mediaTypeFilter === 'video' ? 'bg-fluid-violet text-white border-transparent' : 'border-slate-200 dark:border-white/10 text-slate-400'}`}>Videos</button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 lg:mt-0">
          <button 
            onClick={() => {
              const next = new Set<string>();
              currentClusters.forEach(c => c.group.forEach(f => { if (f.id !== c.primaryId) next.add(f.id); }));
              setSelectedIds(next);
            }} 
            className="flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-5 bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl"
          >
            Mark Clones
          </button>
          <button 
            disabled={selectedIds.size === 0} 
            onClick={() => {
              if (tier === 'free') onUpgradeClick();
              else setShowConfirmOptimize(true);
            }}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-5 border rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 disabled:opacity-30 ${
              tier === 'pro' 
                ? 'bg-fluid-indigo border-transparent text-white hover:bg-fluid-indigo/90' 
                : 'bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
            }`}
          >
            {/* Fix: Removed non-existent sm prop and adjusted size */}
            {tier === 'pro' ? <Zap size={18} /> : <Lock size={18} />} Opt ({selectedIds.size})
          </button>
          <button 
            disabled={selectedIds.size === 0} 
            onClick={() => setShowConfirmPurge(true)} 
            className="flex-1 sm:flex-none px-4 sm:px-12 py-3 sm:py-5 bg-red-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl disabled:opacity-30 flex items-center justify-center gap-1.5 sm:gap-3 transition-all"
          >
            {/* Fix: Removed non-existent sm prop and adjusted size */}
            <Trash2 size={18} /> Purge ({selectedIds.size})
          </button>
        </div>
      </header>

      {isAIScanning && (
        <div className="bento-card p-6 sm:p-12 flex flex-col items-center gap-6 sm:gap-8 bg-fluid-violet/5 border-fluid-violet/20 animate-in zoom-in-95">
          <div className="relative">
             {/* Fix: Removed non-existent sm prop and adjusted size */}
             <ScanSearch size={48} className="text-fluid-violet animate-pulse" />
             {estimatedTime !== null && (
                <div className="absolute -top-4 -right-12 sm:-right-20 px-2 sm:px-3 py-0.5 sm:py-1 bg-black text-white text-[7px] sm:text-[9px] font-black rounded sm:rounded-lg border border-white/20 shadow-xl">
                  ETR: {estimatedTime}s
                </div>
             )}
          </div>
          <div className="w-full max-w-2xl h-2 sm:h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full bg-fluid-violet transition-all duration-300 shadow-xl ${(() => {
              const p = Math.max(0, Math.min(100, Math.round(scanProgress)));
              const rounded = Math.round(p / 5) * 5;
              return `w-p-${rounded}`;
            })()}`} />
          </div>
          <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing neural signatures • {scanProgress}% complete</p>
        </div>
      )}

      {currentClusters.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-8">
          {/* Fix: Removed non-existent sm props from Stat icons */}
          <Stat icon={<LayoutGrid size={24} />} label="Collision" value={metrics.groups.toString()} color="text-fluid-indigo" />
          <Stat icon={<Database size={24} />} label="Potential" value={formatBytes(metrics.waste)} color="text-emerald-500" />
          <Stat icon={<AlertCircle size={24} />} label="Selection" value={metrics.selected.toString()} color="text-red-500" />
        </div>
      )}

      {currentClusters.length === 0 ? (
        <div className="py-24 sm:py-48 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] sm:rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/10">
          {/* Fix: Removed non-existent sm prop and adjusted size */}
          <CheckCircle size={72} className="text-emerald-500/40" />
          <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Vault Node Clean</h3>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-16">
          {currentClusters.map((cluster, idx) => (
            <div key={cluster.id} className={`bg-white dark:bg-white/5 rounded-[2rem] sm:rounded-[4rem] border border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 transition-all hover:border-fluid-indigo/30 ${(() => {
              const delay = Math.min(600, idx * 30);
              return `anim-delay-30-${delay}`;
            })()}`}>
              <div className="px-6 sm:px-12 py-4 sm:py-8 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                   <span className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400">Node Cluster: {cluster.id.slice(0, 8)}</span>
                   <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-0.5 sm:mt-1">{cluster.group.length} Forensic Clones</p>
                </div>
                <button onClick={() => {
                  const next = new Set(selectedIds);
                  cluster.group.forEach(f => { if (f.id !== cluster.primaryId) next.add(f.id); else next.delete(f.id); });
                  setSelectedIds(next);
                }} className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl">
                  Mark Group Clones
                </button>
              </div>
              <div className="p-4 sm:p-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-12">
                {cluster.group.map((file) => (
                  <MediaCell 
                    key={file.id} 
                    file={file} 
                    isPrimary={file.id === cluster.primaryId} 
                    isSelected={selectedIds.has(file.id)} 
                    onClick={() => {
                      const next = new Set(selectedIds);
                      if (next.has(file.id)) next.delete(file.id);
                      else next.add(file.id);
                      setSelectedIds(next);
                    }} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 sm:gap-3 ${
      active ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xl' : 'text-slate-400'
    }`}
  >
    {label} {count > 0 && <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[6px] sm:text-[8px] ${active ? 'bg-fluid-indigo text-white' : 'bg-slate-200 dark:bg-white/10'}`}>{count}</span>}
  </button>
);

const Stat = ({ icon, label, value, color }: any) => (
  <div className="bg-white dark:bg-white/5 p-4 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] border border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center gap-2 sm:gap-8 shadow-xl text-center sm:text-left">
    <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-900/5 dark:bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[7px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">{label}</p>
      <p className="text-xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{value}</p>
    </div>
  </div>
);