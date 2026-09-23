// Configurable base URL: default to /api for same-origin proxy in development
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
}

export async function initCsrf() {
  try {
    const csrfEndpoint = API_BASE_URL.startsWith('http') 
      ? `${new URL(API_BASE_URL).origin}/sanctum/csrf-cookie` 
      : '/sanctum/csrf-cookie';
    await fetch(csrfEndpoint, { credentials: 'include' });
  } catch (e) {
    // Non-fatal
  }
}

async function request(path, options = {}) {
  // Ensure path starts with /
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Prevent double /api prefix if path already starts with /api
  let url;
  if (API_BASE_URL.endsWith('/api') && cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4);
  }
  url = `${API_BASE_URL}${cleanPath}`;

  const token = localStorage.getItem('task_tutorials_token');

  const headers = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Add CSRF token if cookie exists
  const xsrf = getCookie('XSRF-TOKEN');
  if (xsrf) {
    headers['X-XSRF-TOKEN'] = xsrf;
  }

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Crucial for session cookies
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return { success: true, status: 204, data: null };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      // If 401 unauthenticated, warn except for /me or /login
      if (response.status === 401 && !cleanPath.includes('login') && !cleanPath.includes('me')) {
        console.warn('Session expired or unauthorized for:', cleanPath);
      }

      return {
        success: false,
        status: response.status,
        message: data?.message || data?.error || `Request failed with status ${response.status}`,
        errors: data?.errors || null,
        data: data?.data || data || null,
      };
    }

    return {
      success: true,
      status: response.status,
      message: data?.message,
      data: data?.data !== undefined ? data.data : data,
      ...data,
    };
  } catch (error) {
    console.error('API Network Failure:', error);
    return {
      success: false,
      status: 0,
      message: `Network error: Backend server unreachable. Check if php artisan serve is running.`,
      error,
    };
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => 
    request(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (path, body, options) =>
    request(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export default api;
