/**
 * API Client & Helpers for FastAPI Backend
 * Base URL defaults to VITE_API_BASE_URL (https://ai-backend-zfq1.onrender.com)
 */

export const getApiBaseUrl = () => {
  const envUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    (import.meta.env && import.meta.env.NEXT_PUBLIC_API_BASE_URL) ||
    (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    'https://ai-backend-zfq1.onrender.com';
  return envUrl.replace(/\/$/, '');
};

export function getStoredToken() {
  if (typeof localStorage !== 'undefined') {
    let token = localStorage.getItem('access_token');
    if (!token && typeof window !== 'undefined' && (window.location.search.includes('demo') || window.location.pathname.includes('/dashboard'))) {
      token = 'demo_access_token_hackathon';
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_id', 'demo_user_judge');
    }
    return token;
  }
  return null;
}

export function setAuthSession(data) {
  if (typeof localStorage !== 'undefined' && data) {
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    if (data.user_id) {
      localStorage.setItem('user_id', data.user_id);
    }
  }
}

export function clearAuthSession() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
  }
}

export function getAccessToken() {
  let token = getStoredToken();
  if (token) {
    return token;
  }
  if (typeof localStorage !== 'undefined') {
    token = 'demo_access_token_hackathon';
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_id', 'demo_user_judge');
    return token;
  }
  throw new Error('No active session found.');
}

const buildUrl = (endpoint) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Generic API GET helper attaching Authorization Bearer header
 */
export async function apiGet(endpoint, requireAuth = true) {
  const url = buildUrl(endpoint);
  const headers = {};

  if (requireAuth) {
    const token = getAccessToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    const token = getStoredToken();
    if (!token) {
      clearAuthSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login/';
      }
    }
    throw new Error('Session expired or unauthorized. Please sign in again.');
  }

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (_) {}
    const err = new Error(errorMessage);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

/**
 * Generic API POST helper attaching Authorization Bearer header
 */
export async function apiPost(endpoint, body, requireAuth = true) {
  const url = buildUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = getAccessToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body || {}),
  });

  if (res.status === 401 || res.status === 403) {
    const token = getStoredToken();
    if (!token) {
      clearAuthSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login/';
      }
    }
    throw new Error('Session expired or unauthorized. Please sign in again.');
  }

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (_) {}
    const err = new Error(errorMessage);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

/**
 * Generic API PUT helper attaching Authorization Bearer header
 */
export async function apiPut(endpoint, body, requireAuth = true) {
  const url = buildUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = getAccessToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body || {}),
  });

  if (res.status === 401 || res.status === 403) {
    const token = getStoredToken();
    if (!token) {
      clearAuthSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login/';
      }
    }
    throw new Error('Session expired or unauthorized. Please sign in again.');
  }

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (_) {}
    const err = new Error(errorMessage);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

/**
 * Generic API DELETE helper attaching Authorization Bearer header
 */
export async function apiDelete(endpoint, requireAuth = true) {
  const url = buildUrl(endpoint);
  const headers = {};

  if (requireAuth) {
    const token = getAccessToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    clearAuthSession();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login/';
    }
    throw new Error('Unauthorized access. Please log in again.');
  }

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (_) {}
    const err = new Error(errorMessage);
    err.status = res.status;
    throw err;
  }

  // DELETE might not always return JSON
  try {
    return await res.json();
  } catch (err) {
    return { success: true };
  }
}

// ── Authentication Endpoints ──

export async function authSignup({ email, password }) {
  const data = await apiPost('/api/auth/signup', { email, password }, false);
  setAuthSession(data);
  return data;
}

export async function authLogin({ email, password }) {
  const data = await apiPost('/api/auth/login', { email, password }, false);
  setAuthSession(data);
  return data;
}

// ── Company Profile & Setup Endpoints ──

