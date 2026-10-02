import { useState, useEffect } from 'react';
import { 
  Trophy, ThumbsDown, DollarSign, TrendingUp, AlertCircle, 
  RefreshCw, Plus, ArrowRight, ShieldAlert, BarChart3, HelpCircle
} from 'lucide-react';
import { getDealAnalytics } from '../api';

export default function WinLossAnalyticsCard({ onOpenLogModal, refreshTrigger }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDealAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load deal analytics:', err);
      setError(err.message || 'Failed to aggregate win/loss analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-3xl p-6 text-center space-y-2">
        <AlertCircle size={28} className="text-red-500 mx-auto" />
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Deal Analytics Unavailable</h4>
        <button
          onClick={fetchAnalytics}
          className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    totalDealsLogged = 0,
    overallWinRate = 0,
    wonDeals = 0,
    lostDeals = 0,
    pipelineWon = 0,
    pipelineLost = 0,
    headToHead = [],
    topLossReasons = [],
    recommendation,
  } = analytics;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Win/Loss Commercial Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live sales cycle outcomes, competitive win rates, and pipeline revenue at risk.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLogModal}
          className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
        >
          <Plus size={15} /> Log Closed Deal
        </button>
      </div>

      {/* ── KPI Stat Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-200/80 dark:border-emerald-900/40">
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Overall Win Rate
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {overallWinRate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {wonDeals} Won · {lostDeals} Lost ({totalDealsLogged} Total)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/[0.04] border border-blue-200/80 dark:border-blue-900/40">
          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Pipeline Won
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            ${Math.round(pipelineWon).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Total revenue captured vs. competitors
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-200/80 dark:border-rose-900/40">
          <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Revenue at Risk / Lost
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            ${Math.round(pipelineLost).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Lost deal value attributed to rivals
          </p>
        </div>
      </div>

      {/* ── Head to Head Breakdown ── */}
      {headToHead.length > 0 ? (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Head-to-Head Win Rates Against Rivals
          </div>
          <div className="space-y-2">
            {headToHead.map((item, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
              >
                <div className="space-y-1 sm:w-1/3">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    vs. {item.competitorName}
                  </span>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.won}W - {item.lost}L ({item.totalDeals} deals)
                  </div>
                </div>

                <div className="flex-1 max-w-xs space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Win Rate</span>
                    <span className={item.winRate >= 50 ? 'text-emerald-600' : 'text-rose-600'}>
                      {item.winRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all ${item.winRate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                      style={{ width: `${Math.min(100, Math.max(5, item.winRate))}%` }} 
                    />
                  </div>
                </div>

                {item.revenueAtRisk > 0 && (
                  <div className="text-right text-xs sm:w-1/4">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Lost Revenue</span>
                    <strong className="text-rose-600 dark:text-rose-400">
                      ${Math.round(item.revenueAtRisk).toLocaleString()}
                    </strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            No competitive deal outcomes logged yet.
          </p>
          <button
            onClick={onOpenLogModal}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            <Plus size={14} /> Log your first deal outcome
          </button>
        </div>
      )}

      {/* ── Recommendation ── */}
      {recommendation && (
        <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
          <ArrowRight size={14} className="text-blue-600 shrink-0 mt-0.5" />
          <span>{recommendation}</span>
        </div>
      )}

    </div>
  );
}
