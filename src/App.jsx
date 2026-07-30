import { useState, useEffect, useCallback } from 'react';
import { Menu, X, PlusCircle, Clock } from 'lucide-react';
import InputForm from './components/InputForm';
import LoadingView from './components/LoadingView';
import ResultsView from './components/ResultsView';
import { HISTORY_KEY, MAX_HISTORY } from './constants';

export default function App() {
  const [view, setView] = useState('form');       // form | loading | results
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Load history from localStorage on mount ───────────── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore corrupt data */ }
  }, []);

  /* ── API call ──────────────────────────────────────────── */
  const handleSubmit = useCallback(async (formData) => {
    setError(null);
    setView('loading');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);

      // persist to history
      const entry = {
        id: Date.now(),
        company_name: data.company_name,
        timestamp: data.generated_at,
        result: data,
      };
      const next = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(next);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));

      setView('results');
    } catch (err) {
      setError(err.message);
      setView('form');
    }
  }, [history]);

  /* ── Navigation helpers ────────────────────────────────── */
  const handleNewAnalysis = () => { setResult(null); setError(null); setView('form'); };
  const loadHistoryItem  = (item) => { setResult(item.result); setView('results'); setSidebarOpen(false); };
  const clearHistory     = () => { setHistory([]); localStorage.removeItem(HISTORY_KEY); };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white">
      {/* ─── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-black border-b-4 border-black dark:border-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 border-2 border-black dark:border-white hover:bg-accent hover:text-white dark:hover:text-black dark:hover:bg-white transition-colors"
              aria-label="Toggle history"
            >
              {sidebarOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
            </button>
            <h1
              className="font-heading text-lg md:text-xl font-black cursor-pointer select-none uppercase tracking-widest flex items-center gap-2"
              onClick={handleNewAnalysis}
            >
              <span>Competitor Analysis</span>
              <span className="bg-accent text-white px-2 py-0.5 font-mono text-xs">AI</span>
            </h1>
          </div>

          {view === 'results' && (
            <button
              onClick={handleNewAnalysis}
              className="flex items-center gap-2 px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-heading text-sm font-black uppercase tracking-wider hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-colors"
            >
              <PlusCircle size={16} strokeWidth={3} /> New Analysis
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* ─── History Sidebar ─────────────────────────────── */}
        {sidebarOpen && (
          <>
            {/* backdrop (mobile) */}
            <div
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className="fixed md:sticky top-[60px] left-0 z-30 w-72 h-[calc(100vh-60px)]
                         bg-white dark:bg-black border-r-4 border-black dark:border-white overflow-y-auto p-5
                         animate-fade-in flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock size={16} strokeWidth={3} /> History
                </h2>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs font-black uppercase tracking-widest text-accent hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">No previous runs [E_EMPTY]</p>
              ) : (
                <ul className="space-y-4 stagger">
                  {history.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => loadHistoryItem(item)}
                        className="w-full text-left p-4 border-2 border-black dark:border-white bg-tertiary dark:bg-slate-900
                                   hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-colors
                                   animate-fade-in-up flex flex-col gap-1.5"
                      >
                        <span className="font-heading font-black block text-sm uppercase tracking-wider leading-tight">
                          {item.company_name}
                        </span>
                        <span className="text-[10px] font-mono opacity-60">
                          {new Date(item.timestamp).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </>
        )}

        {/* ─── Main Content ────────────────────────────────── */}
        <main className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
          {/* Error banner */}
          {error && (
            <div
              className="mb-8 p-5 bg-white dark:bg-black border-4 border-accent text-black dark:text-white
                         font-mono text-sm uppercase tracking-wider animate-fade-in-up"
            >
              <strong className="text-accent font-black block mb-1">Error:</strong> {error}
            </div>
          )}

          {view === 'form'    && <InputForm onSubmit={handleSubmit} />}
          {view === 'loading' && <LoadingView />}
          {view === 'results' && result && (
            <ResultsView result={result} onNewAnalysis={handleNewAnalysis} />
          )}
        </main>
      </div>
    </div>
  );
}