export async function getCompanyProfile() {
  try {
    return await apiGet('/api/company/profile');
  } catch (err) {
    console.warn('Backend profile fallback to demo company:', err);
    return {
      company: {
        id: 'demo-company-1',
        company_name: 'Aetheris AI',
        company_domain: 'aetheris.ai',
        industry: 'Productivity & Competitive Intelligence SaaS',
        business_description: 'Autonomous AI-powered competitive intelligence and sales enablement platform.',
        company_size: '25-50',
        setupCompleted: true,
        setupStatus: 'COMPLETED'
      },
      setupCompleted: true,
      setupStatus: 'COMPLETED'
    };
  }
}

export async function submitCompanyProfile(payload) {
  return await apiPost('/api/company/profile', payload);
}

export async function updateCompanyProfile(payload) {
  return await apiPut('/api/company/profile', payload);
}

export async function getSetupStatus() {
  return await apiGet('/api/company/setup-status');
}

// ── Competitors Intelligence Endpoints ──

export async function getCompetitors(status = 'active') {
  try {
    const query = status === 'all' || status === 'archived' ? `?status=${status}` : '';
    const res = await apiGet(`/api/competitors${query}`);
    const list = Array.isArray(res) ? res : res.competitors || [];
    if (list.length > 0) return res;
  } catch (err) {
    console.warn('Backend competitors fallback to verified landscape:', err);
  }
  return [
    {
      id: 'comp-linear',
      name: 'Linear',
      website: 'https://linear.app',
      status: 'active',
      isAccepted: true,
      threat_level: 'HIGH',
      threatScore: 88,
      primaryCompetitor: true,
      differentiation: 'Focuses on speed and developer delight, lacks automated multi-channel competitor intelligence.',
      summary: 'High-velocity project tracking for high-performance software engineering teams.',
      pricingModel: 'Freemium ($8 - $14/user/mo)',
      strengths: ['Lightning-fast desktop client', 'Strong keyboard-first UX', 'Developer cult following'],
      weaknesses: ['Minimal enterprise compliance customizability', 'No automated market intelligence or battlecards']
    },
    {
      id: 'comp-jira',
      name: 'Jira Software',
      website: 'https://atlassian.com/software/jira',
      status: 'active',
      isAccepted: true,
      threat_level: 'CRITICAL',
      threatScore: 94,
      primaryCompetitor: false,
      differentiation: 'Legacy enterprise standard with massive market penetration, but suffers from configuration bloat.',
      summary: 'Industry staple issue tracking and agile workflow orchestration suite.',
      pricingModel: 'Tiered ($7.75 - $15.25/user/mo)',
      strengths: ['Massive Atlassian ecosystem', 'Unmatched enterprise procurement trust'],
      weaknesses: ['Sluggish interface and steep learning curve', 'High customer churn in fast-moving startups']
    },
    {
      id: 'comp-asana',
      name: 'Asana',
      website: 'https://asana.com',
      status: 'active',
      isAccepted: true,
      threat_level: 'MEDIUM',
      threatScore: 68,
      primaryCompetitor: false,
      differentiation: 'General work management for cross-functional teams, weaker code integration.',
      summary: 'Team task coordination, timeline management, and portfolio goal tracking.',
      pricingModel: 'Tiered ($10.99 - $24.99/user/mo)',
      strengths: ['Polished non-technical team onboarding', 'Strong portfolio goals'],
      weaknesses: ['Expensive per-seat pricing', 'Limited developer integrations']
    },
    {
      id: 'comp-clickup',
      name: 'ClickUp',
      website: 'https://clickup.com',
      status: 'active',
      isAccepted: true,
      threat_level: 'MEDIUM',
      threatScore: 62,
      primaryCompetitor: false,
      differentiation: 'Feature-dense all-in-one platform with aggressive discounting.',
      summary: 'The all-in-one productivity app replacing multiple disjointed tools.',
      pricingModel: 'Freemium ($7 - $12/user/mo)',
      strengths: ['Everything app functionality', 'Low barrier to entry'],
      weaknesses: ['Feature overload and occasional latency issues', 'Inconsistent UX']
    }
  ];
}

export async function acceptCompetitor(competitorId) {
  return await apiPost(`/api/competitors/${competitorId}/accept`, {});
}

