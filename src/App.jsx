import { useState, createContext, useEffect } from 'react';
import { Building2, Users, Rss, Settings, LogOut, ChevronRight, Moon, Sun } from 'lucide-react';
import MyCompanySection from './components/MyCompanySection';
import CompetitorsSection from './components/CompetitorsSection';
import UniFeed from './components/UniFeed';

// ── Mock DB Data Context ──
export const DbContext = createContext(null);

const MOCK_DB_USER_COMPANY = {
  company_name: 'Aetheris Demo',
  website_url: 'https://aetheris.dev',
  industry: 'Software SaaS',
  our_company_context: 'We build AI-powered intelligence tools.',
  focus_areas: ['products', 'pricing'],
  social_urls: { twitter: 'https://twitter.com/aetheris' }
};

const MOCK_DB_COMPETITORS = [
  {
    id: 1,
    company_name: 'Stripe',
    website_url: 'https://stripe.com',
    industry: 'Fintech Payments',
    focus_areas: ['pricing', 'positioning'],
    social_urls: {}
  },
  {
    id: 2,
    company_name: 'Shopify',
    website_url: 'https://shopify.com',
    industry: 'E-commerce Platform',
    focus_areas: ['products', 'social'],
    social_urls: {}
  }
];

export default function App() {
  const [activeSection, setActiveSection] = useState('competitors');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  // Provide mock DB to app
  const dbValue = {
    myCompany: MOCK_DB_USER_COMPANY,
    competitors: MOCK_DB_COMPETITORS,
  };

  const navItems = [
    { id: 'mycompany', label: 'My Company', icon: Building2 },
    { id: 'competitors', label: 'Competitors', icon: Users },
    { id: 'unifeed', label: 'UniFeed News', icon: Rss },
  ];

  return (
    <DbContext.Provider value={dbValue}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        
        {/* ── Left Sidebar ── */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex shrink-0">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-bold text-xl flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                Ae
              </span>
              Aetheris
            </h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map(item => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm
                    ${active 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                  {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors font-medium text-sm"
            >
              <span className="flex items-center gap-3">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />} 
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors font-medium text-sm">
              <Settings size={18} /> Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors font-medium text-sm">
              <LogOut size={18} /> Log out
            </button>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-3">
             <div className="flex items-center gap-3">
               <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  Ae
                </span>
                <h1 className="font-bold text-lg">Aetheris</h1>
             </div>
             <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-5xl mx-auto w-full">
              {activeSection === 'mycompany' && <MyCompanySection />}
              {activeSection === 'competitors' && <CompetitorsSection />}
              {activeSection === 'unifeed' && <UniFeed />}
            </div>
          </div>
        </main>

      </div>
    </DbContext.Provider>
  );
}
