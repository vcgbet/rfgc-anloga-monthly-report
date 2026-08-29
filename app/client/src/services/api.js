import { io } from 'socket.io-client';

const API_BASE = window.location.origin.includes('5173') 
  ? 'http://localhost:3000' 
  : window.location.origin;

export const socket = io(API_BASE, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

async function request(endpoint, options = {}) {
  const url = `${API_BASE}/api${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  changePassword: (userId, newPassword) => request('/auth/change-password', { method: 'POST', body: { userId, newPassword } }),

  // Branches
  getBranches: () => request('/branches'),
  createBranch: (data) => request('/branches', { method: 'POST', body: data }),
  updateBranch: (id, data) => request(`/branches/${id}`, { method: 'PUT', body: data }),
  deleteBranch: (id) => request(`/branches/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request('/users'),
  createUser: (data) => request('/users', { method: 'POST', body: data }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: data }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  generateLogins: () => request('/users/generate-logins', { method: 'POST' }),

  // Reports
  getReports: (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.branchId) query.append('branchId', filters.branchId);
    if (filters.status) query.append('status', filters.status);
    if (filters.month) query.append('month', filters.month);
    if (filters.year) query.append('year', filters.year);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/reports${queryString}`);
  },
  getReportById: (id) => request(`/reports/${id}`),
  createReport: (data, user) => request('/reports', { method: 'POST', body: { ...data, _user: user } }),
  updateReport: (id, data, user) => request(`/reports/${id}`, { method: 'PUT', body: { ...data, _user: user } }),
  deleteReport: (id) => request(`/reports/${id}`, { method: 'DELETE' }),
  submitReportToPastor: (id, data, user) => request(`/reports/${id}/submit-to-pastor`, { method: 'POST', body: { ...data, _user: user } }),
  endorseReport: (id, data, user) => request(`/reports/${id}/endorse`, { method: 'POST', body: { ...data, _user: user } }),

  // AI Analytics
  getBranchAnalytics: (branchIdentifier) => request(`/analytics/branch/${encodeURIComponent(branchIdentifier)}`),
  getDistrictAnalytics: () => request('/analytics/district'),

  // System
  resetDb: () => request('/system/reset', { method: 'POST' }),
};
