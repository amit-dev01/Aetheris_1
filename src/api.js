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
    return localStorage.getItem('access_token');
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
  const token = getStoredToken();
  if (token) {
    return token;
  }
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login/';
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
    throw new Error(errorMessage);
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
    throw new Error(errorMessage);
  }

  return await res.json();
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
  return await apiGet('/api/company/profile');
}

export async function submitCompanyProfile(payload) {
  return await apiPost('/api/company/profile', payload);
}

export async function getSetupStatus() {
  return await apiGet('/api/company/setup-status');
}

// ── Competitors Intelligence Endpoints ──

export async function getCompetitors() {
  return await apiGet('/api/competitors');
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

// ── Phase 2: Intelligence & Strategy Endpoints ──

/**
 * GET /api/intelligence/stats
 */
export async function getIntelligenceStats() {
  return await apiGet('/api/intelligence/stats');
}

/**
 * POST /api/intelligence/trigger-monitoring
 */
export async function triggerMonitoring() {
  return await apiPost('/api/intelligence/trigger-monitoring', {});
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
  return await apiGet('/api/intelligence/summary');
}