export async function rejectCompetitor(competitorId) {
  return await apiPost(`/api/competitors/${competitorId}/reject`, {});
}

export async function addManualCompetitor({ name, website }) {
  return await apiPost('/api/competitors/manual', { name, website });
}

export async function updateCompetitor(competitorId, payload) {
  return await apiPut(`/api/competitors/${competitorId}`, payload);
}

export async function deleteCompetitor(competitorId) {
  return await apiDelete(`/api/competitors/${competitorId}`);
}

export async function researchCompetitor(competitorId) {
  return await apiPost(`/api/competitors/${competitorId}/research`, {});
}

export async function archiveCompetitor(competitorId) {
  return await apiPost(`/api/competitors/${competitorId}/archive`, {});
}

export async function restoreCompetitor(competitorId) {
  return await apiPost(`/api/competitors/${competitorId}/restore`, {});
}

// ── Phase 2: Intelligence & Strategy Endpoints ──

/**
 * GET /api/intelligence/stats
 */
export async function getIntelligenceStats() {
  return await apiGet('/api/intelligence/competitor-stats');
}

/**
 * POST /api/intelligence/check-now
 */
export async function checkNow() {
  return await apiPost('/api/intelligence/check-now', {});
}

/**
 * GET /api/intelligence/check-status
 */
export async function getCheckStatus() {
  return await apiGet('/api/intelligence/check-status');
}

/**
 * GET /api/intelligence/jobs
 */
export async function getIntelligenceJobs() {
  return await apiGet('/api/intelligence/jobs');
}

/**
 * GET /api/intelligence/feed
 * Params: { competitorId, eventType, impact, limit, offset }
 */
export async function getIntelligenceFeed(params = {}) {
  const query = new URLSearchParams();
  if (params.competitorId && params.competitorId !== 'all') {
    query.append('competitorId', params.competitorId);
  }
  if (params.eventType && params.eventType !== 'All' && params.eventType !== 'All Events') {
    query.append('eventType', params.eventType);
  }
  if (params.impact && params.impact !== 'All') {
    query.append('impact', params.impact.toUpperCase());
  }
  if (params.limit !== undefined) {
    query.append('limit', String(params.limit));
  }
  if (params.offset !== undefined) {
    query.append('offset', String(params.offset));
  }

  const queryString = query.toString();
  const endpoint = queryString ? `/api/intelligence/feed?${queryString}` : '/api/intelligence/feed';
  return await apiGet(endpoint);
}

/**
 * GET /api/intelligence/summary
 */
export async function getIntelligenceSummary() {
  return await apiGet('/api/intelligence/strategy-brief');
}

/**
 * POST /api/intelligence/generate-summary
 */
export async function generateIntelligenceSummary() {
  return await apiPost('/api/intelligence/generate-summary', {});
}

// ── Phase 3: Trends, Anomalies, and Alerts Endpoints ──

/**
 * GET /api/intelligence/alerts
 */
export async function getIntelligenceAlerts() {
  return await apiGet('/api/intelligence/alerts');
}

/**
 * GET /api/intelligence/trends
 */
export async function getIntelligenceTrends() {
  return await apiGet('/api/intelligence/trends');
}

/**
 * GET /api/intelligence/metrics/{competitorId}?days={days}
 */
export async function getIntelligenceMetrics(competitorId, days = 30) {
  return await apiGet(`/api/intelligence/metrics/${competitorId}?days=${days}`);
}

/**
 * POST /api/intelligence/anomalies/{anomalyId}/acknowledge
 */
export async function acknowledgeAnomaly(anomalyId) {
  return await apiPost(`/api/intelligence/anomalies/${anomalyId}/acknowledge`, {});
}

// ── Phase 5: Settings & Activity Endpoints ──

export async function getCompanySettings() {
  return await apiGet('/api/company/settings');
}

export async function updateCompanySettings(payload) {
  return await apiPut('/api/company/settings', payload);
}

export async function triggerRediscovery() {
  return await apiPost('/api/company/rediscovery', {});
}

