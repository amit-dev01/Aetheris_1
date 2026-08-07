import { useState, useContext } from 'react';
import { Building2, Sparkles, CheckCircle2 } from 'lucide-react';
import LoadingView from './LoadingView';
import ResultsView from './ResultsView';
import { DbContext } from '../App';

export default function MyCompanySection() {
  const { myCompany } = useContext(DbContext);
  const [view, setView] = useState('profile'); // profile | loading | results
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunAnalysis = async () => {
    setError(null);
    setView('loading');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(myCompany),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setView('results');
    } catch (err) {
      setError(err.message);
      setView('profile');
    }
  };

  if (view === 'loading') return <LoadingView />;
  if (view === 'results' && result) {
    return (
      <div className="animate-fade-in-up">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="text-green-500" /> Internal Baseline Generated
            </h2>
            <p className="text-sm text-slate-500 mt-1">Review your company's automated SWOT analysis.</p>
          </div>
          <button 
            onClick={() => setView('profile')}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Back to Profile
          </button>
        </div>
        <ResultsView result={result} onNewAnalysis={() => setView('profile')} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Company Profile</h1>
        <p className="text-slate-500 mt-2">These details are saved from your signup and used as the baseline for competitor comparisons.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mb-6">
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{myCompany.company_name}</h2>
          <a href={myCompany.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm block mb-6">
            {myCompany.website_url}
          </a>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Industry</div>
              <div className="font-medium text-slate-800 dark:text-slate-200">{myCompany.industry}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Focus Areas</div>
              <div className="flex gap-2 flex-wrap mt-1">
                {myCompany.focus_areas.map(area => (
                  <span key={area} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Internal Context</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {myCompany.our_company_context || "None provided."}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
           <button
             onClick={handleRunAnalysis}
             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
           >
             <Sparkles size={18} /> Run Baseline Analysis
           </button>
        </div>
      </div>
    </div>
  );
}
