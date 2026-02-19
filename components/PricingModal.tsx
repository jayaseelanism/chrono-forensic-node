
import { useState, useEffect, useMemo } from 'react';
import type { FC } from 'react';
import { Check, Zap, Crown, X, Ticket, ShieldCheck, AlertCircle, CreditCard, Lock, Loader2, ArrowRight, ShieldAlert, Fingerprint, KeyRound, BrainCircuit, Activity, CheckCircle2 } from 'lucide-react';
import { UserTier } from '../types';

interface PricingModalProps {
  onClose: () => void;
  onUpgrade: () => void;
  onRedeemCode: (code: string) => boolean;
  currentTier: UserTier;
}

type ModalView = 'pricing' | 'payment' | 'processing' | 'success';

interface FormErrors {
  number?: string;
  expiry?: string;
  cvc?: string;
  name?: string;
}

export const PricingModal: FC<PricingModalProps> = ({ onClose, onUpgrade, onRedeemCode, currentTier }) => {
  const [view, setView] = useState<ModalView>('pricing');
  const [showRedeem, setShowRedeem] = useState(false);
  const [code, setCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  
  // Payment form state
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleRedeem = () => {
    if (!code.trim()) return;
    if (onRedeemCode(code.trim().toUpperCase())) {
      setRedeemStatus('success');
      setTimeout(() => {
        onUpgrade();
        onClose();
      }, 1500);
    } else {
      setRedeemStatus('error');
      setTimeout(() => setRedeemStatus('idle'), 2000);
    }
  };

  const handleStartPayment = () => {
    setView('payment');
  };

  const cardBrand = useMemo(() => {
    const num = cardData.number.replace(/\D/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (num.match(/^5[1-5]/) || num.match(/^2[2-7]/)) return 'Mastercard';
    if (num.match(/^3[47]/)) return 'Amex';
    return null;
  }, [cardData.number]);

  const validate = (data: typeof cardData) => {
    const errors: FormErrors = {};
    const cleanNum = data.number.replace(/\D/g, '');
    const requiredLength = cardBrand === 'Amex' ? 15 : 16;
    
    if (cleanNum.length > 0 && cleanNum.length < requiredLength) {
      errors.number = `Incomplete Entry (${requiredLength} digits)`;
    }
    if (data.expiry.length > 0) {
      const parts = data.expiry.split(' / ');
      if (parts.length !== 2) errors.expiry = 'Format: MM / YY';
    }
    const requiredCvc = cardBrand === 'Amex' ? 4 : 3;
    if (data.cvc.length > 0 && data.cvc.length < requiredCvc) {
      errors.cvc = `Required: ${requiredCvc}`;
    }
    if (data.name.length > 0 && data.name.trim().split(' ').length < 2) {
      errors.name = 'Full Identity Required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    validate(cardData);
  }, [cardData, cardBrand]);

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setView('processing');
    setTimeout(() => {
      setView('success');
      setTimeout(() => {
        onUpgrade();
        onClose();
      }, 2500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-3xl animate-in fade-in duration-500 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl liquid-glass rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[4rem] shadow-2xl border border-white/20 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-500 my-auto">
        
        <button onClick={onClose} aria-label="Close pricing" title="Close" className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[1100] p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
          <X size={20} />
        </button>

        {view === 'pricing' && (
          <>
            {/* Left: Standard Tier */}
            <div className="md:w-1/3 p-8 sm:p-10 lg:p-14 space-y-8 bg-slate-50/5 dark:bg-white/5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Node Level 01</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Standard</h3>
              </div>
              <ul className="space-y-4">
                {["2k Asset Cache", "SHA-256 Auth", "Basic Metadata Fix"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                    <Check size={14} className="text-prism-azure shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="pt-8 border-t border-slate-200 dark:border-white/10">
                {!showRedeem ? (
                  <button 
                    onClick={() => setShowRedeem(true)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-prism-azure hover:opacity-70 transition-opacity"
                  >
                    <Ticket size={14} /> Have an activation code?
                  </button>
                ) : (
                  <div className="space-y-3 animate-in slide-in-from-top-2">
                    <div className="relative">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="ENTER PROTOCOL CODE" 
                        className={`w-full bg-white dark:bg-black border rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none transition-all ${
                          redeemStatus === 'error' ? 'border-red-500 text-red-500' : 'border-slate-200 dark:border-white/10 focus:border-prism-azure'
                        }`}
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                      />
                      {redeemStatus === 'error' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                          <AlertCircle size={14} />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleRedeem}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors"
                    >
                      {redeemStatus === 'success' ? 'Verifying...' : 'Verify Node'}
                    </button>
                    <button onClick={() => setShowRedeem(false)} className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Cancel</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Pro Tier */}
            <div className="flex-1 bg-slate-950 p-8 sm:p-10 lg:p-16 space-y-8 sm:space-y-10 relative overflow-hidden text-white flex flex-col">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-prism-azure/10 blur-[120px] -mr-64 -mt-64" />
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-prism-azure/10 text-prism-azure rounded-lg text-[9px] font-black uppercase border border-prism-azure/20">
                  <Crown size={12} /> PRO DEPLOYMENT RECOMMENDED
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-7xl font-black tracking-tighter uppercase leading-none">Chrono Pro</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative z-10">
                {[
                  { icon: <Zap size={14} />, text: "Infinite Scale" },
                  { icon: <BrainCircuit size={14} />, text: "AI Neural Lab" },
                  { icon: <ShieldCheck size={14} />, text: "Deep Forensics" },
                  { icon: <Activity size={14} />, text: "Audit History" }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="text-prism-azure shrink-0">{item.icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 relative z-10 mt-auto flex flex-col gap-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-6xl font-black">$6.99</span>
                  <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">/ node license</span>
                </div>
                <button 
                  onClick={handleStartPayment}
                  className="w-full py-5 sm:py-6 bg-prism-azure text-white rounded-2xl sm:rounded-3xl font-black text-lg sm:text-2xl uppercase tracking-widest shadow-xl shadow-prism-azure/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Upgrade Node
                </button>
              </div>
            </div>
          </>
        )}

        {view === 'payment' && (
          <div className="flex-1 bg-slate-900 text-white p-6 sm:p-10 lg:p-16 flex flex-col md:flex-row gap-8 lg:gap-12 animate-in slide-in-from-right duration-500">
            <div className="md:w-1/2 space-y-6 sm:space-y-8">
              <button onClick={() => setView('pricing')} className="text-prism-azure text-[10px] font-black uppercase flex items-center gap-2 hover:opacity-70 transition-opacity">
                <ArrowRight className="rotate-180" size={14} /> Back to Hub
              </button>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter">Auth Center</h2>
              <div className="p-5 sm:p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                  <span>Chrono Pro License</span>
                  <span>$6.99</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center font-black">
                  <span className="text-[10px] uppercase">Total Due</span>
                  <span className="text-xl sm:text-2xl">$6.99</span>
                </div>
              </div>
              <div className="flex items-center gap-4 opacity-50 text-[8px] font-black uppercase">
                <Lock size={12} /> Encrypted Uplink Active
              </div>
            </div>
            
            <form onSubmit={handleProcessPayment} className="md:w-1/2 space-y-6 bg-black/30 p-6 sm:p-8 rounded-[2rem] border border-white/5">
               <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-500">Full Name on Card</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-prism-azure focus:ring-1 focus:ring-prism-azure outline-none transition-all placeholder:text-white/20"
                      placeholder="JOHN DOE"
                      onChange={e => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-500">Card Number</label>
                    <input 
                      required
                      type="text" 
                      maxLength={19}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-prism-azure focus:ring-1 focus:ring-prism-azure outline-none transition-all placeholder:text-white/20"
                      placeholder="0000 0000 0000 0000"
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                        setCardData({...cardData, number: val});
                      }}
                      value={cardData.number}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-500">Expiry</label>
                      <input 
                        required
                        type="text" 
                        placeholder="MM / YY"
                        maxLength={7}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-prism-azure focus:ring-1 focus:ring-prism-azure outline-none transition-all placeholder:text-white/20"
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) val = val.slice(0, 2) + ' / ' + val.slice(2, 4);
                          setCardData({...cardData, expiry: val});
                        }}
                        value={cardData.expiry}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-500">CVC</label>
                      <input 
                        required
                        type="password" 
                        maxLength={4}
                        placeholder="•••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-prism-azure focus:ring-1 focus:ring-prism-azure outline-none transition-all placeholder:text-white/20"
                        onChange={e => setCardData({...cardData, cvc: e.target.value})}
                      />
                    </div>
                  </div>
               </div>
               <button 
                  type="submit"
                  className="w-full py-4 bg-prism-azure text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-prism-azure/20 mt-4 active:scale-95 transition-all"
               >
                 Authorize Secure Transaction
               </button>
            </form>
          </div>
        )}

        {view === 'processing' && (
          <div className="flex-1 bg-slate-900 p-12 sm:p-20 flex flex-col items-center justify-center text-center space-y-8 min-h-[400px]">
             <div className="relative">
                <Loader2 className="animate-spin text-prism-azure" size={64} />
                <Fingerprint className="absolute inset-0 m-auto text-white/30" size={24} />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">Security Handshake</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Synchronizing Payment Node • AES-256 Verified</p>
             </div>
          </div>
        )}

        {view === 'success' && (
          <div className="flex-1 bg-slate-900 p-12 sm:p-20 flex flex-col items-center justify-center text-center space-y-8 min-h-[400px] animate-in zoom-in-95">
             <div className="w-20 h-20 sm:w-24 sm:h-24 bg-prism-lime/20 rounded-full flex items-center justify-center text-prism-lime border border-prism-lime/30 shadow-2xl shadow-prism-lime/10">
                <CheckCircle2 size={48} className="animate-bounce" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Node Elevated</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Successful • Enterprise Protocols Active</p>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