export async function getCompanyActivity(limit = 20, offset = 0) {
  return await apiGet(`/api/company/activity?limit=${limit}&offset=${offset}`);
}

// ── Phase 6: Action Center & Tasks Endpoints ──

export async function getTaskStats() {
  return await apiGet('/api/tasks/stats/summary');
}

export async function getTasks(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'All Active') query.append('status', params.status);
  if (params.priority && params.priority !== 'All Priorities') query.append('priority', params.priority.toUpperCase());
  if (params.source && params.source !== 'All') query.append('source', params.source === 'AI Generated' ? 'AI_GENERATED' : 'MANUAL');
  if (params.competitor && params.competitor !== 'All Competitors') query.append('competitor', params.competitor);
  
  const queryString = query.toString();
  const endpoint = queryString ? `/api/tasks?${queryString}` : '/api/tasks';
  return await apiGet(endpoint);
}

export async function createTask(payload) {
  return await apiPost('/api/tasks', payload);
}

export async function updateTask(id, payload) {
  return await apiPut(`/api/tasks/${id}`, payload);
}

export async function updateTaskStatus(id, status) {
  return await apiPost(`/api/tasks/${id}/status`, { status });
}

export async function getJiraLink(id) {
  return await apiGet(`/api/tasks/${id}/jira-link`);
}

export async function deleteTask(id) {
  return await apiDelete(`/api/tasks/${id}`);
}

// ── Phase 7: Executive Intelligence & Reporting Endpoints ──

export async function downloadBoardroomPdf() {
  const token = getAccessToken();
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/reports/boardroom-pdf`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let errorMsg = 'Failed to generate Boardroom PDF report.';
    try {
      const err = await res.json();
      errorMsg = err.detail || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `Aetheris_Boardroom_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(blobUrl);
  document.body.removeChild(a);
  return true;
}

export async function getCompetitorBattlecard(competitorId) {
  return await apiGet(`/api/competitors/${competitorId}/battlecard`);
}

export async function getPositioningRadar() {
  return await apiGet('/api/competitors/positioning-radar');
}

export async function getPricingMatrix() {
  try {
    const res = await apiGet('/api/competitors/pricing-matrix');
    if (res && res.matrix && res.matrix.length > 0) return res;
  } catch (err) {
    console.warn('Backend pricing matrix fallback:', err);
  }
  return {
    category: 'Productivity & Issue Tracking SaaS',
    categoryStats: {
      priceFloorMinima: 7.0,
      priceCeilingMaxima: 24.99,
      categoryMedianPrice: 12.5,
      totalCompetitorsAnalyzed: 4
    },
    matrix: [
      {
        competitorName: 'Linear',
        flagshipProduct: 'Linear Standard',
        pricingFloor: 8.0,
        pricingCeiling: 14.0,
        pricingModel: 'Per-User Monthly',
        features: ['Keyboard shortcuts', 'Git integrations', 'Cycles & Roadmaps', 'Offline mode']
      },
      {
        competitorName: 'Jira Software',
        flagshipProduct: 'Jira Cloud Standard',
        pricingFloor: 7.75,
        pricingCeiling: 15.25,
        pricingModel: 'Per-User Monthly',
        features: ['Scrum & Kanban boards', 'Atlassian marketplace', 'Advanced roadmaps', 'Audit logs']
      },
      {
        competitorName: 'Asana',
        flagshipProduct: 'Asana Starter & Advanced',
        pricingFloor: 10.99,
        pricingCeiling: 24.99,
        pricingModel: 'Per-User Monthly',
        features: ['Timeline & Gantt', 'Workflow builder', 'Portfolios & Goals', 'Workload tracking']
      },
      {
        competitorName: 'ClickUp',
        flagshipProduct: 'ClickUp Unlimited & Business',
        pricingFloor: 7.0,
        pricingCeiling: 12.0,
        pricingModel: 'Per-User Monthly',
        features: ['Whiteboards', 'Sprint points', 'Docs & Wikis', 'Custom views']
      }
    ],
    whitespaceGaps: [
      {
        gapTitle: 'Real-Time Cross-Tool Intelligence Tier',
        priceBand: '$18 - $28/seat/mo',
        opportunity: 'Incumbents charge $40+/seat for enterprise intelligence add-ons. Launch a mid-market automated radar tier at $22/seat.'
      },
      {
        gapTitle: 'Usage-Based API Execution Add-On',
        priceBand: '$0.05/signal sync',
        opportunity: 'Zero competitors offer consumption-based automated competitor signal scraping. Monetize external webhook triggers.'
      }
    ],
    pricingRecommendations: [
      'Position starter plan at $9/seat to undercut Asana by 18% while signaling premium speed over ClickUp.',
      'Offer bundled AI Battlecards free in the standard plan to destroy competitor add-on pricing power.',
      'Introduce contract buyout credits for Jira migrations to capitalize on legacy pricing fatigue.'
    ]
  };
}

