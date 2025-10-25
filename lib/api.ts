import axios from 'axios';
import type {
  Complaint,
  MetricsData,
  ComplaintFilters,
  PaginationParams,
  ApiResponse,
} from '@/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/authority/login';
    }
    return Promise.reject(error);
  }
);

// Public API endpoints
export const publicApi = {
  // Get metrics for landing page
  getMetrics: (): Promise<MetricsData> =>
    api.get('/metrics').then(res => res.data),

  // Get complaints with filters
  getComplaints: (filters?: ComplaintFilters & PaginationParams): Promise<{
    items: Complaint[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> =>
    api.get('/complaints', { params: filters }).then(res => res.data),

  // Get single complaint details
  getComplaint: (id: string): Promise<Complaint> =>
    api.get(`/complaints/${id}`).then(res => res.data),

  // Create new complaint
  createComplaint: (formData: FormData): Promise<{
    status: string;
    complaint_id?: string;
    suggested?: any[];
    message?: string;
  }> =>
    api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),

  // Append no-progress update to existing complaint
  appendNoProgress: (id: string, formData: FormData): Promise<{
    status: string;
    complaint_id: string;
  }> =>
    api.post(`/complaints/${id}/no-progress`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),
};

// Authority API endpoints
export const authorityApi = {
  // Login
  login: (email: string, password: string): Promise<{
    token: string;
    user: {
      email: string;
      name: string;
      role: string;
      state?: string;
      city?: string;
    };
  }> =>
    api.post('/authority/login', { email, password }).then(res => res.data),

  // Get complaints for authority (with auth)
  getComplaints: (filters?: ComplaintFilters & PaginationParams): Promise<{
    items: Complaint[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> =>
    api.get('/authority/complaints', { params: filters }).then(res => res.data),

  // Get single complaint details (authority view)
  getComplaint: (id: string): Promise<Complaint> =>
    api.get(`/authority/complaints/${id}`).then(res => res.data),

  // Authority actions
  startProgress: (id: string, note?: string): Promise<Complaint> =>
    api.post(`/authority/complaints/${id}/start-progress`, { note }).then(res => res.data),

  updateProgress: (id: string, note?: string): Promise<Complaint> =>
    api.post(`/authority/complaints/${id}/progress`, { note }).then(res => res.data),

  putOnHold: (id: string, reason: string, expected_resume_at: string): Promise<Complaint> =>
    api.post(`/authority/complaints/${id}/hold`, { reason, expected_resume_at }).then(res => res.data),

  resolve: (id: string, note?: string): Promise<Complaint> =>
    api.post(`/authority/complaints/${id}/resolve`, { note }).then(res => res.data),

  mergeComplaints: (sourceId: string, targetId: string, note?: string): Promise<Complaint> =>
    api.post(`/authority/complaints/${sourceId}/merge`, { target_id: targetId, note }).then(res => res.data),
};

// Auth utilities
export const auth = {
  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  removeToken: () => {
    localStorage.removeItem('authToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};

export default api;
