
import { useState, useRef } from 'react';
import type { FC } from 'react';
import { BrainCircuit, Send, Upload, X, Terminal, Sparkles, Loader2 } from 'lucide-react';
import { analyzeMedia, quickChat } from '../services/aiService';

interface SelectedFile { file: File; previewUrl: string; id: string; }

export const AILaboratory: FC<{ onLog: (msg: string, type?: any) => void }> = ({ onLog }) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [messages, setMessages] = useState<{role: 'user' | 'ai' | 'error', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input; setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    onLog(`Neural query processing`, 'info');
    
    try {
      const resp = selectedFiles.length > 0 && messages.length === 0
        ? await analyzeMedia(selectedFiles.map(f => ({ id: f.id, data: undefined, mimeType: f.file.type, metadata: { name: f.file.name } })), userMsg)
        : await quickChat(userMsg, messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })));
      
      setMessages(prev => [...prev, { role: 'ai', text: resp }]);
      onLog("Synthesis complete", 'success');
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'error', text: e.message }]);
      onLog("Neural failure", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 p-12 pb-32">
      {/* Left: Artifact Selection */}
      <div className="lg:w-1/3 flex flex-col gap-6">
        <div className="bento-card p-8 space-y-2 bg-white/80">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Neural Oracle</h2>
          <p className="text-slate-500 font-medium">Vision-AI forensic analyzer.</p>
        </div>

        <div className="flex-1 bento-card p-6 flex flex-col gap-4">
           <div
             className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-fluid-indigo transition-colors"
             onClick={() => fileInputRef.current?.click()}
             role="button"
             tabIndex={0}
             onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
             aria-label="Add artifacts to analyze"
           >
              <Upload size={32} className="text-fluid-indigo mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Add artifacts to analyze</p>
              <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!).map(f => ({ file: f, id: Math.random().toString(36).substr(2,9), previewUrl: URL.createObjectURL(f as Blob) }))])} />
           </div>

           <div className="grid grid-cols-2 gap-3">
              {selectedFiles.map(f => (
                <div key={f.id} className="aspect-square rounded-2xl overflow-hidden relative group border border-slate-100 shadow-sm">
                   <img src={f.previewUrl} alt={`Preview ${f.file.name}`} className="w-full h-full object-cover" />
                   <button
                     onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter(item => item.id !== f.id)); }}
                     aria-label={`Remove ${f.file.name}`}
                     title="Remove file"
                     className="absolute top-2 right-2 p-1 bg-white/80 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <X size={14} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Right: Neural Chat */}
      <div className="flex-1 bento-card p-8 flex flex-col gap-6 bg-white/50 backdrop-blur-3xl overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-none space-y-6 pr-2">
           {messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-200 gap-4">
                <BrainCircuit size={80} />
                <p className="text-sm font-black uppercase tracking-[0.5em]">System Idle</p>
             </div>
           ) : (
             messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                 <div className={`max-w-[80%] p-6 rounded-[2rem] ${
                   m.role === 'user' 
                     ? 'bg-fluid-indigo text-white shadow-lg' 
                     : m.role === 'error' 
                       ? 'bg-red-50 text-red-600 border border-red-100' 
                       : 'bg-white border border-slate-100 text-slate-700 shadow-sm'
                 }`}>
                   <p className="text-sm font-bold leading-relaxed">{m.text}</p>
                 </div>
               </div>
             ))
           )}
           {isLoading && (
              <div className="flex justify-start">
                 <div className="px-6 py-4 bg-white border border-slate-100 rounded-full flex items-center gap-3 shadow-sm">
                   <Loader2 className="animate-spin text-fluid-indigo" size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generating Synthesis...</span>
                 </div>
              </div>
           )}
        </div>

        <div className="relative">
           <input
             type="text"
             aria-label="Neural query input"
             placeholder="Query the node..."
             className="w-full bg-white border border-slate-100 rounded-[2rem] px-10 py-5 text-sm font-bold text-slate-800 focus:border-fluid-indigo outline-none transition-all shadow-sm pr-20"
             value={input}
             onChange={e => setInput(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleSend()}
           />
           <button
             onClick={handleSend}
             aria-label="Send neural query"
             title="Send"
             disabled={!input.trim() || isLoading}
             className="absolute right-2 top-2 p-3 bg-fluid-indigo text-white rounded-full hover:scale-110 active:scale-90 transition-all shadow-lg shadow-indigo-100"
           >
             <Send size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};
