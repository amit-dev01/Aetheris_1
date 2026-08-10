import { useState, createContext, useEffect, useRef } from 'react';
import { Bot, Target, Rss, Users, LayoutDashboard, Settings, LogOut, ChevronRight, Moon, Sun, Loader2, CheckCircle2, AlertCircle, TrendingUp, Bell } from 'lucide-react';
import OverviewSection from './components/OverviewSection';
import CompetitorsSection from './components/CompetitorsSection';
import MarketIntelligenceSection from './components/MarketIntelligenceSection';
import AIStrategySection from './components/AIStrategySection';
import AlertsSection from './components/AlertsSection';
import TrendsSection from './components/TrendsSection';
import GlobalAlertBanner from './components/GlobalAlertBanner';
import AIAgentModal from './components/AIAgentModal';
import OnboardingFlow from './components/OnboardingFlow';
import ProcessingScreen from './components/ProcessingScreen';
import SettingsSection from './components/SettingsSection';
import { 
  getCompanyProfile, 
  clearAuthSession, 
  getStoredToken, 
  getIntelligenceStats, 
  checkNow,
  getCheckStatus,
  getCompetitors,
  getIntelligenceAlerts,
  getIntelligenceTrends
} from './api';

// ── DbContext / IntelligenceContext for App State ──
export const DbContext = createContext(null);

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [appState, setAppState] = useState('LOADING'); // LOADING, ONBOARDING, PROCESSING, DASHBOARD
  const [companyProfile, setCompanyProfile] = useState(null);

  // Global Intelligence State
  const [intelligenceStats, setIntelligenceStats] = useState(null);
  const [intelligenceAlerts, setIntelligenceAlerts] = useState(null);
  const [intelligenceTrends, setIntelligenceTrends] = useState(null);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [acceptedCompetitors, setAcceptedCompetitors] = useState([]);
  const [selectedCompetitorFilter, setSelectedCompetitorFilter] = useState('All Competitors');

  // Check Status State
  const [checkStatus, setCheckStatus] = useState({
    status: 'IDLE',
    progress: 0,
    currentStep: '',
    documentsFound: 0,
    documentsProcessed: 0,
    startedAt: null,
    completedAt: null,
    error: null
  });

  // Global Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const pollCheckStatusRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchGlobalStats = async () => {
    try {
      const stats = await getIntelligenceStats();
      if (stats) {
        setIntelligenceStats(stats);
        setLastFetchedAt(Date.now());
      }
    } catch (err) {
      console.warn('Unable to fetch intelligence stats:', err);
    }
  };

  const fetchAlertsAndTrends = async () => {
    try {
      const [alerts, trends] = await Promise.all([
        getIntelligenceAlerts().catch(() => null),
        getIntelligenceTrends().catch(() => null)
      ]);
      if (alerts) setIntelligenceAlerts(alerts);
      if (trends) setIntelligenceTrends(trends);
    } catch (err) {
      console.warn('Unable to fetch alerts and trends:', err);
    }
  };

  const fetchAcceptedCompetitors = async () => {
    try {
      const res = await getCompetitors();
      const list = Array.isArray(res) ? res : res.competitors || [];
      setAcceptedCompetitors(list.filter(c => c.isAccepted === true));
    } catch (err) {
      console.warn('Unable to fetch competitors for context:', err);
    }
  };

  const refreshAllIntelligenceData = async () => {
    await Promise.all([
      fetchGlobalStats(),
      fetchAcceptedCompetitors(),
      fetchAlertsAndTrends()
    ]);
  };

  const checkAuthAndSetup = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login/';
        }
        return;
      }

      const res = await getCompanyProfile();
      setCompanyProfile(res?.company || res);

      const setupCompleted = res?.setupCompleted ?? (res?.company ? true : false);
      const company = res?.company;

      if (setupCompleted === false || !company) {
        setAppState('ONBOARDING');
        return;
      }

      const setupStatus = company.setupStatus || res?.setupStatus || 'COMPLETED';

      if (setupStatus === 'PROCESSING' || setupStatus === 'PENDING') {
        setAppState('PROCESSING');
      } else {
        setAppState('DASHBOARD');
        // Load initial stats & competitors for context
        fetchGlobalStats();
        fetchAcceptedCompetitors();
        fetchAlertsAndTrends();
      }
    } catch (err) {
      console.error('Route protection check error:', err);
      setAppState('ONBOARDING');
    }
  };

  useEffect(() => {
    checkAuthAndSetup();
  }, []);

  const pollCheckStatus = () => {
    if (pollCheckStatusRef.current) clearInterval(pollCheckStatusRef.current);
    
    pollCheckStatusRef.current = setInterval(async () => {
      try {
        const res = await getCheckStatus();
        setCheckStatus(prev => ({
          ...prev,
          status: res.status || 'RUNNING',
          progress: res.progress || prev.progress,
          currentStep: res.currentStep || prev.currentStep,
          documentsFound: res.documentsFound || prev.documentsFound,
          documentsProcessed: res.documentsProcessed || prev.documentsProcessed,
        }));

        if (res.status === 'COMPLETED') {
          clearInterval(pollCheckStatusRef.current);
          setCheckStatus(prev => ({ ...prev, completedAt: new Date().toISOString() }));
          showToast('Check completed successfully!', 'success');
          refreshAllIntelligenceData();
        } else if (res.status === 'FAILED') {
          clearInterval(pollCheckStatusRef.current);
          setCheckStatus(prev => ({ ...prev, error: res.error || 'Check failed' }));
          showToast(res.error || 'Check failed', 'error');
        }
      } catch (err) {
        console.error('Failed to poll check status:', err);
      }
    }, 3000);
  };

  const startCheck = async () => {
    if (checkStatus.status === 'RUNNING') return;
    
    try {
      setCheckStatus({
        status: 'RUNNING',
        progress: 0,
        currentStep: 'Starting check...',
        documentsFound: 0,
        documentsProcessed: 0,
        startedAt: new Date().toISOString(),
        completedAt: null,
        error: null
      });
      
      await checkNow();
      pollCheckStatus();
    } catch (err) {
      if (err.message && err.message.includes('409')) {
        showToast('A check is already in progress', 'error');
        setCheckStatus(prev => ({ ...prev, status: 'RUNNING' }));
        pollCheckStatus(); // resume polling
      } else {
        console.error('Failed to start check:', err);
        showToast(err.message || 'Something went wrong. Please try again.', 'error');
        setCheckStatus(prev => ({ ...prev, status: 'FAILED', error: err.message }));
      }
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pollCheckStatusRef.current) clearInterval(pollCheckStatusRef.current);
    };
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

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = '/login/';
  };

  // Helper to check if brief generated within 24 hours
  const isBriefNew = (generatedAt) => {
    if (!generatedAt) return false;
    const diff = Date.now() - new Date(generatedAt).getTime();
    return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
  };

  const criticalCount = intelligenceStats?.criticalEvents || 0;
  const isNewBriefAvailable = isBriefNew(intelligenceStats?.weeklyBriefGeneratedAt);
  const unacknowledgedAlerts = intelligenceAlerts?.totalUnacknowledged || 0;
  
  // Count active trends that are Critical or High
  const activeImportantTrends = (intelligenceTrends?.trends || [])
    .filter(t => t.isActive && (t.severity === 'CRITICAL' || t.severity === 'HIGH'))
    .length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'competitors', label: 'Competitors', icon: Users },
    { 
      id: 'market', 
      label: 'Market Intelligence', 
      icon: Rss,
      badge: criticalCount > 0 ? criticalCount : null,
      badgeColor: 'bg-red-500 text-white'
    },
    // {
    //   id: 'trends',
    //   label: 'Trends',
    //   icon: TrendingUp,
    //   badge: activeImportantTrends > 0 ? activeImportantTrends : null,
    //   badgeColor: 'bg-blue-600 text-white'
    // },
    // {
    //   id: 'alerts',
    //   label: 'Alerts',
    //   icon: Bell,
    //   badge: unacknowledgedAlerts > 0 ? unacknowledgedAlerts : null,
    //   badgeColor: 'bg-red-500 text-white'
    // },
    { 
      id: 'strategy', 
      label: 'AI Strategy', 
      icon: Target,
      badge: isNewBriefAvailable ? 'NEW' : null,
      badgeColor: 'bg-blue-600 text-white'
    },
  ];

  if (appState === 'LOADING') {
    return (
      <div className="flex h-screen bg-slate-100 dark:bg-black items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (appState === 'ONBOARDING') {
    return <OnboardingFlow onComplete={() => setAppState('PROCESSING')} />;
  }

  if (appState === 'PROCESSING') {
    return (
      <ProcessingScreen 
        onComplete={() => {
          checkAuthAndSetup();
          setAppState('DASHBOARD');
        }} 
      />
    );
  }

  const contextValue = {
    companyProfile,
    refreshProfile: checkAuthAndSetup,
    intelligenceStats,
    intelligenceAlerts,
    intelligenceTrends,
    refreshAlertsAndTrends: fetchAlertsAndTrends,
    lastFetchedAt,
    refreshStats: fetchGlobalStats,
    acceptedCompetitors,
    refreshCompetitors: fetchAcceptedCompetitors,
    refreshAllIntelligenceData,
    checkStatus,
    startCheck,
    showToast,
    selectedCompetitorFilter,
    setSelectedCompetitorFilter,
    setActiveSection
  };

  return (
    <DbContext.Provider value={contextValue}>
      <div className="flex h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-slate-100 font-sans">
        
        {/* Global Toast Message */}
        {toast.show && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-semibold border ${
            toast.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-800 dark:border-slate-200'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium text-sm
                    ${active 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.label}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight size={16} className="opacity-50" />}
                  </div>
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
            <button 
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm
                ${activeSection === 'settings' 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
            >
              <Settings size={18} /> Settings
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors font-medium text-sm"
            >
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

          <div className="flex-1 overflow-y-auto relative">
            <GlobalAlertBanner />
            <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
              {activeSection === 'overview' && <OverviewSection />}
              {activeSection === 'competitors' && <CompetitorsSection />}
              {activeSection === 'market' && <MarketIntelligenceSection />}
              {activeSection === 'strategy' && <AIStrategySection />}
              {activeSection === 'alerts' && <AlertsSection />}
              {activeSection === 'trends' && <TrendsSection />}
              {activeSection === 'settings' && <SettingsSection />}
            </div>
          </div>
        </main>
        
        <AIAgentModal isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} />
      </div>
    </DbContext.Provider>
  );
}
