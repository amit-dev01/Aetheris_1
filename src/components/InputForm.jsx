import { useState } from 'react';
import { Plus, Trash2, Sparkles, Globe, Building2, Users, Search } from 'lucide-react';
import { FOCUS_OPTIONS } from '../constants';

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
    `w-full px-4 py-3 bg-white dark:bg-black border-2 font-sans text-sm text-black dark:text-white
     placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:border-accent
     transition-colors ${errors[field] ? 'border-accent' : 'border-black dark:border-white'}`;

  return (
    <div className="animate-fade-in-up">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="text-left mb-12 relative border-b-4 border-black dark:border-white pb-8">
        <span className="font-mono font-black text-accent text-sm block mb-2">[ 01.1 // CONFIGURE_RUN ]</span>
        <h1 className="font-heading text-4xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-3">
          Configure Scan Parameters
        </h1>
        <p className="font-sans text-base text-slate-600 dark:text-slate-400 max-w-xl">
          Enter competitor details below to initialize automated web scraping and SWOT synthesis.
        </p>
      </div>

      {/* ── Form Card ────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-6 md:p-10 relative">
          <div className="space-y-8">
            
            {/* ── Company Name ──────────────────────────── */}
            <div>
              <label className="font-heading text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                <Building2 size={14} strokeWidth={3} /> Company Name *
              </label>
              <input
                type="text"
                value={form.company_name}
                onChange={e => update('company_name', e.target.value)}
                placeholder="e.g. Nike, Shopify, Notion..."
                className={inputClass('company_name')}
              />
              {errors.company_name && <span className="text-accent text-xs font-mono uppercase tracking-wider mt-1.5 block">Error: {errors.company_name}</span>}
            </div>

            {/* ── Website URL ──────────────────────────── */}
            <div>
              <label className="font-heading text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                <Globe size={14} strokeWidth={3} /> Website URL *
              </label>
              <input
                type="url"
                value={form.website_url}
                onChange={e => update('website_url', e.target.value)}
                placeholder="https://www.example.com"
                className={inputClass('website_url')}
              />
              {errors.website_url && <span className="text-accent text-xs font-mono uppercase tracking-wider mt-1.5 block">Error: {errors.website_url}</span>}
            </div>

            {/* ── Industry ─────────────────────────────── */}
            <div>
              <label className="font-heading text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                <Search size={14} strokeWidth={3} /> Industry *
              </label>
              <input
                type="text"
                value={form.industry}
                onChange={e => update('industry', e.target.value)}
                placeholder="e.g. Athletic Footwear & Apparel"
                className={inputClass('industry')}
              />
              {errors.industry && <span className="text-accent text-xs font-mono uppercase tracking-wider mt-1.5 block">Error: {errors.industry}</span>}
            </div>

            {/* ── Our Company Context ──────────────────── */}
            <div>
              <label className="font-heading text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-2">
                <Users size={14} strokeWidth={3} /> Your Company Context
                <span className="opacity-50 text-[10px] lowercase font-mono"> (optional)</span>
              </label>
              <textarea
                value={form.our_company_context}
                onChange={e => update('our_company_context', e.target.value)}
                placeholder="Describe your positioning to customize differentiation recommendations..."
                rows={3}
                className={`${inputClass('our_company_context')} resize-none`}
              />
            </div>

            {/* ── Divider ──────────────────────────────── */}
            <hr className="border-t-2 border-black dark:border-white" />

            {/* ── Social URLs ──────────────────────────── */}
            <div>
              <label className="font-heading text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-3">
                Social Profiles <span className="opacity-50 text-[10px] lowercase font-mono">(optional)</span>
              </label>

              {socialPairs.length > 0 && (
                <div className="space-y-3 mb-4">
                  {socialPairs.map((pair, i) => (
                    <div key={i} className="flex gap-2 items-start animate-fade-in-up">
                      <input
                        type="text"
                        value={pair.platform}
                        onChange={e => updateSocialPair(i, 'platform', e.target.value)}
                        placeholder="platform"
                        className="w-1/3 px-3 py-2 bg-white dark:bg-black border-2 border-black dark:border-white font-sans text-sm focus:outline-none focus:border-accent"
                      />
                      <input
                        type="url"
                        value={pair.url}
                        onChange={e => updateSocialPair(i, 'url', e.target.value)}
                        placeholder="https://instagram.com/company"
                        className="flex-1 px-3 py-2 bg-white dark:bg-black border-2 border-black dark:border-white font-sans text-sm focus:outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialPair(i)}
                        className="p-2.5 border-2 border-black dark:border-white text-accent hover:bg-accent hover:text-white dark:hover:text-white snappy shrink-0"
                      >
                        <Trash2 size={16} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addSocialPair}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-black dark:border-white
                           text-black dark:text-white font-heading font-black text-xs uppercase tracking-widest
                           hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                <Plus size={14} strokeWidth={3} /> Add Social URL
              </button>
            </div>

            {/* ── Divider ──────────────────────────────── */}
            <hr className="border-t-2 border-black dark:border-white" />

            {/* ── Focus Areas ──────────────────────────── */}
            <div>
              <label className="font-heading text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-3">
                Focus Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map(area => {
                  const active = focusAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleFocus(area)}
                      className={`px-4 py-2 border-2 font-heading text-xs uppercase tracking-widest font-black snappy
                                  ${active
                                    ? 'bg-accent text-white border-black dark:border-white'
                                    : 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white'
                                  }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
              {errors.focus && <span className="text-accent text-xs font-mono uppercase tracking-wider mt-2 block">Error: {errors.focus}</span>}
            </div>
          </div>

          {/* ── Submit Button ──────────────────────────── */}
          <div className="mt-10 border-t-2 border-black dark:border-white pt-8 text-left">
            <button
              type="submit"
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-heading font-black text-base uppercase tracking-widest border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black snappy shrink-0"
            >
              <Sparkles size={18} strokeWidth={3} /> Analyze Competitor
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
