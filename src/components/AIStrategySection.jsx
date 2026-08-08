import { useContext } from 'react';
import { DbContext } from '../App';
import { Target, ArrowRight, Zap } from 'lucide-react';

export default function AIStrategySection() {
  const { strategy } = useContext(DbContext);

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Target size={28} className="text-blue-600" /> Strategic Recommendations
        </h1>
        <p className="text-slate-500 mt-2">AI-generated action plans based on recent intelligence and market shifts.</p>
      </div>

      <div className="space-y-6">
        {strategy.map((item, idx) => (
          <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className={`h-1.5 w-full ${item.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-3 inline-block ${
                     item.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500'
                   }`}>
                     {item.priority === 'High' ? '🔴 HIGH PRIORITY' : '🟡 MEDIUM PRIORITY'}
                   </span>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{item.title}</h2>
                 </div>
                 <button className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                   <Zap size={18} /> Generate Strategy
                 </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">AI Reasoning</h3>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{item.reason}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Recommended Actions</h3>
                <ul className="space-y-3">
                  {item.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                       <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                         {i + 1}
                       </div>
                       <span className="text-slate-700 dark:text-slate-200 font-medium">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="md:hidden mt-6 w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-sm">
                <Zap size={18} /> Generate Strategy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Explainer */}
      <div className="mt-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">How Aetheris generates intelligence</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
           <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">DATA</div>
           <ArrowRight size={16} className="rotate-90 md:rotate-0" />
           <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">EVENT</div>
           <ArrowRight size={16} className="rotate-90 md:rotate-0" />
           <div className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-lg shadow-sm border border-blue-200 dark:border-blue-900/50">AI INTERPRETATION</div>
           <ArrowRight size={16} className="rotate-90 md:rotate-0" />
           <div className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 px-4 py-2 rounded-lg shadow-sm border border-amber-200 dark:border-amber-900/50">BUSINESS IMPACT</div>
           <ArrowRight size={16} className="rotate-90 md:rotate-0" />
           <div className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-500 px-4 py-2 rounded-lg shadow-sm border border-green-200 dark:border-green-900/50">RECOMMENDATION</div>
        </div>
      </div>
    </div>
  );
}
