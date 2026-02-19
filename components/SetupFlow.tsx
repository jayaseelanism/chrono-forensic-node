
import { useState } from 'react';
import type { FC } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Lock, 
  Check, 
  Smartphone, 
  Fingerprint,
  HardDrive
} from 'lucide-react';

interface SetupFlowProps {
  onComplete: () => void;
}

export const SetupFlow: FC<SetupFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);

  const steps = [
    {
      title: "Chrono Lab",
      subtitle: "Privacy-first media forensics.",
      icon: <Activity className="text-blue-400" size={40} />,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/40 border border-white/50 flex items-center gap-4">
            <Smartphone className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs font-bold text-slate-900">Mobile-first design for rapid archive browsing.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/40 border border-white/50 flex items-center gap-4">
            <HardDrive className="text-indigo-600 shrink-0" size={20} />
            <p className="text-xs font-bold text-slate-900">All data stays in your browser cache/local storage.</p>
          </div>
        </div>
      )
    },
    {
      title: "Secure Node",
      subtitle: "Local compute signatures.",
      icon: <ShieldCheck className="text-emerald-400" size={40} />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 text-center">
              <Fingerprint className="mx-auto text-blue-500 mb-1" size={24} />
              <p className="font-black text-[9px] uppercase tracking-widest">Safe</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 text-center">
              <Lock className="mx-auto text-purple-500 mb-1" size={24} />
              <p className="font-black text-[9px] uppercase tracking-widest">Local</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed px-1">
            Chrono uses high-performance SHA-256 hashing. No third-party servers touch your bits.
          </p>
        </div>
      )
    },
    {
      title: "Initialize",
      subtitle: "Forensic Protocol Agreement.",
      icon: <Check className="text-blue-500" size={40} />,
      content: (
        <div className="space-y-4">
          <div className="h-32 overflow-y-auto p-4 bg-slate-100/50 rounded-2xl text-[10px] text-slate-600 leading-relaxed font-medium border border-slate-200 scrollbar-hide">
            <p>1. <strong>Local processing:</strong> Chrono is a web-based local analyzer.</p>
            <p>2. <strong>Data Responsibility:</strong> Maintain a primary backup of your media.</p>
            <p>3. <strong>Permissions:</strong> The app requests access to process local files.</p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/50 rounded-xl border border-white/60">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded-lg border-slate-300"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-xs font-bold text-slate-700">I agree to the Protocols.</span>
          </label>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-xl" />
      <div className="relative w-full max-w-sm glass rounded-[3rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-500 border-white/60">
        <div className="p-8 pt-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-white/60 rounded-[1.8rem] flex items-center justify-center shadow-xl border border-white/80">
            {currentStep.icon}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{currentStep.title}</h2>
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">{currentStep.subtitle}</p>
          </div>
          <div className="w-full text-left">{currentStep.content}</div>
        </div>
        <div className="p-8 pt-0 flex flex-col gap-3">
          <button 
            onClick={() => step < steps.length ? setStep(step + 1) : onComplete()}
            disabled={step === steps.length && !agreed}
            className={`w-full py-4 rounded-2xl font-black transition-all shadow-xl flex items-center justify-center gap-2 ${
              (step === steps.length && !agreed) ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white active:scale-95'
            }`}
          >
            {step === steps.length ? 'Mount Node' : 'Continue'} <ArrowRight size={18} />
          </button>
          <button onClick={onComplete} className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors">Skip Onboarding</button>
        </div>
      </div>
    </div>
  );
};
