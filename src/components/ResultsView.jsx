import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy, Download, FileJson, ChevronRight, Shield, AlertTriangle,
  TrendingUp, Target, Zap, Award, BarChart3, Lightbulb, Check,
} from 'lucide-react';

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
    { label: 'Strengths',     value: result.strengths?.length || 0, isAccent: false },
    { label: 'Weaknesses',    value: result.weaknesses?.length || 0, isAccent: false },
    { label: 'Opportunities', value: result.opportunities?.length || 0, isAccent: false },
    { label: 'Threats',       value: result.threats?.length || 0, isAccent: false },
    { label: 'Next Steps',    value: result.next_steps?.length || 0, isAccent: true }, // Highlight next steps with Swiss Red background!
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 stagger">
      {stats.map(s => (
        <div
          key={s.label}
          className={`text-left p-4 border-2 border-black dark:border-white animate-fade-in-up snappy hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black group ${s.isAccent ? 'bg-accent text-white border-accent' : 'bg-white dark:bg-black'}`}
        >
          <div className={`font-heading text-3xl font-black ${s.isAccent ? 'text-white' : 'text-black dark:text-white group-hover:text-white dark:group-hover:text-black'}`}>
            <AnimatedCount to={s.value} />
          </div>
          <div className={`font-heading text-[10px] font-black uppercase tracking-widest mt-1 ${s.isAccent ? 'text-white/80' : 'text-slate-500 dark:text-slate-400 group-hover:text-white/80 dark:group-hover:text-black/80'}`}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Section Card wrapper ───────────────────────────────── */
function SectionCard({ title, icon: Icon, children, className = '', bgColor = 'bg-white dark:bg-black', sectionNum = '' }) {
  return (
    <div
      className={`${bgColor} border-4 border-black dark:border-white p-6 relative animate-fade-in-up rounded-none ${className}`}
    >
      {sectionNum && (
        <div className="absolute -top-3.5 left-6 bg-accent border-2 border-black dark:border-white text-white px-2 py-0.5 font-mono text-[9px] tracking-widest font-black uppercase">
          {sectionNum}
        </div>
      )}
      {title && (
        <h3 className="font-heading text-base md:text-lg font-black mb-6 flex items-center gap-2 text-black dark:text-white uppercase tracking-wider">
          {Icon && <Icon size={18} strokeWidth={3} className="text-accent" />} {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/* ── Bullet List ────────────────────────────────────────── */
function BulletList({ items, bulletColor = '#FF3000' }) {
  return (
    <ul className="space-y-4 stagger">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 font-sans text-sm md:text-base leading-relaxed animate-fade-in-up text-black dark:text-white"
        >
          <ChevronRight size={16} className="shrink-0 mt-0.5" strokeWidth={3} style={{ color: bulletColor }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── SWOT Matrix ────────────────────────────────────────── */
function SwotMatrix({ swot }) {
  const quadrants = [
    { key: 'Strengths',     label: 'Strengths',     bg: 'bg-white dark:bg-black', color: '#FF3000', icon: Award },
    { key: 'Weaknesses',    label: 'Weaknesses',    bg: 'bg-tertiary dark:bg-slate-900', color: '#000000', icon: AlertTriangle },
    { key: 'Opportunities', label: 'Opportunities', bg: 'bg-tertiary dark:bg-slate-900', color: '#000000', icon: TrendingUp },
    { key: 'Threats',       label: 'Threats',        bg: 'bg-white dark:bg-black', color: '#FF3000', icon: Shield },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quadrants.map(q => (
        <div
          key={q.key}
          className={`border-2 border-black dark:border-white p-5 rounded-none hover:bg-accent hover:text-white group transition-colors ${q.bg}`}
        >
          <h4 className="font-heading text-xs font-black mb-3 flex items-center gap-2 uppercase tracking-wider" style={{ color: q.color }}>
            <q.icon size={14} strokeWidth={3} className="group-hover:text-white" />
            <span className="group-hover:text-white">{q.label}</span>
          </h4>
          <ul className="space-y-2">
            {(swot[q.key] || []).map((item, i) => (
              <li key={i} className="font-sans text-xs md:text-sm flex items-start gap-2 leading-relaxed text-black dark:text-white group-hover:text-white">
                <span className="text-accent group-hover:text-white">•</span>
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
    if (lower.includes('p0')) return { border: '#FF3000', badge: 'P0' };
    if (lower.includes('p1')) return { border: '#000000', badge: 'P1' };
    return { border: '#000000', badge: 'P2' };
  };

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full border-collapse font-sans text-sm border-2 border-black dark:border-white">
        <thead>
          <tr className="bg-black text-white dark:bg-white dark:text-black">
            {['Priority', 'Action', 'Owner', 'Impact', 'Rationale'].map(h => (
              <th key={h} className="font-heading text-[10px] font-black tracking-widest text-left px-4 py-3 uppercase">
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
                className="border-b-2 border-black dark:border-white hover:bg-accent hover:text-white dark:hover:text-black dark:hover:bg-white group transition-colors"
              >
                <td className="px-4 py-4">
                  <span
                    className="inline-block px-2.5 py-1 border-2 font-mono font-black text-xs rounded-none group-hover:border-white dark:group-hover:border-black group-hover:text-white dark:group-hover:text-black"
                    style={{ borderColor: ps.border, color: ps.border }}
                  >
                    {ps.badge}
                  </span>
                </td>
                <td className="px-4 py-4 font-black">{s.action}</td>
                <td className="px-4 py-4 font-mono text-xs uppercase">{s.owner_suggestion}</td>
                <td className="px-4 py-4 font-semibold">{s.expected_impact}</td>
                <td className="px-4 py-4 text-xs opacity-75">{s.rationale}</td>
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
          className="bg-tertiary dark:bg-slate-900 border-2 border-black dark:border-white p-4 rounded-none hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white group transition-colors"
        >
          <div className="font-heading text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-white/80 uppercase">{key}</div>
          <div className="font-sans text-sm font-semibold mt-2 text-black dark:text-white group-hover:text-white">{value}</div>
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
    <div ref={topRef} className="space-y-8">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-4 border-black dark:border-white animate-fade-in-up">
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1">02 // SCAN_RESULTS</span>
          <h2 className="font-heading text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black dark:text-white leading-none">
            {result.company_name}
          </h2>
          <p className="font-mono text-xs opacity-60 mt-3">
            RUN_TIMESTAMP: {new Date(result.generated_at).toISOString()}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: copied ? 'Copied!' : 'Copy report', icon: copied ? Check : Copy, action: handleCopy },
            { label: 'Download .md', icon: Download, action: handleDownloadMd },
            { label: 'Export JSON', icon: FileJson, action: handleExportJson },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-black border-2 border-black dark:border-white
                         font-heading text-xs uppercase tracking-widest font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black
                         transition-colors rounded-none"
            >
              <btn.icon size={12} strokeWidth={3} className="text-accent" /> {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────── */}
      <StatsBar result={result} />

      {/* ── Executive Summary ───────────────────────────── */}
      <SectionCard title="Executive Summary" icon={Zap} sectionNum="02.1 // REPORT_SUMMARY">
        <p className="font-sans text-base md:text-lg leading-relaxed text-black dark:text-white">{result.executive_summary}</p>
      </SectionCard>

      {/* ── Competitor Snapshot ──────────────────────────── */}
      <SectionCard title="Competitor Metrics" icon={BarChart3} sectionNum="02.2 // META_METRICS">
        <SnapshotGrid snapshot={result.snapshot} />
      </SectionCard>

      {/* ── Strengths & Weaknesses ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Strengths & Advantages" icon={Award} sectionNum="02.3 // ADVANTAGES">
          <BulletList items={result.strengths || []} bulletColor="#FF3000" />
        </SectionCard>
        <SectionCard title="Weaknesses & Vulnerabilities" icon={AlertTriangle} sectionNum="02.4 // VULNERABILITIES">
          <BulletList items={result.weaknesses || []} bulletColor="#000000" />
        </SectionCard>
      </div>

      {/* ── SWOT Matrix ─────────────────────────────────── */}
      <SectionCard title="SWOT Matrix Grid" icon={Target} sectionNum="02.5 // SWOT_GRID">
        <SwotMatrix swot={result.swot || {}} />
      </SectionCard>

      {/* ── Opportunities & Threats ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Opportunities" icon={TrendingUp} sectionNum="02.6 // OPPORTUNITIES">
          <BulletList items={result.opportunities || []} bulletColor="#FF3000" />
        </SectionCard>
        <SectionCard title="Threats & Defensive strategy" icon={Shield} sectionNum="02.7 // DEFENSIVE">
          <BulletList items={result.threats || []} bulletColor="#000000" />
        </SectionCard>
      </div>

      {/* ── Next Steps ──────────────────────────────────── */}
      <SectionCard title="Prioritized Next Steps" icon={ChevronRight} sectionNum="02.8 // ACTION_PIPELINE">
        <NextStepsTable steps={result.next_steps || []} />
      </SectionCard>

      {/* ── Differentiation Strategy ────────────────────── */}
      <SectionCard title="Recommended Brand Positioning" icon={Lightbulb} sectionNum="02.9 // REPOSITION_TARGET" bgColor="bg-accent text-white">
        <p className="font-heading text-lg md:text-2xl font-black uppercase tracking-tight leading-tight text-white italic">
          "{result.differentiation_strategy}"
        </p>
      </SectionCard>

      {/* ── Full Markdown Report ────────────────────────── */}
      <SectionCard title="Synthesized MD Document" icon={BarChart3} sectionNum="03 // COMPILED_REPORT">
        <div className="markdown-report">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {result.full_markdown_report || ''}
          </ReactMarkdown>
        </div>

        {/* Bottom action bar */}
        <div className="flex gap-3 mt-8 pt-6 border-t-4 border-black dark:border-white flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-3 bg-accent text-white border-2 border-black dark:border-white
                       font-heading text-xs uppercase tracking-widest font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black
                       transition-colors rounded-none"
          >
            {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={3} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownloadMd}
            className="flex items-center gap-2 px-5 py-3 bg-white text-black dark:bg-black dark:text-white border-2 border-black dark:border-white
                       font-heading text-xs uppercase tracking-widest font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black
                       transition-colors rounded-none"
          >
            <Download size={14} strokeWidth={3} /> Download as .md
          </button>
        </div>
      </SectionCard>

      {/* ── Bottom CTA ──────────────────────────────────── */}
      <div className="text-center py-12 border-t-4 border-black dark:border-white">
        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-6">
          [ PIPELINE_END // VERIFY DATA BEFORE STRATEGIC DECISION ]
        </p>
        <button
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white
                     font-heading text-sm font-black uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-colors rounded-none"
        >
          Initialize Another Scan
        </button>
      </div>
    </div>
  );
}