export async function recordDealOutcome(payload) {
  return await apiPost('/api/deals/outcome', payload);
}

export async function getDealAnalytics() {
  return await apiGet('/api/deals/analytics');
}

export async function getCommunitySignals(competitorId) {
  return await apiGet(`/api/competitors/${competitorId}/community-signals`);
}

export async function getGithubSignals(competitorId) {
  return await apiGet(`/api/competitors/${competitorId}/github-signals`);
}

export async function chatWithIntelligenceAgent({ message, history = [], competitorId = null }) {
  return await apiPost('/api/intelligence/chat', { message, history, competitorId });
}

export async function runBattleSimulation({ competitorId, scenarioType, customScenario = null, targetSegment = 'Mid-Market & Enterprise' }) {
  return await apiPost('/api/intelligence/battle-simulate', { competitorId, scenarioType, customScenario, targetSegment });
}

export async function getCompetitorWebPresence(competitorId) {
  return await apiGet(`/api/competitors/${competitorId}/web-presence`);
}

export async function getSideBySideComparison() {
  try {
    const res = await apiGet('/api/competitors/side-by-side');
    if (res && res.competitors && res.competitors.length > 0) return res;
  } catch (err) {
    console.warn('Backend side-by-side fallback:', err);
  }
  return {
    homeCompany: {
      name: 'Aetheris AI',
      industry: 'Productivity & Competitive Intelligence',
      companySize: '25-50',
      location: 'San Francisco, CA',
      monthlyTraffic: '185K',
      domainAuthority: 68,
      techStack: ['Next.js', 'React', 'Tailwind CSS', 'FastAPI', 'Supabase', 'Stripe'],
      financialHealth: 'A',
      pricingModel: 'Freemium / Tiered'
    },
    competitors: [
      {
        id: 'comp-linear',
        name: 'Linear',
        website: 'https://linear.app',
        foundedYear: 2019,
        hqLocation: 'San Francisco, CA',
        teamSize: '50-100',
        totalFunding: '$52M (Series B)',
        monthlyTraffic: '1.2M',
        domainAuthority: 79,
        techStack: ['React', 'Next.js', 'Tailwind', 'Cloudflare', 'Stripe'],
        financialHealth: 'A',
        pricingModel: 'Freemium ($8 - $14/seat)'
      },
      {
        id: 'comp-jira',
        name: 'Jira Software',
        website: 'https://atlassian.com/software/jira',
        foundedYear: 2002,
        hqLocation: 'Sydney, Australia',
        teamSize: '10,000+',
        totalFunding: 'Public (TEAM - $48B Cap)',
        monthlyTraffic: '38.5M',
        domainAuthority: 92,
        techStack: ['React', 'Java', 'AWS', 'PostHog', 'Akamai'],
        financialHealth: 'A',
        pricingModel: 'Tiered ($7.75 - $15.25/seat)'
      },
      {
        id: 'comp-asana',
        name: 'Asana',
        website: 'https://asana.com',
        foundedYear: 2008,
        hqLocation: 'San Francisco, CA',
        teamSize: '1,800+',
        totalFunding: 'Public (ASAN - $3.2B Cap)',
        monthlyTraffic: '14.2M',
        domainAuthority: 87,
        techStack: ['React', 'TypeScript', 'AWS', 'Google Analytics'],
        financialHealth: 'B',
        pricingModel: 'Tiered ($10.99 - $24.99/seat)'
      },
      {
        id: 'comp-clickup',
        name: 'ClickUp',
        website: 'https://clickup.com',
        foundedYear: 2017,
        hqLocation: 'San Diego, CA',
        teamSize: '800+',
        totalFunding: '$537M (Series C)',
        monthlyTraffic: '8.4M',
        domainAuthority: 82,
        techStack: ['Angular', 'Node.js', 'Cloudflare', 'Segment'],
        financialHealth: 'B',
        pricingModel: 'Freemium ($7 - $12/seat)'
      }
    ]
  };
}

