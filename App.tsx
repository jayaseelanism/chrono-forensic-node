import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Scanner } from './components/Scanner';
import { RecoveryPanel } from './components/RecoveryPanel';
import { DuplicatePanel } from './components/DuplicatePanel';
import { OrganizePanel } from './components/OrganizePanel';
import { TrashPanel } from './components/TrashPanel';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { SettingsPanel } from './components/SettingsPanel';
import { AILaboratory } from './components/AILaboratory';
import { SetupFlow } from './components/SetupFlow';
import { VerificationPanel } from './components/VerificationPanel';
import { PricingModal } from './components/PricingModal';
import { AppView, MediaFile, LibraryStats, UserSettings } from './types';
import { detectDuplicates, registry } from './services/mediaEngine';
import { Search, Sparkles, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'fluid_archive_v4';
const INSTALL_KEY = 'fluid_installed';

const DEFAULT_SETTINGS: UserSettings = {
  cameraFormat: 'JPEG', cameraResolution: '1080p', storageLocation: 'Internal Library', autoOptimize: true, renamePattern: 'YYYY-MM-DD_HHMMSS', deleteJsonAfter: true, autoOrganize: false, conflictRule: 'rename', duplicateRule: 'exact', dryRun: false, backupMode: true, theme: 'system', tier: 'free'
};

const App: FC = () => {
  const [isInstalled, setIsInstalled] = useState(() => localStorage.getItem(INSTALL_KEY) === 'true');
  const [activeView, setActiveView] = useState<AppView>(AppView.SCANNER);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [rootFolderName, setRootFolderName] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPricing, setShowPricing] = useState(false);
  const [activityLog, setActivityLog] = useState<{id: string, timestamp: string, message: string, type: string}[]>([]);
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [aiConsent, setAiConsent] = useState<boolean>(() => {
    try { return localStorage.getItem('ai_consent') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const isDark = settings.theme === 'dark' || (settings.theme === 'system' && mediaQuery.matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [settings.theme]);

  const addLog = useCallback((message: string, type: string = 'info') => {
    setActivityLog(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message, type
    }, ...prev].slice(0, 40));
  }, []);

  const handleFilesProcessed = (newFiles: MediaFile[], folderName: string) => {
    setFiles(prev => {
      const merged = [...prev, ...newFiles];
      const uniqueById = Array.from(new Map(merged.map(item => [item.id, item])).values());
      return detectDuplicates(uniqueById);
    });
    if (!rootFolderName) setRootFolderName(folderName);
    addLog(`FINGERPRINTED ${newFiles.length} NODES FROM ${folderName}`, 'success');
    setActiveView(AppView.DASHBOARD); 
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    addLog("Protocols synchronized", 'info');
  };

  const handleOptimize = (ids: string[]) => {
    setFiles(prev => prev.map(f => ids.includes(f.id) ? { ...f, status: 'optimized' } : f));
    addLog(`Neural optimization applied to ${ids.length} nodes`, 'success');
  };

  const stats = useMemo<LibraryStats>(() => {
    const activeFiles = files.filter(f => f.status !== 'deleted');
    return {
      totalFiles: activeFiles.length,
      totalSize: activeFiles.reduce((acc, f) => acc + f.size, 0),
      duplicatesFound: activeFiles.filter(f => f.status === 'duplicate').length,
      timeIssuesFound: activeFiles.filter(f => f.status === 'needs_fix' || !f.capturedDate).length,
      optimizedSize: activeFiles.filter(f => f.status === 'optimized').length,
      jsonFilesFound: 0, heicCount: 0, actualRecoveredSpace: 0, trashCount: 0
    };
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) && f.status !== 'deleted');
  }, [files, searchQuery]);

  if (!isInstalled) return <SetupFlow onComplete={() => { localStorage.setItem(INSTALL_KEY, 'true'); setIsInstalled(true); }} />;

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-void font-sans transition-colors duration-500 overflow-hidden">
      {!aiConsent && (
        <div className="w-full bg-yellow-50 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-4 py-2 flex items-center justify-between">
          <div className="text-xs">AI features require your explicit consent. Review <a className="underline" href="/PRIVACY.md">Privacy</a> and <a className="underline" href="/DISCLAIMER.md">Disclaimer</a>.</div>
          <div>
            <button onClick={() => { localStorage.setItem('ai_consent', 'true'); setAiConsent(true); }} className="ml-4 px-3 py-1 rounded bg-yellow-700 text-white text-xs">I Agree</button>
          </div>
        </div>
      )}
      
      {/* Universal Header - Fixed and Adaptive */}
      <header className="h-16 sm:h-24 px-4 sm:px-12 flex items-center justify-between shrink-0 z-[100] bg-white/50 dark:bg-void/50 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 pt-[var(--sat)]">
        <div className="flex items-center gap-3 sm:gap-6 cursor-pointer group" onClick={() => setActiveView(AppView.SCANNER)}>
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-slate-900 dark:bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-white dark:text-slate-900 font-black text-lg sm:text-2xl shadow-xl group-hover:scale-105 transition-transform">C</div>
          <div className="flex flex-col">
            <h1 className="text-xs sm:text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Chrono_Vault</h1>
            <span className="text-[7px] sm:text-[10px] font-black uppercase text-fluid-indigo tracking-widest mt-0.5 sm:mt-1">Node_01 // {activeView}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-8">
           <div className="hidden sm:flex items-center bg-slate-100/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-sm">
             <Search size={14} className="text-slate-400 mr-2 sm:mr-4" />
             <input 
               type="text" 
               placeholder="SEARCH_VAULT" 
               className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white/70 w-24 sm:w-64 placeholder:text-slate-300 outline-none"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
           <button onClick={() => setShowPricing(true)} className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition-all">
             {settings.tier === 'pro' && <Sparkles size={12} className="text-fluid-violet hidden xs:block" />}
             <span className="xs:inline">{settings.tier === 'pro' ? 'PRO_UPLINK' : 'ELEVATE'}</span>
           </button>
        </div>
      </header>

      {/* Adaptive Main Container - Flex-1 ensuring it fills remaining space and handles scrolling */}
      <main className="flex-1 overflow-y-auto scrollbar-none relative overscroll-contain">
        <div className="flex flex-col min-h-full pb-32 sm:pb-48 lg:pb-64">
          {activeView === AppView.SCANNER ? (
            <Scanner 
              tier={settings.tier} 
              onFilesProcessed={handleFilesProcessed} 
              onLimitReached={() => setShowPricing(true)} 
              onGoToRecovery={() => setActiveView(AppView.RECOVERY)} 
              onLog={addLog} 
              hasIssues={stats.timeIssuesFound > 0} 
            />
          ) : (
            <div className="animate-in fade-in duration-700 px-4 sm:px-8 lg:px-12 pt-6 lg:pt-12">
              {activeView === AppView.DASHBOARD && <Dashboard stats={stats} files={files} activityLog={activityLog} onReset={() => setActiveView(AppView.SCANNER)} onAIDiagnostic={() => setActiveView(AppView.AI_LAB)} onGrowthStats={() => setActiveView(AppView.VERIFICATION)} />}
              {activeView === AppView.AI_LAB && <AILaboratory onLog={addLog} />}
              {activeView === AppView.BROWSER && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-8">
                  {filteredFiles.map(f => (
                    <BrowserCell key={f.id} file={f} onClick={() => setPreviewFile(f)} />
                  ))}
                  {files.length === 0 && (
                    <div className="col-span-full py-32 sm:py-48 text-center space-y-6 animate-in zoom-in-95">
                      <div className="w-16 h-16 sm:w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
                        <Search size={48} />
                      </div>
                      <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Vault Empty</h2>
                      <button onClick={() => setActiveView(AppView.SCANNER)} className="px-6 py-3 bg-fluid-indigo text-white rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:scale-105 transition-all">Mount Archive Source</button>
                    </div>
                  )}
                </div>
              )}
              {activeView === AppView.RECOVERY && <RecoveryPanel files={files} onApplyFix={(ids) => {
                setFiles(prev => prev.map(f => ids.includes(f.id) ? { ...f, status: 'healthy', capturedDate: f.suggestedDate || new Date().toISOString() } : f));
                addLog(`Forensic repair committed to ${ids.length} nodes`, 'success');
              }} />}
              {activeView === AppView.DUPLICATES && <DuplicatePanel files={files} tier={settings.tier} onRemove={(ids) => setFiles(prev => prev.filter(f => !ids.includes(f.id)))} onOptimize={handleOptimize} onUndo={() => {}} canUndo={false} onUpgradeClick={() => setShowPricing(true)} onAIDetected={() => {}} />}
              {activeView === AppView.ORGANIZE && <OrganizePanel files={files} jsonCount={0} onExecute={() => addLog("Archive restructure committed to virtual map", "success")} settings={settings} onSettingsChange={handleUpdateSettings} onUpgradeClick={() => setShowPricing(true)} />}
              {activeView === AppView.SETTINGS && <SettingsPanel settings={settings} onUpdateSettings={handleUpdateSettings} onRestartTutorial={() => {}} />}
              {activeView === AppView.VERIFICATION && <VerificationPanel files={files} />}
              {activeView === AppView.TRASH && <TrashPanel files={files.filter(f => f.status === 'deleted')} onRestore={(ids) => setFiles(prev => prev.map(f => ids.includes(f.id) ? { ...f, status: 'healthy' } : f))} onPermanentDelete={(ids) => setFiles(prev => prev.filter(f => !ids.includes(f.id)))} />}
            </div>
          )}
        </div>
      </main>

      {/* Universal Navigation Dock - Anchored to bottom with safe-area buffer */}
      <Navigation 
        activeView={activeView} 
        onViewChange={(v) => setActiveView(v)} 
        onReset={() => { setFiles([]); registry.clear(); addLog("Bit-ledger reset"); setActiveView(AppView.SCANNER); }} 
        onUpgrade={() => setShowPricing(true)} 
        tier={settings.tier} 
      />

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} onUpgrade={() => { handleUpdateSettings({...settings, tier: 'pro'}); setShowPricing(false); }} onRedeemCode={() => true} currentTier={settings.tier} />}
      {previewFile && <MediaPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
};

const BrowserCell: FC<{ file: MediaFile; onClick: () => void }> = ({ file, onClick }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const u = registry.getThumbnailUrl(file.id);
    setUrl(u);
    return () => {
      registry.revokeUrl(file.id);
    };
  }, [file.id]);

  return (
    <div onClick={onClick} className="aspect-square bento-card overflow-hidden cursor-pointer group relative border-white/40">
      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded text-[6px] sm:text-[7px] font-black text-white uppercase tracking-widest">
        {file.type.split('/')[1]?.toUpperCase() || 'RAW'}
      </div>
      {url ? (
        <img src={url} alt={file.name || file.id} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-white/5">
          <Loader2 className="animate-spin text-slate-300" size={24} />
        </div>
      )}
      <div className="absolute inset-0 bg-fluid-indigo/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-xl border border-white/10">Inspect</span>
      </div>
    </div>
  );
};

export default App;