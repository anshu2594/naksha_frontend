const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
const SESSION_STORAGE_KEY = 'naksha_auth_session_v1';
const GUEST_ID_STORAGE_KEY = 'naksha_guest_id_v1';

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export function getStoredSession() {
  try {
    const value = localStorage.getItem(SESSION_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Failed to read the saved session', error);
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function formatErrorDetail(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => {
      const location = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : '';
      return `${location ? `${location}: ` : ''}${item.msg || 'Invalid value'}`;
    }).join(' ');
  }
  if (detail && typeof detail === 'object') return detail.message || 'The request was rejected.';
  return 'The request could not be completed.';
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const detail = data?.detail ?? data;
    throw new ApiError(formatErrorDetail(detail), response.status, detail);
  }

  return data;
}

let refreshPromise;
let guestIdPromise;

async function ensureGuestId() {
  let storedGuestId;
  try {
    storedGuestId = localStorage.getItem(GUEST_ID_STORAGE_KEY);
  } catch (error) {
    throw new ApiError('Browser storage is unavailable for this shopping session.', 0, error);
  }
  if (storedGuestId) return storedGuestId;

  if (!guestIdPromise) {
    guestIdPromise = fetch(`${API_BASE_URL}/session/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then(parseResponse)
      .then((session) => {
        if (typeof session?.guestId !== 'string' || !session.guestId) {
          throw new ApiError('The API returned an invalid guest session.', 502, session);
        }
        localStorage.setItem(GUEST_ID_STORAGE_KEY, session.guestId);
        return session.guestId;
      })
      .catch((error) => {
        throw error.status === undefined
          ? new ApiError('Unable to create a guest session. Please try again.', 0, error)
          : error;
      })
      .finally(() => {
        guestIdPromise = null;
      });
  }

  return guestIdPromise;
}

async function refreshSession() {
  const session = getStoredSession();
  if (!session?.refresh_token) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: session.refresh_token }),
    })
      .then(parseResponse)
      .then((tokens) => {
        const nextSession = {
          ...tokens,
          access_token: tokens.access || tokens.access_token,
          refresh_token: tokens.refresh || tokens.refresh_token || session.refresh_token,
          user: tokens.user || session.user,
        };
        saveSession(nextSession);
        return nextSession;
      })
      .catch((error) => {
        if (error.status === 401 || error.status === 403) {
          clearSession();
          window.dispatchEvent(new Event('naksha:session-expired'));
        }
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function request(path, {
  method = 'GET',
  body,
  params,
  signal,
  headers: customHeaders,
  guest = false,
  skipAuth = false,
  retryAuth = true,
} = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const session = skipAuth ? null : getStoredSession();
  const headers = new Headers(customHeaders);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData) headers.set('Content-Type', 'application/json');
  if (guest) headers.set('X-Guest-ID', await ensureGuestId());
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Unable to reach the Naksha API. Check your connection and API server.', 0, error);
  }

  if (response.status === 401 && retryAuth && !skipAuth && session?.refresh_token) {
    const refreshed = await refreshSession();
    if (refreshed?.access_token) {
      return request(path, { method, body, params, signal, headers: customHeaders, guest, retryAuth: false });
    }
  }

  return parseResponse(response);
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