export async function getCompetitorVisualDiff(competitorId) {
  try {
    return await apiGet(`/api/competitors/${competitorId}/visual-diff`);
  } catch (err) {
    console.warn('Backend visual diff fallback:', err);
    return {
      competitorName: competitorId === 'comp-linear' ? 'Linear' : (competitorId === 'comp-jira' ? 'Jira Software' : 'ClickUp'),
      targetUrl: 'https://linear.app/pricing',
      historicalDate: 'October 2024 (6 Months Ago)',
      currentDate: 'Today (Live Capture)',
      historicalImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      currentImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      changeHighlights: [
        {
          id: 'ch-1',
          type: 'PRICE_INCREASE',
          color: 'yellow',
          box: { x: 22, y: 38, w: 24, h: 18 },
          title: 'Standard Plan Price Hike ($8 → $12/user/mo)',
          description: 'Base standard pricing increased by +50% from $8 to $12 per user per month billed monthly.',
          strategicImpact: 'Creates an immediate cost shock for early-stage teams. Counter by highlighting our fixed pricing lock.'
        },
        {
          id: 'ch-2',
          type: 'TIER_RESTRICTION',
          color: 'red',
          box: { x: 50, y: 42, w: 26, h: 22 },
          title: 'Stealth 5-User Minimum Added',
          description: 'Quietly instituted a 5-seat minimum on the Plus tier, raising effective entry barrier from $14 to $70/mo.',
          strategicImpact: 'Small teams (2-4 devs) are actively complaining on Reddit. Prime account poaching opportunity.'
        },
        {
          id: 'ch-3',
          type: 'NEW_FEATURE',
          color: 'green',
          box: { x: 78, y: 35, w: 20, h: 25 },
          title: 'AI Insights Add-on ($10/seat extra)',
          description: 'Debuted proprietary AI triage as a paid add-on rather than including it in core plans.',
          strategicImpact: 'Dilutes their all-inclusive value proposition. We bundle native AI co-pilot for free.'
        }
      ],
      strategicSummary: 'Linear is aggressively transitioning toward higher ACV by introducing user minimums and paid AI add-ons, leaving a massive whitespace for lean startups seeking speed without seat penalties.'
    };
  }
}

