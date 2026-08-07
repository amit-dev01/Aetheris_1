import { useState, useContext, useCallback } from 'react';
import { Plus, Building, ExternalLink, ArrowLeft } from 'lucide-react';
import InputForm from './InputForm';
import LoadingView from './LoadingView';
import ResultsView from './ResultsView';
import { DbContext } from '../App';
import { HISTORY_KEY, MAX_HISTORY } from '../constants';

export default function CompetitorsSection() {
  const { competitors, myCompany } = useContext(DbContext);
  const [view, setView] = useState('grid'); // grid | form | loading | results
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runAnalysis = useCallback(async (formData) => {
    setError(null);
    setView('loading');
    try {
      // Include our company context if not present in the competitor object
      const payload = {
        ...formData,
        our_company_context: formData.our_company_context || myCompany.our_company_context
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      
      // Save to local storage history for UniFeed
      try {
        const stored = localStorage.getItem(HISTORY_KEY);
        let history = stored ? JSON.parse(stored) : [];
        const entry = { id: Date.now(), company_name: data.company_name, timestamp: data.generated_at, result: data };
        history = [entry, ...history].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch (e) { console.error('History save failed', e); }

      setView('results');
    } catch (err) {
      setError(err.message);
      setView('grid');
    }
  }, [myCompany]);

  const handleAddNewSubmit = (formData) => {
    runAnalysis(formData);
  };

  const handleCompetitorClick = (comp) => {
    runAnalysis(comp);
  };

  if (view === 'loading') return <LoadingView />;
  if (view === 'results' && result) {
    return (
      <div className="animate-fade-in-up">
        <button 
          onClick={() => setView('grid')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Competitors
        </button>
        <ResultsView result={result} onNewAnalysis={() => setView('grid')} />
      </div>
    );
  }
  if (view === 'form') {
    return (
      <div className="animate-fade-in-up">
        <button 
          onClick={() => setView('grid')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Cancel
        </button>
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
        <InputForm 
          onSubmit={handleAddNewSubmit}
          title="Add New Competitor"
          subtitle="Manually enter a competitor to add to your tracking portfolio."
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tracked Competitors</h1>
          <p className="text-slate-500 mt-2">Click any competitor to run a real-time AI market analysis against your baseline.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pre-saved Competitors */}
        {competitors.map(comp => (
          <button
            key={comp.id}
            onClick={() => handleCompetitorClick(comp)}
            className="text-left bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                <Building size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{comp.company_name}</h3>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">{comp.industry}</div>
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                Run Analysis <ExternalLink size={12} />
              </div>
            </div>
          </button>
        ))}

        {/* Add New Card */}
        <button
          onClick={() => setView('form')}
          className="flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
            <Plus size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Add Competitor</h3>
          <p className="text-sm text-slate-500 mt-2">Track a new company</p>
        </button>
      </div>
    </div>
  );
}
