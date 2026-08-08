import { useState, createContext, useEffect } from 'react';
import { Bot, Target, Rss, Users, LayoutDashboard, Settings, LogOut, ChevronRight, Moon, Sun } from 'lucide-react';
import OverviewSection from './components/OverviewSection';
import CompetitorsSection from './components/CompetitorsSection';
import MarketIntelligenceSection from './components/MarketIntelligenceSection';
import AIStrategySection from './components/AIStrategySection';
import AIAgentModal from './components/AIAgentModal';
import OnboardingFlow from './components/OnboardingFlow';
import { Loader2 } from 'lucide-react';

// ── Mock DB Data Context ──
export const DbContext = createContext(null);

const MOCK_DB_USER_COMPANY = {
  company_name: 'Aetheris Demo',
  website_url: 'https://aetheris.dev',
  industry: 'SaaS / AI Intelligence',
  our_company_context: 'We build AI-powered intelligence tools.',
  focus_areas: ['products', 'pricing'],
  revenue: '$12.4M',
  customers: '18,400',
  growth: '+23%',
  competitive_score: '84/100',
  strengths: ['Product quality', 'Enterprise integrations', 'Developer experience'],
  weaknesses: ['Pricing', 'Brand awareness', 'International presence']
};

const MOCK_DB_COMPETITORS = [
  {
    id: 1,
    company_name: 'Stripe',
    industry: 'Fintech Payments',
    competitive_status: 'Direct Threat',
    pricing_indicator: '↑ 12%',
    growth_indicator: '+15%',
    sentiment_indicator: '↓ 4%',
    ai_score: '92/100',
    recent_event: 'Launched lower-priced enterprise plan.',
    logo: 'S'
  },
  {
    id: 2,
    company_name: 'Shopify',
    industry: 'E-commerce Platform',
    competitive_status: 'Market Leader',
    pricing_indicator: 'Stable',
    growth_indicator: '+8%',
    sentiment_indicator: '↑ 2%',
    ai_score: '88/100',
    recent_event: 'Announced AWS partnership.',
    logo: 'Sh'
  },
  {
    id: 3,
    company_name: 'Paddle',
    industry: 'Revenue Delivery',
    competitive_status: 'Emerging',
    pricing_indicator: '↓ 5%',
    growth_indicator: '+35%',
    sentiment_indicator: 'Neutral',
    ai_score: '76/100',
    recent_event: 'Receiving negative customer sentiment around support.',
    logo: 'P'
  }
];

const MOCK_DB_FEED = [
  { id: 1, impact: 'High', company: 'Stripe', title: 'Stripe launched Enterprise Pro', category: 'Pricing', summary: 'A new tier aimed at large volume businesses with volume discounts.', ai_interpretation: 'This directly overlaps with our enterprise offering and may increase pricing pressure.', date: new Date().toISOString(), recommended_action: 'Review enterprise pricing' },
  { id: 2, impact: 'Medium', company: 'Shopify', title: 'Shopify announces AWS partnership', category: 'Partnerships', summary: 'Strategic alignment to use AWS for global infrastructure.', ai_interpretation: 'This could strengthen their enterprise distribution channel.', date: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, impact: 'Opportunity', company: 'Paddle', title: 'Support wait times increase', category: 'Customer Sentiment', summary: 'Multiple public complaints regarding slow support response times over the weekend.', ai_interpretation: 'This may create an opportunity for us to differentiate through customer support.', date: new Date(Date.now() - 172800000).toISOString() }
];

const MOCK_DB_STRATEGY = [
  { id: 1, priority: 'High', title: 'Respond to Stripe pricing change', reason: 'Stripe reduced enterprise pricing via their new Pro tier.', actions: ['Review enterprise pricing', 'Emphasize our premium features', 'Target dissatisfied competitor customers'] },
  { id: 2, priority: 'Medium', title: 'Capitalize on Paddle support issues', reason: 'Competitor is experiencing public backlash over support quality.', actions: ['Launch campaign highlighting our 24/7 support', 'Reach out to churning Paddle customers'] }
];

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [setupStatus, setSetupStatus] = useState('loading');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login/';
      return;
    }
    
    fetch('/api/company/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('access_token');
          window.location.href = '/login/';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (data.setupCompleted) {
          setSetupStatus('complete');
        } else {
          setSetupStatus('incomplete');
        }
      })
      .catch(() => {
        setSetupStatus('incomplete');
      });
  }, []);

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
    feed: MOCK_DB_FEED,
    strategy: MOCK_DB_STRATEGY
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'competitors', label: 'Competitors', icon: Users },
    { id: 'market', label: 'Market Intelligence', icon: Rss },
    { id: 'strategy', label: 'AI Strategy', icon: Target },
  ];

  if (setupStatus === 'loading') {
    return (
      <div className="flex h-screen bg-slate-100 dark:bg-black items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (setupStatus === 'incomplete') {
    return <OnboardingFlow onComplete={() => setSetupStatus('complete')} />;
  }

  return (
    <DbContext.Provider value={dbValue}>
      <div className="flex h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-slate-100 font-sans">
        
        {/* ── Left Sidebar ── */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex shrink-0 z-10">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-bold text-xl flex items-center gap-2 text-slate-900 dark:text-white">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                Ae
              </span>
              Aetheris
            </h1>
          </div>
          
          <div className="px-4 py-6 border-b border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setIsAgentOpen(true)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <Bot size={18} className="text-blue-400 dark:text-blue-600" />
                Ask Agent
              </span>
              <ChevronRight size={16} className="opacity-50" />
            </button>
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
             <div className="flex gap-2">
               <button onClick={() => setIsAgentOpen(true)} className="p-2 text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg">
                  <Bot size={20} />
               </button>
               <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
               </button>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
            <div className="max-w-5xl mx-auto w-full">
              {activeSection === 'overview' && <OverviewSection />}
              {activeSection === 'competitors' && <CompetitorsSection />}
              {activeSection === 'market' && <MarketIntelligenceSection />}
              {activeSection === 'strategy' && <AIStrategySection />}
            </div>
          </div>
        </main>
        
        <AIAgentModal isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} />
      </div>
    </DbContext.Provider>
  );
}
