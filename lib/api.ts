/**
 * API Client
 * 
 * Centralized API client for making requests to the backend
 */

// Use relative paths for API calls (works in Next.js)
const API_BASE_URL = '';

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Set authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

/**
 * Get user data from localStorage
 */
export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Set user data in localStorage
 */
export function setUser(user: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Remove user data from localStorage
 */
export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
}

/**
 * Make an API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // Normalize any headers provided in options into a simple string map
  if (options.headers) {
    const h = options.headers as HeadersInit;
    if (h instanceof Headers) {
      h.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(h)) {
      for (const [key, value] of h) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, h as Record<string, string>);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await apiRequest<{ success: boolean; data: { user: any; token: string } }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    return data;
  },

  register: async (name: string, email: string, password: string, role: 'admin' | 'teacher') => {
    const data = await apiRequest<{ success: boolean; data: { user: any; token: string } }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      }
    );
    return data;
  },

  getMe: async () => {
    const data = await apiRequest<{ success: boolean; data: { user: any } }>(
      '/api/auth/me'
    );
    return data;
  },
};

// Tasks API
export const tasksApi = {
  getAll: async () => {
    const data = await apiRequest<{ success: boolean; data: { tasks: any[] } }>(
      '/api/tasks'
    );
    return data;
  },

  getById: async (id: number) => {
    const data = await apiRequest<{ success: boolean; data: { task: any } }>(
      `/api/tasks/${id}`
    );
    return data;
  },

  create: async (task: { title: string; description?: string; assignedTo?: number }) => {
    const data = await apiRequest<{ success: boolean; data: { task: any } }>(
      '/api/tasks',
      {
        method: 'POST',
        body: JSON.stringify(task),
      }
    );
    return data;
  },

  update: async (id: number, task: { title?: string; description?: string; status?: string; assignedTo?: number }) => {
    const data = await apiRequest<{ success: boolean; data: { task: any } }>(
      `/api/tasks/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(task),
      }
    );
    return data;
  },

  delete: async (id: number) => {
    const data = await apiRequest<{ success: boolean }>(
      `/api/tasks/${id}`,
      {
        method: 'DELETE',
      }
    );
    return data;
  },

  accept: async (id: number) => {
    const data = await apiRequest<{ success: boolean; data: { task: any } }>(
      `/api/tasks/${id}/accept`,
      {
        method: 'POST',
      }
    );
    return data;
  },

  approve: async (id: number, approval: 'approved' | 'rejected') => {
    const data = await apiRequest<{ success: boolean; data: { task: any } }>(
      `/api/tasks/${id}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ approval }),
      }
    );
    return data;
  },
};

// Teachers API
export const teachersApi = {
  getAll: async () => {
    const data = await apiRequest<{ success: boolean; data: { teachers: any[] } }>(
      '/api/teachers'
    );
    return data;
  },
};

// Time Logs API
export const timeLogsApi = {
  getAll: async (filters?: { teacherId?: number; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.teacherId) params.append('teacherId', filters.teacherId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const query = params.toString();
    const endpoint = `/api/time-logs${query ? `?${query}` : ''}`;
    
    const data = await apiRequest<{ success: boolean; data: { timeLogs: any[] } }>(
      endpoint
    );
    return data;
  },

  start: async (taskId: number) => {
    const data = await apiRequest<{ success: boolean; data: { timeLog: any } }>(
      '/api/time-logs/start',
      {
        method: 'POST',
        body: JSON.stringify({ taskId }),
      }
    );
    return data;
  },

  stop: async () => {
    const data = await apiRequest<{ success: boolean; data: { timeLog: any } }>(
      '/api/time-logs/stop',
      {
        method: 'POST',
      }
    );
    return data;
  },

  getActive: async () => {
    const data = await apiRequest<{ success: boolean; data: { activeTimer: any } }>(
      '/api/time-logs/active'
    );
    return data;
  },
};

