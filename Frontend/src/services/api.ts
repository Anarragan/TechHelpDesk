import axios from 'axios';

const API_URL = 'https://techhelpdesk-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

// Tickets API
export const ticketsAPI = {
  getAll: () =>
    api.get('/tickets'),
  
  getById: (id: number) =>
    api.get(`/tickets/${id}`),
  
  create: (data: any) =>
    api.post('/tickets', data),
  
  update: (id: number, data: any) =>
    api.patch(`/tickets/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/tickets/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () =>
    api.get('/categories'),
  
  create: (data: { name: string; description: string }) =>
    api.post('/categories', data),
};

// Users API
export const usersAPI = {
  getAll: () =>
    api.get('/users'),
};

export default api;
