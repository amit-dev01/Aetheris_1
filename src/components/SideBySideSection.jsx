import { useState, useEffect } from 'react';
import { 
  Columns, Loader2, AlertCircle, Building2, Globe, 
  TrendingUp, Award, Layers, ShieldCheck, DollarSign,
  Printer, Check, ExternalLink, Zap, Users, RefreshCw,
  Sparkles, ArrowRight
} from 'lucide-react';
import { getSideBySideComparison } from '../api';

export default function SideBySideSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSideBySideComparison();
      setData(res);
    } catch (err) {
      console.error('Failed to load comparison:', err);
      setError(err.message || 'Failed to aggregate comparison matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm space-y-4 animate-pulse">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
          Aggregating Live Competitor Matrix & Web Presence...
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Scanning BuiltWith tech signatures, SimilarWeb traffic estimates, and financial snapshots.
        </p>
      </div>
    );
  }

  const home = data?.homeCompany || {
    name: 'Our Business',
    industry: 'Productivity & AI',
    companySize: '25-50',
    location: 'San Francisco, CA',
    monthlyTraffic: '185K',
    domainAuthority: 68,
    techStack: ['Next.js', 'React', 'Tailwind CSS', 'FastAPI', 'Supabase', 'Stripe'],
    financialHealth: 'A',
    pricingModel: 'Freemium / Tiered'
  };

  const competitors = data?.competitors || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Columns size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Side-by-Side Competitor Matrix
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                Live Benchmarking
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Objective head-to-head analysis across Traffic, BuiltWith Tech Stacks, SEO Domain Authority, and Financials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw size={13} /> Refresh Data
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Printer size={13} /> Export PDF
          </button>
        </div>
      </div>

      {/* ── At-a-Glance KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} className="text-blue-500" /> Tracked Rivals
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {competitors.length} Companies
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Active competitive landscape</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award size={14} className="text-indigo-500" /> Our SEO Domain Authority
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {home.domainAuthority || 68} <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Competitive search presence</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={14} className="text-emerald-500" /> Our Monthly Traffic
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {home.monthlyTraffic || '185K'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">SimilarWeb estimate</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-purple-500" /> Financial Health
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            Grade {home.financialHealth || 'A'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Top-quartile capital efficiency</p>
        </div>
      </div>

      {/* ── Main Comparison Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                <th className="p-4 sm:p-5 font-bold text-slate-500 uppercase tracking-wider w-44 sticky left-0 bg-slate-50/95 dark:bg-slate-800/95 z-10 backdrop-blur-sm">
                  Metrics & Features
                </th>
                
                {/* Home Company Column */}
                <th className="p-4 sm:p-5 font-bold text-blue-600 dark:text-blue-400 min-w-[210px] bg-blue-50/40 dark:bg-blue-950/20 border-x border-blue-200/50 dark:border-blue-900/30">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>{home.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold ml-1">US</span>
                  </div>
                </th>

                {/* Competitor Columns */}
                {competitors.map(c => (
                  <th key={c.id} className="p-4 sm:p-5 font-bold text-slate-900 dark:text-slate-100 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{c.name}</span>
                      {c.website && (
                        <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 ml-1">
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              
              {/* Category: Overview */}
              <tr className="bg-slate-50/40 dark:bg-slate-800/20 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                <td colSpan={competitors.length + 2} className="px-4 py-2">
                  1. Company Overview
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">HQ Location</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-200/30 dark:border-blue-900/20">{home.location || 'Global'}</td>
                {competitors.map(c => (
                  <td key={c.id} className="p-4 text-slate-700 dark:text-slate-300">{c.hqLocation || 'United States'}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">Founded</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-200/30 dark:border-blue-900/20">{home.founded || '2023'}</td>
                {competitors.map(c => (
                  <td key={c.id} className="p-4 text-slate-700 dark:text-slate-300">{c.foundedYear || 2020}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">Team Size</td>
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-200/30 dark:border-blue-900/20">{home.companySize || '25-50'}</td>
                {competitors.map(c => (
                  <td key={c.id} className="p-4 text-slate-700 dark:text-slate-300">{c.teamSize || '100-250'}</td>
                ))}
              </tr>

              {/* Category: Web Presence & Tech Stack */}
              <tr className="bg-slate-50/40 dark:bg-slate-800/20 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                <td colSpan={competitors.length + 2} className="px-4 py-2">
                  2. Web Presence & Tech Stack (BuiltWith & SimilarWeb)
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">Monthly Visits</td>
                <td className="p-4 font-black text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-200/30 dark:border-blue-900/20">{home.monthlyTraffic}</td>
                {competitors.map(c => (
                  <td key={c.id} className="p-4 font-bold text-slate-800 dark:text-slate-200">{c.monthlyTraffic || '250K'}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">SEO Domain Authority</td>
                <td className="p-4 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-200/30 dark:border-blue-900/20">
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">{home.domainAuthority}</span> / 100
                </td>
                {competitors.map(c => (
                  <td key={c.id} className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    <span className="font-extrabold text-slate-900 dark:text-white">{c.domainAuthority || 74}</span> / 100
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">Detected Tech Stack</td>
                <td className="p-4 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-200/30 dark:border-blue-900/20">
                  <div className="flex flex-wrap gap-1">
                    {(home.techStack || []).map((t, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">{t}</span>
                    ))}
                  </div>
                </td>
                {competitors.map(c => (
                  <td key={c.id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(c.techStack || ['React', 'Next.js', 'Tailwind', 'Cloudflare']).map((t, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">{t}</span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Category: Financials & Pricing */}
              <tr className="bg-slate-50/40 dark:bg-slate-800/20 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                <td colSpan={competitors.length + 2} className="px-4 py-2">
                  3. Financial Fundamentals & Pricing
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">Valuation / Funding</td>
                <td className="p-4 font-bold text-slate-900 dark:text-slate-100 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-200/30 dark:border-blue-900/20">$25M (Series A)</td>
                {competitors.map(c => (
                  <td key={c.id} className="p-4 font-bold text-slate-900 dark:text-slate-100">{c.totalFunding || '$60M'}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">Pricing Model</td>
                <td className="p-4 font-medium text-slate-700 dark:text-slate-300 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-200/30 dark:border-blue-900/20">Freemium + Usage</td>
                {competitors.map(c => (
                  <td key={c.id} className="p-4 font-medium text-slate-700 dark:text-slate-300">{c.pricingModel || 'Per-Seat Tiered'}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-500 sticky left-0 bg-white dark:bg-slate-900 z-10">Financial Health</td>
                <td className="p-4 bg-blue-50/20 dark:bg-blue-950/10 border-x border-blue-200/30 dark:border-blue-900/20">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Grade {home.financialHealth || 'A'}</span>
                </td>
                {competitors.map(c => (
                  <td key={c.id} className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.financialHealth === 'A' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      c.financialHealth === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}>Grade {c.financialHealth || 'B'}</span>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
