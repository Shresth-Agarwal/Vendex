import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Unable to reach the backend service.';

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-error', { detail: { message } }));
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: (payload: { email: string; password: string }) => api.post('/auth/login', payload),
  register: (payload: { email: string; password: string; username: string; role: string }) =>
    api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
};

export const catalogService = {
  listProducts: () => api.get('/catalog/products'),
  listManufacturers: () => api.get('/catalog/manufacturers'),
  listInventory: () => api.get('/catalog/inventory'),
};

export const operationsService = {
  listOrders: () => api.get('/operations/orders'),
  listStaff: () => api.get('/operations/staff'),
  listShifts: () => api.get('/operations/shifts'),
};

export const messagingService = {
  listThreads: () => api.get('/messages/threads'),
  sendMessage: (threadId: string, message: string) => api.post(`/messages/threads/${threadId}`, { message }),
};

export default api;
