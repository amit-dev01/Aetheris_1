import { useState, useEffect } from 'react';
import { Rss, ExternalLink, Filter } from 'lucide-react';
import { HISTORY_KEY } from '../constants';

export default function UniFeed() {
  const [companies, setCompanies] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load companies from history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        const uniqueCompanies = Array.from(new Set(history.map(h => h.company_name))).filter(Boolean);
        setCompanies(uniqueCompanies);
        setActiveFilters(uniqueCompanies);
      }
    } catch { /* ignore */ }
  }, []);

  // Fetch RSS for selected companies
  useEffect(() => {
    if (companies.length === 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchNews = async () => {
      setLoading(true);
      const allNews = [];

      // Fetch in parallel for active filters
      await Promise.all(activeFilters.map(async (company) => {
        try {
          const res = await fetch(`/news-rss?q=${encodeURIComponent(company)}&hl=en-US&gl=US&ceid=US:en`);
          const text = await res.text();
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, "text/xml");
          const items = Array.from(xml.querySelectorAll("item")).slice(0, 5); // top 5 per company

          items.forEach(item => {
            allNews.push({
              company,
              title: item.querySelector("title")?.textContent || "No title",
              link: item.querySelector("link")?.textContent || "#",
              pubDate: new Date(item.querySelector("pubDate")?.textContent || Date.now()),
              source: item.querySelector("source")?.textContent || "Google News",
            });
          });
        } catch (e) {
          console.error(`Failed to fetch news for ${company}`, e);
        }
      }));

      if (isMounted) {
        // Sort by date descending
        allNews.sort((a, b) => b.pubDate - a.pubDate);
        setNews(allNews);
        setLoading(false);
      }
    };

    fetchNews();

    return () => { isMounted = false; };
  }, [activeFilters, companies]); // Re-fetch if filters change

  const toggleFilter = (company) => {
    setActiveFilters(prev => 
      prev.includes(company) ? prev.filter(c => c !== company) : [...prev, company]
    );
  };

  if (companies.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <Rss size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-xl font-bold text-slate-500">No tracked competitors</h3>
        <p className="text-sm mt-2 text-slate-400">Run an analysis in the Competitors tab to populate your news feed.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      {/* ── Header & Filters ── */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
          <Rss size={28} className="text-blue-600" /> Live Intelligence Feed
        </h2>
        
        <div className="flex items-center gap-3 mt-6 flex-wrap">
          <Filter size={16} className="text-slate-500" />
          {companies.map(company => {
            const active = activeFilters.includes(company);
            return (
              <button
                key={company}
                onClick={() => toggleFilter(company)}
                className={`
                  px-4 py-1.5 rounded-full border text-sm font-medium transition-colors
                  ${active 
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm' 
                    : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                  }
                `}
              >
                {company}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Feed Content ── */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm font-medium">
          No news found for selected filters.
        </div>
      ) : (
        <div className="space-y-4 stagger">
          {news.map((item, i) => (
            <a 
              key={i} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 group transition-all animate-fade-in-up"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                  {item.company}
                </span>
                <span className="text-xs text-slate-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                  {item.pubDate.toLocaleDateString()} <ExternalLink size={14} />
                </span>
              </div>
              
              <h3 className="text-lg font-bold leading-tight mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {item.title.split(' - ')[0]} {/* Google news often appends the source to title */}
              </h3>
              
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {item.source}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
