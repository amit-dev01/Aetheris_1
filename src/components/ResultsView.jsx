import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy, Download, FileJson, ChevronRight, Shield, AlertTriangle,
  TrendingUp, Target, Zap, Award, BarChart3, Lightbulb, Check,
} from 'lucide-react';
import { W, S } from '../constants';

/* ═══════════════════════════════════════════════════════════
   SMALL HELPERS
   ═══════════════════════════════════════════════════════════ */

function AnimatedCount({ to, duration = 600 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (to === 0) return;
    let start = 0;
    const step = Math.ceil(to / (duration / 30));
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(id); }
      else setCount(start);
    }, 30);
    return () => clearInterval(id);
  }, [to, duration]);
  return <>{count}</>;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

function downloadFile(content, filename, type = 'text/markdown') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════
   SECTION COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* ── Stats Bar ──────────────────────────────────────────── */
function StatsBar({ result }) {
  const stats = [
    { label: 'Strengths',     value: result.strengths?.length || 0, color: '#4caf50', bg: '#d4edda' },
    { label: 'Weaknesses',    value: result.weaknesses?.length || 0, color: '#e53935', bg: '#fde2e2' },
    { label: 'Opportunities', value: result.opportunities?.length || 0, color: '#2196f3', bg: '#d6eaf8' },
    { label: 'Threats',       value: result.threats?.length || 0, color: '#ff9800', bg: '#fff3cd' },
    { label: 'Next Steps',    value: result.next_steps?.length || 0, color: '#2d5da1', bg: '#e3edf7' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 stagger">
      {stats.map(s => (
        <div
          key={s.label}
          className="text-center p-3 border-2 border-pencil animate-fade-in-up hover:rotate-1 transition-transform"
          style={{ borderRadius: W.sm, backgroundColor: s.bg, boxShadow: S.hardSm }}
        >
          <div className="font-kalam text-3xl font-bold" style={{ color: s.color }}>
            <AnimatedCount to={s.value} />
          </div>
          <div className="font-patrick text-sm text-pencil/70">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Section Card wrapper ───────────────────────────────── */
function SectionCard({ title, icon: Icon, children, className = '', bgColor = 'bg-white', decoration = 'none' }) {
  return (
    <div
      className={`${bgColor} border-[3px] border-pencil p-5 md:p-6 relative animate-fade-in-up ${className}`}
      style={{ borderRadius: W.md, boxShadow: S.hard }}
    >
      {decoration === 'tape' && (
        <div className="absolute -top-3 left-8 w-20 h-6 bg-pencil/10 rotate-2 z-10" style={{ borderRadius: '3px' }} />
      )}
      {decoration === 'tack' && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-accent rounded-full border-2 border-pencil z-10" />
      )}
      {title && (
        <h3 className="font-kalam text-xl md:text-2xl font-bold mb-4 flex items-center gap-2 text-pencil">
          {Icon && <Icon size={22} strokeWidth={2.5} />} {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/* ── Bullet List ────────────────────────────────────────── */
function BulletList({ items, color }) {
  return (
    <ul className="space-y-3 stagger">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 font-patrick text-base md:text-lg leading-relaxed animate-fade-in-up"
        >
          <ChevronRight size={18} className="shrink-0 mt-1" strokeWidth={3} style={{ color }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── SWOT Matrix ────────────────────────────────────────── */
function SwotMatrix({ swot }) {
  const quadrants = [
    { key: 'Strengths',     label: 'Strengths',     bg: '#d4edda', color: '#2e7d32', icon: Award },
    { key: 'Weaknesses',    label: 'Weaknesses',    bg: '#fde2e2', color: '#c62828', icon: AlertTriangle },
    { key: 'Opportunities', label: 'Opportunities', bg: '#d6eaf8', color: '#1565c0', icon: TrendingUp },
    { key: 'Threats',       label: 'Threats',        bg: '#fff3cd', color: '#e65100', icon: Shield },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quadrants.map(q => (
        <div
          key={q.key}
          className="border-2 border-pencil p-4 hover:-rotate-1 transition-transform"
          style={{ borderRadius: W.sm, backgroundColor: q.bg, boxShadow: S.hardSm }}
        >
          <h4 className="font-kalam text-lg font-bold mb-2 flex items-center gap-2" style={{ color: q.color }}>
            <q.icon size={18} strokeWidth={2.5} /> {q.label}
          </h4>
          <ul className="space-y-1.5">
            {(swot[q.key] || []).map((item, i) => (
              <li key={i} className="font-patrick text-sm md:text-base flex items-start gap-2">
                <span style={{ color: q.color }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ── Next Steps Table ───────────────────────────────────── */
function NextStepsTable({ steps }) {
  const priorityStyle = (p) => {
    const lower = (p || '').toLowerCase();
    if (lower.includes('p0')) return { bg: '#fde2e2', border: '#e53935', badge: 'P0' };
    if (lower.includes('p1')) return { bg: '#fff3cd', border: '#ff9800', badge: 'P1' };
    return { bg: '#d6eaf8', border: '#2196f3', badge: 'P2' };
  };

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full border-collapse font-patrick text-base">
        <thead>
          <tr className="bg-pencil text-paper">
            {['Priority', 'Action', 'Owner', 'Impact', 'Rationale'].map(h => (
              <th key={h} className="font-kalam text-left px-3 py-2 first:rounded-tl-lg last:rounded-tr-lg">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {steps.map((s, i) => {
            const ps = priorityStyle(s.priority);
            return (
              <tr
                key={i}
                className="border-b-2 border-dashed border-muted hover:bg-paper/50 transition-colors"
                style={{ backgroundColor: ps.bg + '44' }}
              >
                <td className="px-3 py-3">
                  <span
                    className="inline-block px-2 py-0.5 border-2 font-kalam font-bold text-sm"
                    style={{ borderColor: ps.border, color: ps.border, borderRadius: W.pill }}
                  >
                    {ps.badge}
                  </span>
                </td>
                <td className="px-3 py-3 font-bold">{s.action}</td>
                <td className="px-3 py-3">{s.owner_suggestion}</td>
                <td className="px-3 py-3 text-sm">{s.expected_impact}</td>
                <td className="px-3 py-3 text-sm text-pencil/70">{s.rationale}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Snapshot Grid ──────────────────────────────────────── */
function SnapshotGrid({ snapshot }) {
  if (!snapshot || Object.keys(snapshot).length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {Object.entries(snapshot).map(([key, value]) => (
        <div
          key={key}
          className="bg-post-it border-2 border-pencil p-3 hover:rotate-1 transition-transform"
          style={{ borderRadius: W.sm, boxShadow: S.hardSm }}
        >
          <div className="font-kalam text-sm font-bold text-pencil/60">{key}</div>
          <div className="font-patrick text-base mt-1">{value}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN RESULTS VIEW
   ═══════════════════════════════════════════════════════════ */

export default function ResultsView({ result, onNewAnalysis }) {
  const [copied, setCopied] = useState(false);
  const topRef = useRef(null);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);

  const handleCopy = () => {
    copyToClipboard(result.full_markdown_report || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    downloadFile(
      result.full_markdown_report || '',
      `${result.company_name.toLowerCase().replace(/\s+/g, '-')}-report.md`,
    );
  };

  const handleExportJson = () => {
    downloadFile(
      JSON.stringify(result, null, 2),
      `${result.company_name.toLowerCase().replace(/\s+/g, '-')}-analysis.json`,
      'application/json',
    );
  };

  return (
    <div ref={topRef} className="space-y-6 md:space-y-8">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <p className="font-patrick text-base text-pencil/50 mb-1">Competitive Intelligence Report</p>
          <h2 className="font-kalam text-3xl md:text-4xl font-bold text-pencil">
            {result.company_name}
          </h2>
          <p className="font-patrick text-sm text-pencil/40 mt-1">
            Generated {new Date(result.generated_at).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: copied ? 'Copied!' : 'Copy Report', icon: copied ? Check : Copy, action: handleCopy },
            { label: 'Download .md', icon: Download, action: handleDownloadMd },
            { label: 'Export JSON', icon: FileJson, action: handleExportJson },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-pencil
                         font-patrick text-sm hover:bg-pencil hover:text-paper
                         active:translate-x-[2px] active:translate-y-[2px]
                         transition-all duration-100"
              style={{ borderRadius: W.pill, boxShadow: S.hardSm }}
            >
              <btn.icon size={14} strokeWidth={2.5} /> {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────── */}
      <StatsBar result={result} />

      {/* ── Executive Summary ───────────────────────────── */}
      <SectionCard title="Executive Summary" icon={Zap} decoration="tape" bgColor="bg-post-it">
        <p className="font-patrick text-lg md:text-xl leading-relaxed">{result.executive_summary}</p>
      </SectionCard>

      {/* ── Competitor Snapshot ──────────────────────────── */}
      <SectionCard title="Competitor at a Glance" icon={BarChart3} decoration="tack">
        <SnapshotGrid snapshot={result.snapshot} />
      </SectionCard>

      {/* ── Strengths & Weaknesses ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="What They Do Well" icon={Award}>
          <BulletList items={result.strengths || []} color="#4caf50" />
        </SectionCard>
        <SectionCard title="Where They're Vulnerable" icon={AlertTriangle}>
          <BulletList items={result.weaknesses || []} color="#e53935" />
        </SectionCard>
      </div>

      {/* ── SWOT Matrix ─────────────────────────────────── */}
      <SectionCard title="SWOT Matrix" icon={Target}>
        <SwotMatrix swot={result.swot || {}} />
      </SectionCard>

      {/* ── Opportunities & Threats ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Opportunities for Us" icon={TrendingUp}>
          <BulletList items={result.opportunities || []} color="#2196f3" />
        </SectionCard>
        <SectionCard title="Threats & How to Defend" icon={Shield}>
          <BulletList items={result.threats || []} color="#ff9800" />
        </SectionCard>
      </div>

      {/* ── Next Steps ──────────────────────────────────── */}
      <SectionCard title="Recommended Next Steps" icon={ChevronRight} decoration="tape">
        <NextStepsTable steps={result.next_steps || []} />
      </SectionCard>

      {/* ── Differentiation Strategy ────────────────────── */}
      <SectionCard title="Recommended Positioning" icon={Lightbulb} decoration="tack" bgColor="bg-post-it">
        <p className="font-patrick text-lg md:text-xl leading-relaxed italic">
          "{result.differentiation_strategy}"
        </p>
      </SectionCard>

      {/* ── Full Markdown Report ────────────────────────── */}
      <SectionCard title="Full Report" icon={BarChart3}>
        <div className="markdown-report font-patrick">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {result.full_markdown_report || ''}
          </ReactMarkdown>
        </div>

        {/* Bottom action bar */}
        <div className="flex gap-3 mt-6 pt-4 border-t-2 border-dashed border-muted flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white border-[3px] border-secondary
                       font-patrick text-base hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px]
                       transition-all duration-100"
            style={{ borderRadius: W.pill, boxShadow: S.hard }}
          >
            {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} strokeWidth={2.5} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownloadMd}
            className="flex items-center gap-2 px-4 py-2 bg-white border-[3px] border-pencil
                       font-patrick text-base hover:bg-pencil hover:text-paper
                       active:translate-x-[2px] active:translate-y-[2px]
                       transition-all duration-100"
            style={{ borderRadius: W.pill, boxShadow: S.hard }}
          >
            <Download size={16} strokeWidth={2.5} /> Download as .md
          </button>
        </div>
      </SectionCard>

      {/* ── Bottom CTA ──────────────────────────────────── */}
      <div className="text-center py-8">
        <p className="font-patrick text-pencil/40 italic mb-4">
          This report was generated by AI-driven competitive analysis. Verify facts before strategic decisions.
        </p>
        <button
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border-[3px] border-pencil
                     font-patrick text-lg hover:bg-accent hover:text-white
                     active:translate-x-1 active:translate-y-1 transition-all duration-100"
          style={{ borderRadius: W.pill, boxShadow: S.hardLg }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = S.hard}
          onMouseLeave={e => e.currentTarget.style.boxShadow = S.hardLg}
        >
          ✏️ Analyze Another Competitor
        </button>
      </div>
    </div>
  );
}
