import { useState } from 'react';
import { Plus, Trash2, Sparkles, Globe, Building2, Users, Search } from 'lucide-react';
import { W, S, FOCUS_OPTIONS } from '../constants';

export default function InputForm({ onSubmit }) {
  const [form, setForm] = useState({
    company_name: '',
    website_url: '',
    industry: '',
    our_company_context: '',
  });
  const [socialPairs, setSocialPairs] = useState([]);
  const [focusAreas, setFocusAreas] = useState([...FOCUS_OPTIONS]);
  const [errors, setErrors] = useState({});

  /* ── Handlers ──────────────────────────────────────────── */
  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const addSocialPair    = () => setSocialPairs(prev => [...prev, { platform: '', url: '' }]);
  const removeSocialPair = (i) => setSocialPairs(prev => prev.filter((_, idx) => idx !== i));
  const updateSocialPair = (i, field, value) =>
    setSocialPairs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  const toggleFocus = (area) =>
    setFocusAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );

  /* ── Validation ────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!form.company_name.trim()) e.company_name = 'Required';
    if (!form.website_url.trim()) e.website_url = 'Required';
    else if (!/^https?:\/\/.+\..+/.test(form.website_url)) e.website_url = 'Enter a valid URL (https://...)';
    if (!form.industry.trim()) e.industry = 'Required';
    if (focusAreas.length === 0) e.focus = 'Pick at least one';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Build social_urls object from pairs
    const social_urls = {};
    socialPairs.forEach(p => {
      if (p.platform.trim() && p.url.trim()) social_urls[p.platform.trim().toLowerCase()] = p.url.trim();
    });

    onSubmit({
      ...form,
      social_urls,
      focus_areas: focusAreas,
    });
  };

  /* ── Shared input styles ───────────────────────────────── */
  const inputClass = (field) =>
    `w-full px-4 py-3 bg-white border-2 font-patrick text-lg text-pencil
     placeholder:text-pencil/30 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20
     transition-colors ${errors[field] ? 'border-accent' : 'border-pencil'}`;

  return (
    <div className="animate-fade-in-up">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="text-center mb-10 relative">
        <h1 className="font-kalam text-4xl md:text-6xl font-bold text-pencil mb-3 leading-tight">
          Sketch Your{' '}
          <span className="text-accent inline-block rotate-2 relative">
            Competitive Edge
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
              <path d="M2 5 Q50 2 100 5 T198 4" stroke="#ff4d4d" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
            </svg>
          </span>
        </h1>
        <p className="font-patrick text-xl md:text-2xl text-pencil/60 mt-2">
          Paste a competitor's URL — get an executive-ready intelligence report ✏️
        </p>

        {/* decorative arrow (desktop) */}
        <svg className="hidden md:block absolute -bottom-10 right-12 w-16 h-16 text-pencil/30" viewBox="0 0 60 60" fill="none">
          <path d="M10 5 Q30 30 50 50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
          <path d="M42 44 L50 50 L44 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ── Form Card ────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div
          className="bg-white border-[3px] border-pencil p-6 md:p-10 relative"
          style={{ borderRadius: W.md, boxShadow: S.hardLg }}
        >
          {/* tape decoration */}
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-pencil/10 z-10 rotate-1"
            style={{ borderRadius: '4px' }}
          />

          <div className="space-y-6">
            {/* ── Company Name ──────────────────────────── */}
            <div>
              <label className="font-kalam text-lg font-bold flex items-center gap-2 mb-1">
                <Building2 size={18} strokeWidth={2.5} /> Company Name *
              </label>
              <input
                type="text"
                value={form.company_name}
                onChange={e => update('company_name', e.target.value)}
                placeholder="e.g. Nike, Shopify, Notion..."
                className={inputClass('company_name')}
                style={{ borderRadius: W.input }}
              />
              {errors.company_name && <span className="text-accent text-sm font-patrick mt-1 block">{errors.company_name}</span>}
            </div>

            {/* ── Website URL ──────────────────────────── */}
            <div>
              <label className="font-kalam text-lg font-bold flex items-center gap-2 mb-1">
                <Globe size={18} strokeWidth={2.5} /> Website URL *
              </label>
              <input
                type="url"
                value={form.website_url}
                onChange={e => update('website_url', e.target.value)}
                placeholder="https://www.example.com"
                className={inputClass('website_url')}
                style={{ borderRadius: W.input }}
              />
              {errors.website_url && <span className="text-accent text-sm font-patrick mt-1 block">{errors.website_url}</span>}
            </div>

            {/* ── Industry ─────────────────────────────── */}
            <div>
              <label className="font-kalam text-lg font-bold flex items-center gap-2 mb-1">
                <Search size={18} strokeWidth={2.5} /> Industry *
              </label>
              <input
                type="text"
                value={form.industry}
                onChange={e => update('industry', e.target.value)}
                placeholder="e.g. Athletic Footwear & Apparel"
                className={inputClass('industry')}
                style={{ borderRadius: W.input }}
              />
              {errors.industry && <span className="text-accent text-sm font-patrick mt-1 block">{errors.industry}</span>}
            </div>

            {/* ── Our Company Context ──────────────────── */}
            <div>
              <label className="font-kalam text-lg font-bold flex items-center gap-2 mb-1">
                <Users size={18} strokeWidth={2.5} /> Your Company Context
                <span className="text-pencil/40 text-sm font-patrick">(optional)</span>
              </label>
              <textarea
                value={form.our_company_context}
                onChange={e => update('our_company_context', e.target.value)}
                placeholder="We are a similar business competing in the same market."
                rows={3}
                className={`${inputClass('our_company_context')} resize-none`}
                style={{ borderRadius: W.input }}
              />
            </div>

            {/* ── Divider ──────────────────────────────── */}
            <hr className="border-t-2 border-dashed border-muted" />

            {/* ── Social URLs ──────────────────────────── */}
            <div>
              <label className="font-kalam text-lg font-bold mb-2 block">
                Social Profiles <span className="text-pencil/40 text-sm font-patrick">(optional)</span>
              </label>

              {socialPairs.length > 0 && (
                <div className="space-y-3 mb-3">
                  {socialPairs.map((pair, i) => (
                    <div key={i} className="flex gap-2 items-start animate-fade-in-up">
                      <input
                        type="text"
                        value={pair.platform}
                        onChange={e => updateSocialPair(i, 'platform', e.target.value)}
                        placeholder="platform"
                        className="w-1/3 px-3 py-2 bg-white border-2 border-pencil font-patrick text-base
                                   placeholder:text-pencil/30 focus:outline-none focus:border-secondary"
                        style={{ borderRadius: W.input }}
                      />
                      <input
                        type="url"
                        value={pair.url}
                        onChange={e => updateSocialPair(i, 'url', e.target.value)}
                        placeholder="https://instagram.com/company"
                        className="flex-1 px-3 py-2 bg-white border-2 border-pencil font-patrick text-base
                                   placeholder:text-pencil/30 focus:outline-none focus:border-secondary"
                        style={{ borderRadius: W.input }}
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialPair(i)}
                        className="p-2 text-accent hover:bg-accent/10 transition-colors shrink-0"
                        style={{ borderRadius: W.sm }}
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addSocialPair}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-pencil/40
                           text-pencil/60 font-patrick text-base hover:border-pencil hover:text-pencil
                           transition-colors"
                style={{ borderRadius: W.pill }}
              >
                <Plus size={16} strokeWidth={2.5} /> Add Social URL
              </button>
            </div>

            {/* ── Divider ──────────────────────────────── */}
            <hr className="border-t-2 border-dashed border-muted" />

            {/* ── Focus Areas ──────────────────────────── */}
            <div>
              <label className="font-kalam text-lg font-bold mb-2 block">
                Focus Areas
              </label>
              <div className="flex flex-wrap gap-3">
                {FOCUS_OPTIONS.map(area => {
                  const active = focusAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleFocus(area)}
                      className={`px-4 py-2 border-[3px] font-patrick text-lg capitalize
                                  transition-all duration-100
                                  ${active
                                    ? 'bg-secondary text-white border-secondary shadow-hard-hover translate-x-[1px] translate-y-[1px]'
                                    : 'bg-white text-pencil border-pencil hover:bg-muted/30'
                                  }`}
                      style={{
                        borderRadius: W.pill,
                        boxShadow: active ? S.hardHover : S.hard,
                      }}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
              {errors.focus && <span className="text-accent text-sm font-patrick mt-1 block">{errors.focus}</span>}
            </div>
          </div>

          {/* ── Submit Button ──────────────────────────── */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white border-[3px] border-pencil
                         font-patrick text-xl md:text-2xl text-pencil
                         hover:bg-accent hover:text-white hover:translate-x-[2px] hover:translate-y-[2px]
                         active:translate-x-1 active:translate-y-1
                         transition-all duration-100"
              style={{ borderRadius: W.pill, boxShadow: S.hardLg }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = S.hard}
              onMouseLeave={e => e.currentTarget.style.boxShadow = S.hardLg}
              onMouseDown={e => e.currentTarget.style.boxShadow = S.none}
              onMouseUp={e => e.currentTarget.style.boxShadow = S.hard}
            >
              <Sparkles size={22} strokeWidth={2.5} /> Analyze Competitor
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
