import { useState, useEffect, useRef, useContext } from 'react';
import { DbContext } from '../App';
import { 
  Users, Check, X, Plus, ExternalLink, ShieldAlert, Target, Zap, 
  Sparkles, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Newspaper 
} from 'lucide-react';
import { getCompetitors, acceptCompetitor, rejectCompetitor, addManualCompetitor, getIntelligenceFeed } from '../api';
import { getEventTypeBadgeStyle, getImpactBadgeStyle, formatRelativeTime } from '../constants';
import CompetitorCharts from './CompetitorCharts';

export default function CompetitorsSection() {
  const context = useContext(DbContext) || {};
  const { intelligenceStats } = context;

  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('DIRECT'); // DIRECT, INDIRECT, EMERGING

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualWebsite, setManualWebsite] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState('');

  // Toast state
  const [toastMessage, setToastMessage] = useState('');

  // Expanded Competitor Activity State: { [competitorId]: { loading: boolean, docs: [], expanded: boolean } }
  const [activityState, setActivityState] = useState({});

  // Polling ref for pending scores
  const pollIntervalRef = useRef(null);

  const fetchCompetitorsList = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const data = await getCompetitors();
      const list = Array.isArray(data) ? data : data.competitors || [];
      setCompetitors(list);
    } catch (err) {
      console.error('Error fetching competitors:', err);
      setError(err.message || 'Failed to load competitors list.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitorsList(true);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Polling logic: check if any competitor has null competitiveScore
  useEffect(() => {
    const hasUnscoredCompetitor = competitors.some(
      c => c.competitiveScore === null || c.competitiveScore === undefined || c.isResearching
    );

    if (hasUnscoredCompetitor) {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(() => {
          fetchCompetitorsList(false);
        }, 10000);
      }
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [competitors]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Accept competitor
  const handleAccept = async (id) => {
    try {
      await acceptCompetitor(id);
      setCompetitors(prev => 
        prev.map(c => c.id === id ? { ...c, isAccepted: true } : c)
      );
      showToast('Competitor accepted and confirmed!');
    } catch (err) {
      console.error('Failed to accept competitor:', err);
      alert(err.message || 'Failed to accept competitor.');
    }
  };

  // Reject competitor
  const handleReject = async (id) => {
    try {
      await rejectCompetitor(id);
      setCompetitors(prev => 
        prev.map(c => c.id === id ? { ...c, isAccepted: false } : c)
      );
      showToast('Competitor rejected.');
    } catch (err) {
      console.error('Failed to reject competitor:', err);
      alert(err.message || 'Failed to reject competitor.');
    }
  };

  // Submit manual competitor
  const handleAddManualCompetitor = async (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualWebsite.trim()) {
      setManualError('Please enter both company name and website URL.');
      return;
    }

    setIsSubmittingManual(true);
    setManualError('');
    try {
      const result = await addManualCompetitor({
        name: manualName.trim(),
        website: manualWebsite.trim()
      });

      const newComp = result.competitor || result || {
        id: Date.now().toString(),
        name: manualName.trim(),
        website: manualWebsite.trim(),
        type: 'DIRECT',
        isAccepted: true,
        source: 'MANUAL',
        competitiveScore: null,
        isResearching: true
      };

      setCompetitors(prev => [newComp, ...prev]);
      setIsModalOpen(false);
      setManualName('');
      setManualWebsite('');
      showToast('Competitor added. We are researching them now.');
    } catch (err) {
      console.error('Manual competitor submit error:', err);
      setManualError(err.message || 'Could not add competitor. Please try again.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Toggle Recent Activity for a competitor card
  const toggleCompetitorActivity = async (compId) => {
    const currentState = activityState[compId] || { expanded: false, docs: [], loading: false };
    const nextExpanded = !currentState.expanded;

    setActivityState(prev => ({
      ...prev,
      [compId]: { ...currentState, expanded: nextExpanded }
    }));

    if (nextExpanded && (!currentState.docs || currentState.docs.length === 0)) {
      setActivityState(prev => ({
        ...prev,
        [compId]: { ...prev[compId], loading: true }
      }));

      try {
        const res = await getIntelligenceFeed({ competitorId: compId, limit: 5 });
        const docsList = Array.isArray(res) ? res : res.documents || [];
        setActivityState(prev => ({
          ...prev,
          [compId]: { ...prev[compId], docs: docsList, loading: false }
        }));
      } catch (err) {
        console.error('Failed to fetch recent activity:', err);
        setActivityState(prev => ({
          ...prev,
          [compId]: { ...prev[compId], docs: [], loading: false }
        }));
      }
    }
  };

  // Helper to get competitor activity count from stats.byCompetitor
  const getEventCountThisWeek = (comp) => {
    if (!intelligenceStats?.byCompetitor) return 0;
    const compNameNorm = (comp.name || comp.companyName || comp.company_name || '').toLowerCase();
    const found = intelligenceStats.byCompetitor.find(
      b => b.competitorId === comp.id || (b.competitorName && b.competitorName.toLowerCase() === compNameNorm)
    );
    return found?.documentCount || 0;
  };

  // Pending review competitors (isAccepted === null)
  const pendingCompetitors = competitors.filter(c => c.isAccepted === null);

  // Confirmed competitors (isAccepted === true)
  const confirmedCompetitors = competitors.filter(c => c.isAccepted === true);

  // Helper to normalize competitor type string
  const getCompType = (c) => {
    const raw = c.type || c.competitiveStatus || c.competitive_status || 'DIRECT';
    const u = raw.toUpperCase();
    if (u.includes('INDIRECT')) return 'INDIRECT';
    if (u.includes('EMERGING')) return 'EMERGING';
    return 'DIRECT';
  };

  // Filter confirmed competitors by active tab & sort descending by competitiveScore
  const tabFilteredCompetitors = confirmedCompetitors
    .filter(c => getCompType(c) === activeTab)
    .sort((a, b) => (b.competitiveScore || b.ai_score || 0) - (a.competitiveScore || a.ai_score || 0));

  // Helper for badge colors
  const getTypeBadgeStyle = (typeStr) => {
    switch (typeStr) {
      case 'DIRECT':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'INDIRECT':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'EMERGING':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getScoreValue = (comp, field, fallback = 70) => {
    if (comp[field] !== undefined && comp[field] !== null) return comp[field];
    if (comp.scores && comp.scores[field] !== undefined) return comp.scores[field];
    return fallback;
  };

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto space-y-8 pb-12 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-semibold border border-slate-800 dark:border-slate-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users size={30} className="text-blue-600 dark:text-blue-400" /> Competitor Landscape
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time discovered competitors, AI scoring, and market position analysis.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
        >
          <Plus size={18} /> Add Competitor
        </button>
      </div>

      {/* Skeleton Loading State */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Pending Review Banner ── */}
          {pendingCompetitors.length > 0 && (
            <section className="bg-amber-50/80 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400 font-extrabold text-lg">
                  <Sparkles size={22} className="animate-spin-slow" />
                  Review These Competitors
                </div>
                <p className="text-amber-800 dark:text-amber-300/90 text-xs font-semibold mt-1">
                  AI discovered these competitors. Review and confirm them.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingCompetitors.map(comp => {
                  const compName = comp.name || comp.companyName || comp.company_name || 'Competitor';
                  const compWeb = comp.website || comp.websiteUrl || comp.website_url;
                  const typeBadge = getCompType(comp);
                  const score = comp.competitiveScore ?? comp.ai_score ?? null;

                  return (
                    <div key={comp.id} className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{compName}</h3>
                            {compWeb && (
                              <a 
                                href={compWeb.startsWith('http') ? compWeb : `https://${compWeb}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium mt-0.5"
                              >
                                {compWeb} <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${getTypeBadgeStyle(typeBadge)}`}>
                            {typeBadge}
                          </span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 mt-2 leading-relaxed">
                          {comp.description || comp.reason || 'AI identified this company based on product offerings and market positioning.'}
                        </p>
                      </div>

                      {/* Accept / Reject Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-400">
                          {score !== null ? `Score: ${score}/100` : 'Evaluating...'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAccept(comp.id)}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                          >
                            <Check size={14} /> Confirm
                          </button>
                          <button
                            onClick={() => handleReject(comp.id)}
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-900/30 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Main Tabbed Section ── */}
          <section className="space-y-6">
            
            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-8">
              {[
                { id: 'DIRECT', label: 'Direct Competitors', icon: ShieldAlert, color: 'text-red-500' },
                { id: 'INDIRECT', label: 'Indirect Competitors', icon: Target, color: 'text-amber-500' },
                { id: 'EMERGING', label: 'Emerging Competitors', icon: Zap, color: 'text-blue-500' },
              ].map(tab => {
                const isActive = activeTab === tab.id;
                const count = confirmedCompetitors.filter(c => getCompType(c) === tab.id).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 border-b-2 font-bold text-sm transition-all ${
                      isActive
                        ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <tab.icon size={18} className={tab.color} />
                    <span>{tab.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Empty State */}
            {tabFilteredCompetitors.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  No {activeTab.toLowerCase()} competitors found yet.
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Add Competitor" above to manually research any competitor in your market.
                </p>
              </div>
            ) : (
              /* Competitors Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tabFilteredCompetitors.map(comp => {
                  const compName = comp.name || comp.companyName || comp.company_name || 'Competitor';
                  const compWeb = comp.website || comp.websiteUrl || comp.website_url;
                  const typeBadge = getCompType(comp);
                  const isResearching = comp.competitiveScore === null || comp.isResearching;
                  const score = comp.competitiveScore ?? comp.ai_score ?? 0;
                  const confidence = comp.confidenceScore ?? comp.confidence ?? 92;
                  const whyReason = comp.reason || comp.whyCompetitor || comp.description || 'Presents direct feature and market overlap.';
                  const sourceStr = (comp.source || '').toUpperCase() === 'MANUAL' ? 'Added Manually' : 'AI Discovered';

                  const eventCountThisWeek = getEventCountThisWeek(comp);
                  const actState = activityState[comp.id] || { expanded: false, docs: [], loading: false };

                  const productScore = getScoreValue(comp, 'productSimilarity', getScoreValue(comp, 'productSimilarityScore', 82));
                  const customerScore = getScoreValue(comp, 'customerOverlap', getScoreValue(comp, 'customerOverlapScore', 78));
                  const marketScore = getScoreValue(comp, 'marketOverlap', getScoreValue(comp, 'marketOverlapScore', 85));
                  const businessScore = getScoreValue(comp, 'businessModelOverlap', getScoreValue(comp, 'businessModelScore', 75));

                  return (
                    <div 
                      key={comp.id} 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
                    >
                      {/* Top Header Row */}
                      <div>
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {compName}
                              </h3>

                              {/* Activity Indicator Badge (if eventCountThisWeek > 0) */}
                              {eventCountThisWeek > 0 && (
                                <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                  {eventCountThisWeek} event{eventCountThisWeek !== 1 ? 's' : ''} this week
                                </span>
                              )}
                            </div>

                            {compWeb && (
                              <a
                                href={compWeb.startsWith('http') ? compWeb : `https://${compWeb}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold mt-1"
                              >
                                {compWeb} <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          
                          <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${getTypeBadgeStyle(typeBadge)}`}>
                            {typeBadge}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                          {comp.description || whyReason}
                        </p>
                      </div>

                      {/* Competitive Score Row / Researching Badge */}
                      {isResearching ? (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-4 flex items-center gap-3">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-blue-700 dark:text-blue-300">Researching...</div>
                            <div className="text-[11px] text-blue-600/80 dark:text-blue-400">Profiling tech stack, pricing, & position</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Score Indicator */}
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Competitive Threat Score</div>
                              <div className="text-xs text-slate-500 font-medium">Out of 100</div>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                                {score}
                              </span>
                              <span className="text-xs font-bold text-slate-400">/100</span>
                            </div>
                          </div>

                          {/* 4 Horizontal Score Breakdown Bars */}
                          <div className="space-y-2.5 pt-1">
                            {[
                              { label: 'Product Similarity', val: productScore },
                              { label: 'Customer Overlap', val: customerScore },
                              { label: 'Market Overlap', val: marketScore },
                              { label: 'Business Model', val: businessScore },
                            ].map(item => (
                              <div key={item.label} className="space-y-1">
                                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                  <span>{item.label}</span>
                                  <span>{item.val}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, Math.max(0, item.val))}%` }} 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Why They Are a Competitor Block */}
                      <div className="bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Why they are a competitor
                        </div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                          {whyReason}
                        </p>
                      </div>

                      {/* ── Phase 2 & 3: Recent Activity & Charts Section Toggle ── */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <button
                          onClick={() => toggleCompetitorActivity(comp.id)}
                          className="w-full flex items-center justify-between text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline py-1"
                        >
                          <span>Activity & Trends</span>
                          {actState.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {/* Expanded Drawer */}
                        {actState.expanded && (
                          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-6 animate-fade-in w-full">
                            
                            {/* Phase 3 Charts */}
                            <div className="w-full overflow-hidden">
                              <CompetitorCharts competitorId={comp.id} />
                            </div>

                            {/* Phase 2 Recent Activity */}
                            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                                Recent Events
                              </h4>
                              {actState.loading && (
                                <div className="flex justify-center py-4">
                                  <Loader2 size={20} className="text-blue-600 animate-spin" />
                                </div>
                              )}

                              {!actState.loading && actState.docs.length === 0 && (
                                <div className="text-center py-3 text-xs text-slate-400 font-medium">
                                  No activity recorded yet
                                </div>
                              )}

                              {!actState.loading && actState.docs.length > 0 && (
                                <div className="space-y-2.5">
                                  {actState.docs.map(doc => (
                                    <div 
                                      key={doc.id}
                                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between text-[10px] font-bold">
                                        <div className="flex items-center gap-1.5">
                                          <span className={`px-2 py-0.5 rounded-full border ${getEventTypeBadgeStyle(doc.eventType)}`}>
                                            {doc.eventType}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-full border ${getImpactBadgeStyle(doc.impact)}`}>
                                            {doc.impact}
                                          </span>
                                        </div>
                                        <span className="text-slate-400 font-semibold">{formatRelativeTime(doc.publishedAt || doc.date)}</span>
                                      </div>
                                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                                        {doc.title}
                                      </h4>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>

                      {/* Confidence Line & Source Badge Footer */}
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
                        <span>AI Confidence: {confidence}%</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400">
                          {sourceStr}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Add Competitor Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Add a Competitor Manually
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddManualCompetitor} className="space-y-4">
              {manualError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold p-3 rounded-xl border border-red-200 dark:border-red-800">
                  {manualError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Website URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://acme.com"
                  value={manualWebsite}
                  onChange={(e) => setManualWebsite(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmittingManual ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Competitor'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
