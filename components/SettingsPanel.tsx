import { useState } from 'react';
import type { FC } from 'react';
import { UserSettings, ConflictRule, DuplicateRule } from '../types';
import { Save, Zap, ShieldCheck, Palette, ShieldAlert, HelpCircle, Sun, Moon, Monitor } from 'lucide-react';

interface SettingsPanelProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onRedeemCode?: (code: string) => boolean;
  onRestartTutorial: () => void;
}

export const SettingsPanel: FC<SettingsPanelProps> = ({ settings, onUpdateSettings, onRestartTutorial }) => {
  const [savedFeedback, setSavedFeedback] = useState(false);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12 sm:pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 sm:px-0">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Lab Protocols</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 tracking-tight">Precise control over your local library engines.</p>
        </div>
        {savedFeedback && (
          <div className="flex items-center gap-2 text-fluid-indigo bg-fluid-indigo/10 dark:bg-fluid-indigo/20 backdrop-blur-md px-6 py-3 rounded-2xl text-[9px] sm:text-[10px] font-black border border-fluid-indigo/20 animate-in fade-in zoom-in uppercase tracking-widest">
            <Save size={16} /> Logic_Synced
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Visual Persona Section */}
        <section className="bento-card p-6 sm:p-10 flex flex-col items-start justify-between gap-8 border-fluid-indigo/20 min-h-[220px]">
          <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 dark:bg-white/5 text-fluid-indigo rounded-2xl sm:rounded-3xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-white/10 shadow-sm">
                  <Palette size={24} className="sm:w-8 sm:h-8" />
              </div>
              <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-xl sm:text-2xl tracking-tighter uppercase leading-none">Virtual Identity</h4>
                  <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 sm:mt-2 tracking-tight leading-snug">Customize interface chroma and luminance levels.</p>
              </div>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 p-1 sm:p-2 bg-slate-100/50 dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 w-full">
              <ThemeButton 
                active={settings.theme === 'light'} 
                onClick={() => updateSetting('theme', 'light')} 
                icon={<Sun size={18} />} 
                label="Day" 
              />
              <ThemeButton 
                active={settings.theme === 'dark'} 
                onClick={() => updateSetting('theme', 'dark')} 
                icon={<Moon size={18} />} 
                label="Void" 
              />
              <ThemeButton 
                active={settings.theme === 'system'} 
                onClick={() => updateSetting('theme', 'system')} 
                icon={<Monitor size={18} />} 
                label="Sync" 
              />
          </div>
        </section>

        {/* Intelligence Config */}
        <section className="bento-card p-6 sm:p-10 space-y-6 sm:space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 sm:p-4 bg-violet-50 dark:bg-white/5 text-fluid-violet rounded-xl sm:rounded-2xl shadow-sm border border-violet-100 dark:border-white/10"><Zap size={24} className="sm:w-7 sm:h-7" /></div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Intelligence</h3>
          </div>

          <div className="space-y-4">
            <label className="text-[8px] sm:text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] px-1">Detection Logic Node</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {(['exact', 'visual'] as DuplicateRule[]).map(rule => (
                <button
                  key={rule}
                  onClick={() => updateSetting('duplicateRule', rule)}
                  className={`flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl transition-all border-2 ${
                    settings.duplicateRule === rule 
                      ? 'bg-fluid-indigo text-white border-fluid-indigo shadow-xl scale-[1.02]' 
                      : 'bg-white dark:bg-white/5 text-slate-500 dark:text-white/40 border-transparent hover:bg-slate-50 dark:hover:bg-white/10'
                  }`}
                >
                  <p className="font-black text-[9px] sm:text-[11px] uppercase tracking-[0.2em] leading-none">{rule}_Indexing</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
         {/* Safety Standards */}
         <section className="bento-card p-6 sm:p-10 space-y-6 sm:space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 sm:p-4 bg-indigo-50 dark:bg-white/5 text-fluid-indigo rounded-xl sm:rounded-2xl shadow-sm border border-indigo-100 dark:border-white/10"><ShieldAlert size={24} className="sm:w-7 sm:h-7" /></div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Safety</h3>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <ToggleOption 
              label="Simulation Mode" 
              desc="Dry run protocol without writing."
              active={settings.dryRun}
              onClick={() => updateSetting('dryRun', !settings.dryRun)}
              icon={<ShieldCheck size={20} className="text-amber-500" />}
            />
            <ToggleOption 
              label="Vault Redundancy" 
              desc="Create local mirrors."
              active={settings.backupMode}
              onClick={() => updateSetting('backupMode', !settings.backupMode)}
              icon={<ShieldCheck size={20} className="text-emerald-500" />}
            />
          </div>
        </section>

        <section className="bento-card p-6 sm:p-10 flex flex-col items-start justify-center gap-6 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 bg-slate-900 dark:bg-white/10 text-white dark:text-white rounded-2xl border border-white/10 shadow-lg">
              <HelpCircle size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Walkthrough</h3>
              <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 tracking-tight">Re-initialize walkthrough engine.</p>
            </div>
          </div>
          <button 
            onClick={onRestartTutorial}
            className="w-full py-4 sm:py-5 bg-slate-900 dark:bg-white text-white dark:text-void rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
          >
            Restart_Protocol_Manual
          </button>
        </section>
      </div>
    </div>
  );
};

const ThemeButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all ${
      active 
        ? 'bg-white dark:bg-fluid-indigo text-fluid-indigo dark:text-white shadow-xl scale-[1.02] border border-slate-200 dark:border-white/10' 
        : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
    }`}
  >
    {icon} {label}
  </button>
);

const ToggleOption = ({ label, desc, active, onClick, icon }: any) => (
  <div className="flex items-center justify-between p-4 sm:p-6 bg-white/50 dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-white/60 dark:border-white/10 hover:border-fluid-indigo transition-all cursor-pointer group" onClick={onClick}>
    <div className="flex items-center gap-3 sm:gap-5">
      <div className="p-2.5 sm:p-3 bg-white dark:bg-white/10 rounded-xl sm:rounded-2xl shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <p className="text-sm sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{label}</p>
        <p className="text-[8px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-black mt-1 sm:mt-2 leading-none tracking-widest uppercase">{desc}</p>
      </div>
    </div>
    <div className={`w-10 h-6 sm:w-14 sm:h-8 rounded-full transition-all relative shrink-0 ${active ? 'bg-fluid-indigo' : 'bg-slate-300 dark:bg-white/20'}`}>
      <div className={`absolute top-0.5 sm:top-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-lg transition-all ${active ? 'left-4.5 sm:left-7' : 'left-0.5 sm:left-1'}`} />
    </div>
  </div>
);