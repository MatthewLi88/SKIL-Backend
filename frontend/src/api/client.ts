/**
 * API client for communicating with the Django backend.
 * Handles authentication tokens and request/response formatting.
 */

// Use environment variable in production, fallback to /api for local dev (proxied by Vite)
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Get tokens from localStorage
export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

// Save tokens to localStorage
export const setTokens = (access: string, refresh: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

// Clear tokens (logout)
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Refresh the access token
async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
    if (data.refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
    }
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

// Generic fetch wrapper with auth
interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add auth header if we have a token and auth isn't skipped
  if (!skipAuth) {
    let token = getAccessToken();

    // If no token, try to refresh
    if (!token) {
      token = await refreshAccessToken();
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 - try to refresh token and retry
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({}));
        if (error.detail) throw new Error(error.detail);
        if (error.error) throw new Error(error.error);
        const fieldErrors = Object.entries(error)
          .map(([, msgs]) => (Array.isArray(msgs) ? msgs.join(', ') : String(msgs)))
          .join('. ');
        throw new Error(fieldErrors || 'Request failed');
      }
      return retryResponse.json();
    }
    // Refresh failed, redirect to login
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (error.detail) throw new Error(error.detail);
    if (error.error) throw new Error(error.error);
    // Handle DRF validation errors (e.g. {"username": ["Already exists."]})
    const fieldErrors = Object.entries(error)
      .map(([, msgs]) => (Array.isArray(msgs) ? msgs.join(', ') : String(msgs)))
      .join('. ');
    throw new Error(fieldErrors || 'Request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
