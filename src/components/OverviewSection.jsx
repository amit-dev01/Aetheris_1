import { useContext } from 'react';
import { DbContext } from '../App';
import { AlertCircle, AlertTriangle, Lightbulb, ChevronRight, TrendingUp, TrendingDown, Minus, Bot } from 'lucide-react';

export default function OverviewSection() {
  const { myCompany, competitors } = useContext(DbContext);

  return (
    <div className="animate-fade-in-up max-w-5xl space-y-8">
      
      {/* ── 1. Company Context ── */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Our Company Baseline</div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{myCompany.company_name}</h1>
            <p className="text-slate-500">{myCompany.industry}</p>
          </div>
          <div className="flex gap-6 items-center">
            <div className="text-center">
               <div className="text-xs text-slate-500 uppercase">Revenue</div>
               <div className="text-xl font-bold text-slate-900 dark:text-white">{myCompany.revenue}</div>
            </div>
            <div className="text-center">
               <div className="text-xs text-slate-500 uppercase">Customers</div>
               <div className="text-xl font-bold text-slate-900 dark:text-white">{myCompany.customers}</div>
            </div>
            <div className="text-center">
               <div className="text-xs text-slate-500 uppercase">Growth</div>
               <div className="text-xl font-bold text-green-600 dark:text-green-400">{myCompany.growth}</div>
            </div>
             <div className="text-center pl-6 border-l border-slate-200 dark:border-slate-700">
               <div className="text-xs text-slate-500 uppercase">Comp. Score</div>
               <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{myCompany.competitive_score}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wide">Key Strengths</h3>
            <ul className="space-y-2">
              {myCompany.strengths.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wide">Key Weaknesses</h3>
            <ul className="space-y-2">
              {myCompany.weaknesses.map((w, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 2. AI Executive Brief ── */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">AI Executive Brief</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-2">
              <AlertCircle size={20} /> 🔴 Threats
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed">
              Competitor Stripe launched a lower-priced enterprise plan yesterday. This could create pricing pressure in our enterprise segment.
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold mb-2">
              <AlertTriangle size={20} /> 🟡 Important Changes
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed">
              Shopify has announced a new strategic AWS partnership, potentially strengthening their enterprise distribution channel significantly.
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold mb-2">
              <Lightbulb size={20} /> 🟢 Opportunities
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed">
              Paddle is receiving negative customer sentiment around weekend support wait times. Opportunity to differentiate on reliability.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-2">
                <ChevronRight size={20} /> 🔵 Recommended Actions
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed mb-4">
                Review enterprise pricing strategy in response to Stripe. Emphasize our 24/7 support offering in upcoming marketing.
              </p>
            </div>
            <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium self-start transition-colors shadow-sm">
              View Strategy
            </button>
          </div>
        </div>
      </section>

      {/* ── 6. "What Changed?" Section ── */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What Changed?</h2>
            <p className="text-sm text-slate-500 mt-1">AI-detected shifts in the last 30 days across your tracked competitors.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.slice(0, 2).map(comp => (
            <div key={comp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">
                  {comp.logo}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{comp.company_name}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Pricing</div>
                  <div className={`font-medium flex items-center gap-1 ${comp.pricing_indicator.includes('↑') ? 'text-red-500' : comp.pricing_indicator.includes('↓') ? 'text-green-500' : 'text-slate-600 dark:text-slate-400'}`}>
                    {comp.pricing_indicator}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Growth</div>
                  <div className="font-medium text-green-500 flex items-center gap-1">
                    {comp.growth_indicator}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Sentiment</div>
                  <div className={`font-medium flex items-center gap-1 ${comp.sentiment_indicator.includes('↑') ? 'text-green-500' : comp.sentiment_indicator.includes('↓') ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                    {comp.sentiment_indicator}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Recent Event</div>
                  <div className="font-medium text-slate-700 dark:text-slate-300 truncate" title={comp.recent_event}>
                    {comp.recent_event}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex gap-3">
           <div className="mt-0.5 text-blue-600 dark:text-blue-400"><Bot size={18} /></div>
           <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
             <span className="font-bold text-slate-900 dark:text-white">AI Interpretation:</span> {competitors[0].company_name} appears to be moving aggressively toward the enterprise segment while simultaneously lowering prices, putting pressure on mid-market margins.
           </p>
        </div>
      </section>

    </div>
  );
}
