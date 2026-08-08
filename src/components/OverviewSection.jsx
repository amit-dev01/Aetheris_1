import { useState, useEffect, useContext } from 'react';
import { DbContext } from '../App';
import { AlertCircle, AlertTriangle, Lightbulb, ShieldAlert, Users, Target, Zap, Clock, RefreshCw } from 'lucide-react';
import { apiGet } from '../api';

export default function OverviewSection() {
  const { myCompany, competitors: mockCompetitors } = useContext(DbContext);
  const [profile, setProfile] = useState(null);
  const [competitorsData, setCompetitorsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, compRes] = await Promise.allSettled([
        apiGet('/api/company/profile'),
        apiGet('/api/competitors')
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
      }
      if (compRes.status === 'fulfilled') {
        setCompetitorsData(compRes.value);
      }
    } catch (err) {
      console.error('Failed to load Overview data:', err);
      setError('Could not load latest intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl space-y-8 animate-pulse">
        {/* Skeleton Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        </div>
        {/* Skeleton Brief Block */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        </div>
        {/* Skeleton Counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/40 p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{error}</h3>
        <button 
          onClick={fetchData} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors"
        >
          <RefreshCw size={16} /> Retry Loading
        </button>
      </div>
    );
  }

  const companyName = profile?.companyName || profile?.company_name || myCompany?.company_name || 'Your Company';
  const executiveBrief = profile?.executiveBrief;
  const mainThreats = Array.isArray(profile?.mainThreats) ? profile.mainThreats : [];
  const keyOpportunity = profile?.keyOpportunity;
  const briefGeneratedAt = profile?.briefGeneratedAt;

  // Counts from GET /api/competitors
  const totalCount = competitorsData?.total ?? (competitorsData?.competitors?.length || mockCompetitors?.length || 0);
  const directCount = competitorsData?.direct ?? (competitorsData?.competitors?.filter(c => (c.type || c.competitive_status)?.toUpperCase() === 'DIRECT')?.length || 0);
  const indirectCount = competitorsData?.indirect ?? (competitorsData?.competitors?.filter(c => (c.type || c.competitive_status)?.toUpperCase() === 'INDIRECT')?.length || 0);
  const emergingCount = competitorsData?.emerging ?? (competitorsData?.competitors?.filter(c => (c.type || c.competitive_status)?.toUpperCase() === 'EMERGING')?.length || 0);

  return (
    <div className="animate-fade-in-up max-w-5xl space-y-8">
      
      {/* ── Main Overview Heading ── */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              Market Baseline & Intelligence
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {companyName} <span className="font-normal text-slate-500">Competitive Intelligence</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {profile?.industry || profile?.description || myCompany?.industry || 'Real-time market surveillance'}
            </p>
          </div>

          {briefGeneratedAt && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <Clock size={14} />
              <span>Last updated: {new Date(briefGeneratedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Competitor Summary Counts ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Discovered</span>
            <Users size={18} className="text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalCount}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Discovered by AI</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200/60 dark:border-red-900/30 p-6 shadow-sm">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Direct Competitors</span>
            <ShieldAlert size={18} className="text-red-500" />
          </div>
          <div className="text-3xl font-black text-red-600 dark:text-red-400">
            {directCount}
          </div>
          <div className="text-xs text-red-500/80 mt-1 font-medium">Primary threats</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/60 dark:border-amber-900/30 p-6 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Indirect Competitors</span>
            <Target size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-500">
            {indirectCount}
          </div>
          <div className="text-xs text-amber-500/80 mt-1 font-medium">Substitutes & adjacent</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200/60 dark:border-blue-900/30 p-6 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Emerging Threats</span>
            <Zap size={18} className="text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {emergingCount}
          </div>
          <div className="text-xs text-blue-500/80 mt-1 font-medium">Fast-growing startups</div>
        </div>
      </section>

      {/* ── AI Executive Brief Block ── */}
      {executiveBrief && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-900/40 p-6 md:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-extrabold text-lg">
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
            Executive Brief
          </div>
          <p className="text-slate-700 dark:text-slate-200 text-base leading-relaxed font-medium">
            {executiveBrief}
          </p>
        </section>
      )}

      {/* ── Main Threats & Key Opportunity Grid ── */}
      {(mainThreats.length > 0 || keyOpportunity) && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Main Threats Block */}
          {mainThreats.length > 0 && (
            <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-base">
                <AlertCircle size={22} />
                Main Threats
              </div>
              <ul className="space-y-3">
                {mainThreats.map((threat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-800 dark:text-slate-200 font-medium">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Opportunity Block */}
          {keyOpportunity && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-6 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                <Lightbulb size={22} />
                Key Opportunity
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed">
                {keyOpportunity}
              </p>
            </div>
          )}

        </section>
      )}

    </div>
  );
}
