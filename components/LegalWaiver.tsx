
import type { FC } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface LegalWaiverProps {
  onAccept: () => void;
}

export const LegalWaiver: FC<LegalWaiverProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Legal Agreement & Safety</h2>
            <p className="text-slate-500 text-sm font-medium">Please read carefully before proceeding</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          <section className="space-y-4">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-500" />
              Disclaimer of Liability
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              CHRONOPHOTO FIXER ("THE SOFTWARE") IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. 
              IN NO EVENT SHALL THE DEVELOPERS OR CONTRIBUTORS BE LIABLE FOR ANY CLAIM, DAMAGES OR 
              OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-500" />
              User Responsibilities
            </h3>
            <ul className="space-y-3">
              {[
                "You are solely responsible for backing up your data before performing any operations.",
                "Automated organization and metadata writing are permanent actions.",
                "You acknowledge that file corruption can occur during bulk move operations.",
                "Sidecar JSON cleanup is irreversible once the trash is emptied."
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-500 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </section>

          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
            <FileText className="text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              By clicking "I Accept", you signify your agreement to these terms. ChronoPhoto Fixer is a 
              locally-run tool designed for efficiency, but data safety starts with a primary backup.
            </p>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onAccept}
            className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all hover:scale-105"
          >
            I Accept & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
