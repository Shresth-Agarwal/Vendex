import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Endpoints that don't need auth
    const noAuthEndpoints = ['/login', '/register'];
    const isNoAuthEndpoint = noAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isNoAuthEndpoint) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized or 403 Forbidden globally
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('auth_token');
        // Redirect to login if needed (or let the PrivateRoute handle it)
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('No response from server:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
