// REST API Client communicating with Express backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiFetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers = {}, ...rest } = options;

  let authToken = token;
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }

  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (authToken) {
    reqHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  if (!(rest.body instanceof FormData) && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const res = await fetch(url, {
    ...rest,
    headers: reqHeaders,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }

  return json;
}

export const api = {
  get: <T = any>(endpoint: string, token?: string) => apiFetch<T>(endpoint, { method: 'GET', token }),
  post: <T = any>(endpoint: string, body?: any, token?: string) => 
    apiFetch<T>(endpoint, { 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body),
      token 
    }),
  put: <T = any>(endpoint: string, body?: any, token?: string) => 
    apiFetch<T>(endpoint, { 
      method: 'PUT', 
      body: body instanceof FormData ? body : JSON.stringify(body),
      token 
    }),
  delete: <T = any>(endpoint: string, token?: string) => apiFetch<T>(endpoint, { method: 'DELETE', token }),
};
