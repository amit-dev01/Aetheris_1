import { useState, useContext } from 'react';
import { DbContext } from '../App';
import { Filter, Bot, ExternalLink, Zap } from 'lucide-react';

export default function MarketIntelligenceSection() {
  const { feed } = useContext(DbContext);
  const [activeFilter, setActiveFilter] = useState('All');
  const [impactFilter, setImpactFilter] = useState('All');

  const categories = ['All', 'Product', 'Pricing', 'Funding', 'Hiring', 'Marketing', 'Partnerships', 'Customer Sentiment'];
  const impacts = ['All', 'High', 'Medium', 'Low', 'Opportunity'];

  const filteredFeed = feed.filter(item => {
    if (activeFilter !== 'All' && item.category !== activeFilter) return false;
    if (impactFilter !== 'All' && item.impact !== impactFilter) return false;
    return true;
  });

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50';
      case 'Medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 border-amber-200 dark:border-amber-900/50';
      case 'Low': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      case 'Opportunity': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500 border-emerald-200 dark:border-emerald-900/50';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getImpactDot = (impact) => {
    switch (impact) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Opportunity': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Market Intelligence</h1>
          <p className="text-slate-500 mt-2">AI-curated events and signals from your competitors and industry.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(c => (
              <button 
                key={c}
                onClick={() => setActiveFilter(c)}
                className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeFilter === c 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Zap size={16} className="text-slate-400 shrink-0" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {impacts.map(i => (
              <button 
                key={i}
                onClick={() => setImpactFilter(i)}
                className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  impactFilter === i 
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredFeed.map(item => (
          <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getImpactColor(item.impact)}`}>
                  {getImpactDot(item.impact)} {item.impact} IMPACT
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  {item.company}
                </span>
                <span className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                  {item.category}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {new Date(item.date).toLocaleDateString()}
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{item.summary}</p>

            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
               <div className="flex items-start gap-3">
                 <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                   <Bot size={18} />
                 </div>
                 <div className="flex-1">
                   <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">AI Interpretation</h4>
                   <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                     {item.ai_interpretation}
                   </p>
                   
                   {item.recommended_action && (
                     <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Zap size={16} className="text-amber-500" /> Action: {item.recommended_action}
                        </span>
                        <button className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-medium transition-colors">
                          Generate Strategy
                        </button>
                     </div>
                   )}
                 </div>
               </div>
            </div>

          </div>
        ))}

        {filteredFeed.length === 0 && (
           <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
             <Filter size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
             <p className="text-slate-500 font-medium">No events match the current filters.</p>
           </div>
        )}
      </div>
    </div>
  );
}
