import { useState, useEffect } from 'react';
import { 
  X, Copy, Check, Swords, ShieldAlert, Target, DollarSign, 
  HelpCircle, ArrowRight, Loader2, Sparkles, AlertCircle, 
  Zap, Award, ChevronRight, Layers, Flame
} from 'lucide-react';
import { getCompetitorBattlecard } from '../api';

export default function BattlecardModal({ isOpen, onClose, competitor, showToast }) {
  const [battlecard, setBattlecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('matchup'); // 'matchup', 'landmines', 'defense', 'pricing'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !competitor?.id) return;
    
    let isMounted = true;
    setLoading(true);
    setError('');

    async function fetchCard() {
      try {
        const data = await getCompetitorBattlecard(competitor.id);
        if (isMounted) {
          setBattlecard(data);
        }
      } catch (err) {
        console.error('Failed to load battlecard:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load sales battlecard.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCard();
    return () => { isMounted = false; };
  }, [isOpen, competitor?.id]);

  if (!isOpen) return null;

  const compName = competitor?.name || battlecard?.metadata?.competitorName || 'Competitor';

  const copyToClipboard = (text, customMsg) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (showToast) {
      showToast(customMsg || 'Copied to clipboard!', 'success');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const copyFullBattlecard = () => {
    if (!battlecard) return;
    const fullText = `=== SALES BATTLECARD: VS ${compName.toUpperCase()} ===

QUICK DISMISSAL SCRIPT:
"${battlecard.quickDismissal}"

WHERE WE WIN:
${(battlecard.whereWeWin || []).map((w, i) => `${i + 1}. ${w.advantage} - ${w.proofPoint}`).join('\n')}

LANDMINES TO LAY:
${(battlecard.landminesToLay || []).map((l, i) => `${i + 1}. ${l}`).join('\n')}

WHERE THEY WIN & HOW TO DEFEND:
${(battlecard.whereTheyWinAndHowToDefend || []).map((d, i) => `${i + 1}. Claim: ${d.theirClaim}\n   Rebuttal: ${d.ourRebuttal}`).join('\n')}

PRICING COUNTER-STRATEGY:
${battlecard.pricingCounterStrategy}

TARGET PROSPECT (SLAM DUNK ICP):
${battlecard.targetProspectProfile}
`;
    copyToClipboard(fullText, 'Full tactical battlecard copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* ── Modal Header ── */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/10 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Swords size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Tactical Sales Battlecard
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  vs {compName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time competitive dismissal scripts, objection landmines, and pricing defense.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {battlecard && !loading && (
              <button
                onClick={copyFullBattlecard}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
                title="Copy entire battlecard formatted for sales notes"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Script'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {loading && (
            <div className="space-y-6 animate-pulse py-8">
              <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
              <div className="flex gap-3">
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-32" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-32" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-32" />
              </div>
              <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
            </div>
          )}

          {error && (
            <div className="p-8 text-center space-y-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl">
              <AlertCircle size={36} className="text-red-500 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{error}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Unable to synthesize battlecard data for this competitor. Make sure the competitor profile is researched.
              </p>
            </div>
          )}

          {battlecard && !loading && (
            <>
              {/* ── Quick Dismissal Script Banner ── */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/80 dark:border-blue-900/40 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Sparkles size={14} /> 30-Second Prospect Dismissal Script
                  </span>
                  <button
                    onClick={() => copyToClipboard(battlecard.quickDismissal, 'Dismissal script copied!')}
                    className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 italic leading-relaxed">
                  "{battlecard.quickDismissal}"
                </p>
              </div>

              {/* ── Navigation Tabs ── */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                {[
                  { id: 'matchup', label: 'Matchup & Strengths', icon: Award },
                  { id: 'landmines', label: 'Objection Landmines', icon: Flame, badge: battlecard.landminesToLay?.length },
                  { id: 'defense', label: 'Defense & Rebuttals', icon: ShieldAlert },
                  { id: 'pricing', label: 'Pricing Strategy & ICP', icon: DollarSign },
                ].map(t => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <Icon size={15} />
                      <span>{t.label}</span>
                      {t.badge > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {t.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── Tab Content: Matchup & Strengths ── */}
              {activeTab === 'matchup' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Flagship Matchup Card */}
                  {battlecard.flagshipMatchup && (
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={14} className="text-blue-500" /> Flagship Product Head-to-Head
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Their Flagship Offering</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                            {battlecard.flagshipMatchup.competitorFlagship || 'Standard SaaS Solution'}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200/80 dark:border-blue-900/40">
                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">Our Strategic Counter</span>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                            {battlecard.flagshipMatchup.ourCounter || 'Comprehensive Architecture'}
                          </p>
                        </div>
                      </div>
                      {battlecard.flagshipMatchup.verdict && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <ArrowRight size={14} className="text-blue-500 shrink-0" />
                          <span><strong>Verdict:</strong> {battlecard.flagshipMatchup.verdict}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Where We Win (Key Advantages) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award size={14} className="text-emerald-500" /> Where We Win (Key Differentiators)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(battlecard.whereWeWin || []).map((win, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 rounded-2xl bg-emerald-500/[0.04] dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1.5 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {win.advantage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                            {win.proofPoint}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab Content: Objection Landmines ── */}
              {activeTab === 'landmines' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    💡 <strong>Sales Coaching Tip:</strong> Tell the prospect to ask {compName} these exact questions during their demo. They expose structural vulnerabilities and pricing traps without making you sound negative.
                  </div>

                  <div className="space-y-3">
                    {(battlecard.landminesToLay || []).map((landmine, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-start gap-3 hover:border-amber-300 dark:hover:border-amber-700 transition-all group"
                      >
                        <span className="w-6 h-6 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          #{idx + 1}
                        </span>
                        <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                          "{landmine}"
                        </div>
                        <button
                          onClick={() => copyToClipboard(landmine, `Landmine #${idx + 1} copied!`)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-all p-1"
                          title="Copy question"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Tab Content: Defense & Rebuttals ── */}
              {activeTab === 'defense' && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How to neutralize what {compName} claims are their strongest points:
                  </p>

                  <div className="space-y-3">
                    {(battlecard.whereTheyWinAndHowToDefend || []).map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                            Their Pitch
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            "{item.theirClaim}"
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed flex items-start gap-2.5">
                          <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                            Our Rebuttal
                          </span>
                          <span>{item.ourRebuttal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Tab Content: Pricing & ICP ── */}
              {activeTab === 'pricing' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Pricing Defense Strategy */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign size={14} className="text-emerald-500" /> Pricing Defense & ROI Script
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {battlecard.pricingCounterStrategy}
                    </p>
                  </div>

                  {/* Ideal Customer Profile (ICP) */}
                  <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target size={14} /> Slam-Dunk Prospect Profile
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                      {battlecard.targetProspectProfile}
                    </p>
                  </div>

                  {/* Metadata bounds if available */}
                  {battlecard.metadata?.pricingBoundaries && (
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span>Price Floor: <strong>${battlecard.metadata.pricingBoundaries.priceMinima || 0}/mo</strong></span>
                      <span>Price Ceiling: <strong>${battlecard.metadata.pricingBoundaries.priceMaxima || 0}/mo</strong></span>
                      {battlecard.metadata.pricingBoundaries.whiteSpace && (
                        <span>Whitespace: <strong>{battlecard.metadata.pricingBoundaries.whiteSpace}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
          <span>Powered by Aetheris Autonomous Reasoning Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
