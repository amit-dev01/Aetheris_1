import { useContext } from 'react';
import { Users, Bot, Zap, ShieldAlert, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { DbContext } from '../App';

export default function CompetitorsSection() {
  const { competitors, myCompany } = useContext(DbContext);

  const renderComparisonRow = (label, myValue, compValues) => (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="py-4 px-6 font-medium text-sm text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50">{label}</td>
      <td className="py-4 px-6 text-sm text-blue-600 dark:text-blue-400 font-bold bg-blue-50/30 dark:bg-blue-900/10 border-l border-r border-blue-100 dark:border-blue-900/30">
        {myValue}
      </td>
      {compValues.map((val, i) => (
        <td key={i} className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 text-center">
          {val}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto space-y-12">
      
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Users size={28} className="text-blue-600" /> Competitor Landscape
        </h1>
        <p className="text-slate-500 mt-2">Track competitors and see AI-derived competitive positioning.</p>
      </div>

      {/* ── Competitor Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitors.map(comp => (
          <div key={comp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xl">
                   {comp.logo}
                 </div>
                 <div className="flex flex-col items-end">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Score</div>
                   <div className="text-lg font-black text-blue-600 dark:text-blue-400">{comp.ai_score}</div>
                 </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                {comp.company_name}
              </h3>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">{comp.industry}</div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="font-medium text-slate-900 dark:text-white">{comp.competitive_status}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Pricing</span>
                  <span className={`font-medium ${comp.pricing_indicator.includes('↑') ? 'text-red-500' : comp.pricing_indicator.includes('↓') ? 'text-green-500' : 'text-slate-700 dark:text-slate-300'}`}>{comp.pricing_indicator}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Growth</span>
                  <span className="font-medium text-green-500">{comp.growth_indicator}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Sentiment</span>
                  <span className={`font-medium ${comp.sentiment_indicator.includes('↑') ? 'text-green-500' : comp.sentiment_indicator.includes('↓') ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{comp.sentiment_indicator}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 mb-1">Recent Important Event</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={comp.recent_event}>
                  {comp.recent_event}
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-4">
               <button className="w-full flex justify-center items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                 <Zap size={16} /> Analyze Deeply
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Comparison Table ── */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Competitive Comparison</h2>
          <div className="group relative">
             <HelpCircle size={16} className="text-slate-400 cursor-help" />
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
               Scores are AI-derived estimations based on aggregated market data, sentiment analysis, and feature comparisons.
             </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800">
                <th className="py-5 px-6 font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50 min-w-[150px]">Dimension</th>
                <th className="py-5 px-6 font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 border-l border-r border-blue-100 dark:border-blue-900/30 text-center min-w-[150px]">
                  {myCompany.company_name} (Us)
                </th>
                {competitors.map(comp => (
                  <th key={comp.id} className="py-5 px-6 font-bold text-slate-700 dark:text-slate-300 text-center min-w-[150px]">
                    {comp.company_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {renderComparisonRow('Pricing Power', 'Strong (8.5/10)', ['High (9.0)', 'Moderate (7.0)', 'Disruptive (8.0)'])}
              {renderComparisonRow('Product UX', 'Excellent (9.2/10)', ['Good (7.5)', 'Great (8.5)', 'Average (6.0)'])}
              {renderComparisonRow('Enterprise Ready', 'Developing (6.0/10)', ['Dominant (9.5)', 'Strong (8.0)', 'Weak (4.0)'])}
              {renderComparisonRow('Brand Awareness', 'Moderate (5.5/10)', ['Ubiquitous (9.8)', 'Strong (8.5)', 'Growing (6.5)'])}
              {renderComparisonRow('Innovation Speed', 'Fast (8.8/10)', ['Slow (5.0)', 'Moderate (6.5)', 'Fast (8.5)'])}
              {renderComparisonRow('Customer Sentiment', 'Positive (8.9/10)', ['Mixed (6.0)', 'Positive (8.0)', 'Negative (4.5)'])}
            </tbody>
          </table>
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
             <Bot size={14} /> AI confidence interval: 85-92%
          </div>
        </div>
      </div>
      
    </div>
  );
}
