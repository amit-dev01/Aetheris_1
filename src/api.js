import { supabase } from './lib/supabase';

const getApiBaseUrl = () => {
  const envUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    (import.meta.env && import.meta.env.NEXT_PUBLIC_API_BASE_URL) ||
    (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
    'https://ai-backend-zfq1.onrender.com';
  return envUrl.replace(/\/$/, '');
};

export async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      return data.session.access_token;
    }
  } catch (err) {
    console.warn('Unable to retrieve token from Supabase session:', err);
  }

  const localToken = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (localToken) {
    return localToken;
  }

  if (typeof window !== 'undefined') {
    window.location.href = '/login/';
  }
  throw new Error('No active session found. Redirecting to login.');
}

const buildUrl = (endpoint) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export async function apiGet(endpoint) {
  const token = await getAccessToken();
  const url = buildUrl(endpoint);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('access_token');
    if (typeof window !== 'undefined') window.location.href = '/login/';
    throw new Error('Unauthorized');
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

export async function apiPost(endpoint, body) {
  const token = await getAccessToken();
  const url = buildUrl(endpoint);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('access_token');
    if (typeof window !== 'undefined') window.location.href = '/login/';
    throw new Error('Unauthorized');
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

export async function apiPut(endpoint, body) {
  const token = await getAccessToken();
  const url = buildUrl(endpoint);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('access_token');
    if (typeof window !== 'undefined') window.location.href = '/login/';
    throw new Error('Unauthorized');
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
