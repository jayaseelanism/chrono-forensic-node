
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import type { FC } from 'react';
/* Removed non-existent TourSeenState from types import */
import { TourStep } from '../types';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, HelpCircle } from 'lucide-react';

interface InteractiveTourProps {
  steps: TourStep[];
  onComplete: (dontShowAgain: boolean) => void;
  onClose: () => void;
}

export const InteractiveTour: FC<InteractiveTourProps> = ({ steps, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];

  const updatePosition = () => {
    if (!step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        setTargetRect(el.getBoundingClientRect());
      }, 300); // Wait for scroll
    } else {
      setTargetRect(null);
    }
  };

  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(dontShowAgain);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!step) return null;

  const spotlightStyle: React.CSSProperties = targetRect ? {
    position: 'fixed',
    top: targetRect.top - 8,
    left: targetRect.left - 8,
    width: targetRect.width + 16,
    height: targetRect.height + 16,
    borderRadius: '1.5rem',
    boxShadow: '0 0 0 9999px rgba(10, 10, 12, 0.7)',
    zIndex: 1100,
    transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
    pointerEvents: 'none',
    border: '2px solid rgba(255,255,255,0.8)'
  } : {
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    boxShadow: '0 0 0 9999px rgba(10, 10, 12, 0.7)',
    zIndex: 1100,
  };

  const tooltipStyle: React.CSSProperties = targetRect ? {
    position: 'fixed',
    top: targetRect.bottom + 24 > window.innerHeight - 250 ? targetRect.top - 280 : targetRect.bottom + 24,
    left: Math.max(20, Math.min(window.innerWidth - 340, targetRect.left + targetRect.width / 2 - 160)),
    width: 320,
    zIndex: 1200,
    transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
  } : {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 320,
    zIndex: 1200,
  };

  return (
    <div className="fixed inset-0 z-[1050] pointer-events-none">
      <div className="absolute inset-0 pointer-events-auto" onClick={onClose} />
      
      <div style={spotlightStyle} />

      <div style={tooltipStyle} className="glass rounded-[2.5rem] p-8 shadow-2xl border-white/40 animate-in fade-in slide-in-from-bottom-4 pointer-events-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Sparkles size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step {currentStep + 1} of {steps.length}</span>
          </div>
          <button onClick={onClose} aria-label="Close tour" title="Close" className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <h4 className="text-xl font-black text-slate-900 leading-tight mb-2">{step.title}</h4>
        <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">{step.description}</p>
        
        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mb-6">
          <h5 className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Expected Output</h5>
          <p className="text-[11px] text-slate-600 font-bold italic">"{step.expectation}"</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`text-xs font-black uppercase tracking-widest flex items-center gap-1 transition-all ${currentStep === 0 ? 'opacity-0' : 'text-slate-400 hover:text-slate-900'}`}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button 
              onClick={handleNext}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'}
              <ChevronRight size={16} />
            </button>
          </div>

          {currentStep === steps.length - 1 && (
            <label className="flex items-center gap-2 cursor-pointer group pt-2 border-t border-black/5">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <div className="w-4 h-4 rounded border border-slate-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                <Check size={10} className="text-white" />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600">Don't show this tour again</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
