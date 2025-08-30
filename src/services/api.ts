import axios from 'axios';

// Use environment variable for API URL, fallback to new custom domain
const baseURL = import.meta.env.VITE_API_URL || 'https://campusassist.kginnovate.com/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  me: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
  
  createUser: (userData: any) => api.post('/auth/users', userData),
  
  updateUser: (userId: string, userData: any) =>
    api.put(`/auth/users/${userId}`, userData),
  
  deleteUser: (userId: string) => api.delete(`/auth/users/${userId}`),
  
  getUsers: () => api.get('/auth/users'),
};

// Tickets API
export const ticketsAPI = {
  getTickets: (filters?: any) => api.get('/tickets', { params: filters }),
  
  getTicket: (id: string) => api.get(`/tickets/${id}`),
  
  createTicket: (ticketData: any) => api.post('/tickets', ticketData),
  
  updateTicket: (id: string, ticketData: any) =>
    api.put(`/tickets/${id}`, ticketData),
  
  deleteTicket: (id: string) => api.delete(`/tickets/${id}`),
  
  getDashboardStats: () => api.get('/tickets/stats'),
};

// Notes API
export const notesAPI = {
  getNotes: (ticketId: string) => api.get(`/tickets/${ticketId}/notes`),
  
  createNote: (ticketId: string, noteData: any) =>
    api.post(`/tickets/${ticketId}/notes`, noteData),
  
  updateNote: (ticketId: string, noteId: string, noteData: any) =>
    api.put(`/tickets/${ticketId}/notes/${noteId}`, noteData),
  
  deleteNote: (ticketId: string, noteId: string) =>
    api.delete(`/tickets/${ticketId}/notes/${noteId}`),
};

// Attachments API
export const attachmentsAPI = {
  uploadAttachment: (ticketId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteAttachment: (ticketId: string, attachmentId: string) =>
    api.delete(`/tickets/${ticketId}/attachments/${attachmentId}`),
};

// Users API
export const usersAPI = {
  getUserProfile: () => api.get('/users/profile'),
  
  updateProfile: (profileData: any) => api.put('/users/profile', profileData),
  
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
    api.put('/users/password', passwordData),
  
  uploadAvatar: (formData: FormData) =>
    api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  updateNotificationSettings: (settings: any) =>
    api.put('/users/notifications', settings),
};

// Organizational API (Supreme Admin)
export const organizationalAPI = {
  getEnterpriseStats: () => api.get('/organizational/enterprise-stats'),
  
  getOrganizations: () => api.get('/organizational/organizations'),
  
  createOrganization: (orgData: any) => api.post('/organizational/organizations', orgData),
  
  updateOrganization: (orgId: string, orgData: any) =>
    api.put(`/organizational/organizations/${orgId}`, orgData),
  
  deleteOrganization: (orgId: string) => api.delete(`/organizational/organizations/${orgId}`),
  
  getUsers: () => api.get('/organizational/users'),
  
  createUser: (userData: any) => api.post('/organizational/users', userData),
  
  updateUser: (userId: string, userData: any) =>
    api.put(`/organizational/users/${userId}`, userData),
  
  deleteUser: (userId: string) => api.delete(`/organizational/users/${userId}`),
};