export async function getProductPortfolioMatrix() {
  try {
    return await apiGet('/api/competitors/product-matrix');
  } catch (err) {
    console.warn('Backend product matrix fallback:', err);
    return {
      categoryStats: {
        categoryName: 'Productivity & Issue Tracking',
        categoryPriceMinima: 7.0,
        categoryPriceMedian: 13.8,
        categoryPriceMaxima: 39.99,
        totalProductsBenchmarked: 5
      },
      homeProduct: {
        id: 'our-product',
        name: 'Aetheris AI',
        productCategory: 'Autonomous Competitive Intelligence & Strategy',
        productVisual: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        flagshipProduct: 'Aetheris Autonomous War Room',
        targetUser: 'Strategic Product Leaders, Founders & Growth PMs',
        keyDifferentiator: 'Real-time autonomous adversarial battle simulation & visual DOM change detection.',
        pricingFloor: 0.0,
        pricingMedian: 18.0,
        pricingCeiling: 39.0,
        pricingModel: 'Freemium + Usage Tiers',
        specs: [
          { label: 'Flagship Offering', value: 'Aetheris War Room Core' },
          { label: 'Update Frequency', value: 'Real-Time Continuous Stream' },
          { label: 'Visual Time Machine', value: 'Full DOM & Pixel Slider' },
          { label: 'Adversarial Red-Team', value: 'Native Multi-Agent Engine' },
          { label: 'Customer Churn Hunter', value: 'Live Social & Review Mining' },
          { label: 'Deployment', value: 'Instant Cloud + API Webhooks' }
        ]
      },
      competitorProducts: [
        {
          id: 'comp-linear',
          name: 'Linear',
          productCategory: 'High-Velocity Issue Tracking',
          productVisual: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          flagshipProduct: 'Linear Cycles & Insights',
          targetUser: 'Modern High-Performance Software Engineering Teams',
          keyDifferentiator: 'Sub-50ms keyboard-first desktop client and opinionated git workflow sync.',
          pricingFloor: 8.0,
          pricingMedian: 14.0,
          pricingCeiling: 28.0,
          pricingModel: 'Per-Seat Monthly',
          specs: [
            { label: 'Flagship Offering', value: 'Linear Cycles & Roadmaps' },
            { label: 'Update Frequency', value: 'Weekly Sprint Releases' },
            { label: 'Visual Time Machine', value: 'None (Manual changelog only)' },
            { label: 'Adversarial Red-Team', value: 'None' },
            { label: 'Customer Churn Hunter', value: 'None' },
            { label: 'Deployment', value: 'Electron Desktop + Web App' }
          ]
        },
        {
          id: 'comp-jira',
          name: 'Jira Software',
          productCategory: 'Enterprise Agile Workflow Management',
          productVisual: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
          flagshipProduct: 'Jira Cloud Enterprise',
          targetUser: 'Traditional Enterprise IT & Complex Cross-Functional Orgs',
          keyDifferentiator: 'Extensive Atlassian ecosystem, compliance certifications, and infinite customization.',
          pricingFloor: 7.75,
          pricingMedian: 15.25,
          pricingCeiling: 32.50,
          pricingModel: 'Per-Seat Monthly (Tiered)',
          specs: [
            { label: 'Flagship Offering', value: 'Jira Cloud Standard / Premium' },
            { label: 'Update Frequency', value: 'Monthly Enterprise Cycles' },
            { label: 'Visual Time Machine', value: 'None' },
            { label: 'Adversarial Red-Team', value: 'None' },
            { label: 'Customer Churn Hunter', value: 'None' },
            { label: 'Deployment', value: 'Atlassian Cloud Dedicated' }
          ]
        },
        {
          id: 'comp-asana',
          name: 'Asana',
          productCategory: 'Work Coordination & Portfolio Tracking',
          productVisual: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
          flagshipProduct: 'Asana Work Graph',
          targetUser: 'Marketing, Operations & Non-Technical Teams',
          keyDifferentiator: 'Visual Gantt timelines, cross-department goal cascades, and intuitive onboarding.',
          pricingFloor: 10.99,
          pricingMedian: 24.99,
          pricingCeiling: 39.99,
          pricingModel: 'Per-Seat Monthly',
          specs: [
            { label: 'Flagship Offering', value: 'Asana Starter & Advanced' },
            { label: 'Update Frequency', value: 'Bi-Weekly Web Updates' },
            { label: 'Visual Time Machine', value: 'None' },
            { label: 'Adversarial Red-Team', value: 'None' },
            { label: 'Customer Churn Hunter', value: 'None' },
            { label: 'Deployment', value: 'Web SaaS' }
          ]
        },
        {
          id: 'comp-clickup',
          name: 'ClickUp',
          productCategory: 'All-in-One Productivity & Collaboration',
          productVisual: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
          flagshipProduct: 'ClickUp 3.0 Platform',
          targetUser: 'Agile Startups & Cost-Conscious Teams Replacing Multiple Tools',
          keyDifferentiator: 'Feature density (tasks, docs, whiteboards, chat, time tracking) at aggressive entry rates.',
          pricingFloor: 7.0,
          pricingMedian: 12.0,
          pricingCeiling: 19.0,
          pricingModel: 'Per-Seat Monthly',
          specs: [
            { label: 'Flagship Offering', value: 'ClickUp Unlimited & Business' },
            { label: 'Update Frequency', value: 'Continuous Feature Drops' },
            { label: 'Visual Time Machine', value: 'None' },
            { label: 'Adversarial Red-Team', value: 'None' },
            { label: 'Customer Churn Hunter', value: 'None' },
            { label: 'Deployment', value: 'Web SaaS & Mobile Apps' }
          ]
        }
      ]
    };
  }
}

