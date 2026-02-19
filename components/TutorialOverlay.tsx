
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { 
  X, ChevronRight, ChevronLeft, LayoutDashboard, BrainCircuit, 
  Clock, Copy, FolderTree, ClipboardCheck, Settings, 
  Check, Info, Search, Database, TrendingUp, Cpu
} from 'lucide-react';

interface TutorialOverlayProps {
  onClose: (dontShowAgain: boolean) => void;
}

const TUTORIAL_STEPS = [
  {
    title: "Dashboard & Intelligence",
    icon: <LayoutDashboard size={40} className="text-blue-500" />,
    description: "The core mission control. It monitors library entropy, redundancy, and health. Features include AI Diagnostics (Gemini-powered health reports) and Growth Stats (space distribution analysis).",
    expectation: "A real-time integrity index, total storage footprint, and clickable forensic reports identifying critical library issues.",
    view: "DASHBOARD"
  },
  {
    title: "Library Browser",
    icon: <Search size={40} className="text-slate-400" />,
    description: "A secure, high-speed visual index of your entire archive. Use the query engine to find specific files by name or status across your air-gapped node.",
    expectation: "Instant visual confirmation of your media assets with details on their health, size, and metadata status.",
    view: "BROWSER"
  },
  {
    title: "AI Forensic Laboratory",
    icon: <BrainCircuit size={40} className="text-purple-500" />,
    description: "Leverages Gemini 3 Pro to understand your media. Upload any photo or video to ask questions about its content, quality, or context.",
    expectation: "Human-like descriptions and technical analysis. For example: 'Where was this taken?' or 'Identify all humans in this video'.",
    view: "AI_LAB"
  },
  {
    title: "Timestamp Recovery",
    icon: <Clock size={40} className="text-amber-500" />,
    description: "Fixes the 'Google Takeout' problem. It cross-references sidecar JSON files, filenames, and headers to restore lost 'Date Taken' data.",
    expectation: "A prioritized list of corrected metadata signatures, ready to be synced back to your physical files.",
    view: "RECOVERY"
  },
  {
    title: "Redundancy Finder",
    icon: <Copy size={40} className="text-blue-400" />,
    description: "Identifies waste. Uses bit-for-bit SHA-256 hashing for exact duplicates and dHash perceptual analysis for visually similar photos.",
    expectation: "Clusters of redundant media. You can safely purge clones while keeping the highest-quality 'Primary' copy.",
    view: "DUPLICATES"
  },
  {
    title: "Auto-Organize Pipeline",
    icon: <FolderTree size={40} className="text-indigo-500" />,
    description: "The restructure engine. Automatically sorts messy folders into a clean YYYY/MM directory hierarchy based on verified dates.",
    expectation: "A perfectly sorted filesystem. Your messy 'Downloads' or 'Export' folder becomes a chronological, easy-to-browse archive.",
    view: "ORGANIZE"
  },
  {
    title: "Health Verification",
    icon: <ClipboardCheck size={40} className="text-emerald-500" />,
    description: "The final audit. Verifies that every move, rename, and deletion performed by the app has been successfully committed to disk.",
    expectation: "A 'Green-Lit' system report confirming that your physical disk matches the digital index with 100% accuracy.",
    view: "VERIFICATION"
  },
  {
    title: "Config & Safety Rules",
    icon: <Settings size={40} className="text-slate-500" />,
    description: "Control the lab's safety protocols. Enable 'Dry Run' to simulate changes, or use launch codes to unlock Pro-tier capabilities.",
    expectation: "A customized cleanup workflow tailored to your privacy needs and storage hardware requirements.",
    view: "SETTINGS"
  }
];

export const TutorialOverlay: FC<TutorialOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose(dontShowAgain);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, dontShowAgain]);

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-2xl glass rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl border-white/20 animate-in zoom-in-95 duration-500">
        
        <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 px-1 pt-1">
          {TUTORIAL_STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-full flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-blue-500' : 'bg-white/10'}`} 
            />
          ))}
        </div>

        <button
          onClick={() => onClose(false)}
          aria-label="Close tutorial"
          title="Close"
          className="absolute top-6 right-6 p-3 glass rounded-2xl hover:bg-white/10 text-slate-400 hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-10 pt-20 flex flex-col items-center text-center space-y-8">
          <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl shadow-blue-500/10 animate-pulse">
            {step.icon}
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">{step.title}</h2>
            <div className="flex items-center justify-center gap-2">
               <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase rounded tracking-widest border border-blue-500/20">
                Onboarding Node {currentStep + 1} of {TUTORIAL_STEPS.length}
               </span>
            </div>
          </div>

          <div className="space-y-6 text-left w-full">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 tracking-widest mb-3">
                <Info size={14} /> Functionality
              </h4>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                {step.description}
              </p>
            </div>

            <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-3">
                <Check size={14} /> Expected Output
              </h4>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                {step.expectation}
              </p>
            </div>
          </div>
        </div>

        <footer className="p-10 flex flex-col gap-6 bg-white/5 mt-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${currentStep === 0 ? 'opacity-0' : 'text-slate-400 hover:text-white'}`}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            
            <button 
              onClick={handleNext}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'Start Mission' : 'Next Lesson'} 
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <label className="flex items-center gap-3 cursor-pointer group py-2">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="peer sr-only"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                <div className="w-5 h-5 border-2 border-slate-600 rounded-lg bg-transparent peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                  <Check size={12} className={`text-white transition-opacity ${dontShowAgain ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-200 transition-colors">Don't show this manual on startup</span>
            </label>
          </div>
        </footer>
      </div>
    </div>
  );
};
