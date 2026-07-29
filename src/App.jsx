import { useState, useEffect, useCallback } from 'react';
import { Menu, X, PlusCircle, Clock, Pencil } from 'lucide-react';
import InputForm from './components/InputForm';
import LoadingView from './components/LoadingView';
import ResultsView from './components/ResultsView';
import { W, S, HISTORY_KEY, MAX_HISTORY } from './constants';

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
    <div className="min-h-screen flex flex-col">
      {/* ─── Header ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b-[3px] border-pencil"
        style={{ borderBottomLeftRadius: '0 0', borderBottomRightRadius: '0 0' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted/50 transition-colors"
              style={{ borderRadius: W.sm }}
              aria-label="Toggle history"
            >
              {sidebarOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
            </button>
            <h1
              className="font-kalam text-xl md:text-2xl font-bold cursor-pointer select-none"
              onClick={handleNewAnalysis}
            >
              <Pencil size={20} className="inline -mt-1 mr-1" strokeWidth={3} />
              Competitor Analysis <span className="text-accent inline-block rotate-2">AI</span>
            </h1>
          </div>

          {view === 'results' && (
            <button
              onClick={handleNewAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-white border-[3px] border-pencil font-patrick text-lg
                         hover:bg-accent hover:text-white active:translate-x-1 active:translate-y-1
                         transition-all duration-100"
              style={{ borderRadius: W.pill, boxShadow: S.hard }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = S.hardHover}
              onMouseLeave={e => e.currentTarget.style.boxShadow = S.hard}
            >
              <PlusCircle size={18} strokeWidth={2.5} /> New Analysis
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
              className="fixed inset-0 bg-pencil/20 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className="fixed md:sticky top-[60px] left-0 z-30 w-72 h-[calc(100vh-60px)]
                         bg-white border-r-[3px] border-pencil overflow-y-auto p-4
                         animate-fade-in"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-kalam text-lg font-bold flex items-center gap-2">
                  <Clock size={18} strokeWidth={2.5} /> History
                </h2>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-sm text-accent hover:underline font-patrick"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-pencil/50 font-patrick text-lg italic">No analyses yet ✏️</p>
              ) : (
                <ul className="space-y-3 stagger">
                  {history.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => loadHistoryItem(item)}
                        className="w-full text-left p-3 border-2 border-pencil bg-post-it
                                   hover:-rotate-1 hover:shadow-hard transition-all duration-100
                                   animate-fade-in-up"
                        style={{ borderRadius: W.sm, boxShadow: S.hardSm }}
                      >
                        <span className="font-kalam font-bold block text-base leading-tight">
                          {item.company_name}
                        </span>
                        <span className="text-sm text-pencil/60 font-patrick">
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
        <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-5xl mx-auto w-full">
          {/* Error banner */}
          {error && (
            <div
              className="mb-6 p-4 bg-white border-[3px] border-accent text-pencil
                         font-patrick text-lg animate-fade-in-up"
              style={{ borderRadius: W.md, boxShadow: '4px 4px 0px 0px #ff4d4d' }}
            >
              <strong className="font-kalam text-accent">Oops!</strong> {error}
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