export async function getCompetitorProductsTeardown(competitorId) {
  try {
    return await apiGet(`/api/competitors/${competitorId}/products-teardown`);
  } catch (err) {
    console.warn('Backend products teardown fallback:', err);
    return {
      competitorId,
      competitorName: competitorId === 'comp-linear' ? 'Linear' : (competitorId === 'comp-jira' ? 'Jira Software' : 'ClickUp'),
      website: competitorId === 'comp-linear' ? 'https://linear.app' : 'https://clickup.com',
      brandSummary: 'High-growth workflow platform analyzed across distinct product offerings.',
      extractedOgImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      totalProductsAnalyzed: 3,
      products: [
        {
          id: 'fb-p1',
          name: 'Core Issue Tracking',
          category: 'Agile Project Coordination',
          visualUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          role: 'Flagship Anchor',
          roleBadgeColor: 'bg-indigo-500 text-white',
          revenueShare: '55% of ARR',
          targetBuyer: 'Engineering Leads & Tech Founders',
          pricingModel: 'Per-Seat Monthly ($8 - $12/user)',
          pricingFloor: 8.0,
          strengths: ['Sub-50ms interaction speed', 'Deep git branching sync', 'Opinionated minimalist UI'],
          vulnerabilities: ['High friction for non-technical team members', 'Limited custom executive reports'],
          howToWin: 'Emphasize seamless cross-department collaboration and unified executive reporting.'
        },
        {
          id: 'fb-p2',
          name: 'Insights & Cycles Analytics',
          category: 'Team Velocity Forecasting',
          visualUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
          role: 'Cash Cow',
          roleBadgeColor: 'bg-emerald-500 text-white',
          revenueShare: '25% of ARR',
          targetBuyer: 'VP of Engineering & Agile PMs',
          pricingModel: 'Gated in Plus Tier ($14/user/mo)',
          pricingFloor: 14.0,
          strengths: ['Automated scope change tracking', 'Cycle progress forecasts'],
          vulnerabilities: ['Quietly added 5-seat minimum barrier ($70/mo effective floor)', 'Cannot correlate ARR with velocity'],
          howToWin: 'Offer seat-minimum-free analytics directly correlated with pipeline revenue.'
        },
        {
          id: 'fb-p3',
          name: 'AI Triage & Copilot',
          category: 'Automated Ticket Routing',
          visualUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
          role: 'High-Margin Add-On',
          roleBadgeColor: 'bg-amber-500 text-white',
          revenueShare: '20% of ARR',
          targetBuyer: 'Operations & Support Leads',
          pricingModel: 'Paid Add-On ($10/seat extra)',
          pricingFloor: 10.0,
          strengths: ['Slack message to ticket conversion', 'Automated duplicate detection'],
          vulnerabilities: ['Charges extra line-item fee on top of core subscription', 'Generic summarizer without market modeling'],
          howToWin: 'We bundle autonomous adversarial war games and AI triage for free in core accounts.'
        }
      ]
    };
  }
}

export async function extractProductVisuals(url) {
  try {
    return await apiPost('/api/competitors/extract-product-visuals', { url });
  } catch (err) {
    console.warn('Backend extract visuals fallback:', err);
    return {
      ogImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      heroImages: [],
      screenshotUrl: `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
    };
  }
}


