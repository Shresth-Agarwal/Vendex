import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Skip adding auth token for authentication endpoints that don't require it
    const noAuthEndpoints = ['/login', '/register', '/refreshToken'];
    const isNoAuthEndpoint = noAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isNoAuthEndpoint) {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('auth_token') || Cookies.get('auth_token') || (() => {
            const c = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
            return c ? c.split('=')[1] : null;
          })()
        : null;

      // Only send if token looks like a JWT (three parts)
      if (token && typeof token === 'string' && token.split('.').length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (token) {
        // malformed token: clear stored value to avoid server errors
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            Cookies.remove('auth_token');
          }
        } catch (e) {}
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      const msg = 'Request timeout. Please check if the backend is running.';
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-error', { detail: { message: msg } }));
      }
      throw new Error(msg);
    } else if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      const originalRequest = error.config;
      // Try refresh on 401 once
      if (error.response.status === 401 && !originalRequest?._retry) {
        try {
          const refreshToken = typeof window !== 'undefined'
            ? (localStorage.getItem('refresh_token') || Cookies.get('refresh_token'))
            : null;

          if (refreshToken) {
            originalRequest._retry = true;
            // call refresh endpoint directly using axios to avoid interceptor loop
            const resp = await axios.post(`${API_BASE_URL}/refreshToken`, { token: refreshToken });
            const newToken = resp.data?.token || resp.data?.accessToken;
            const newRefresh = resp.data?.refreshToken || resp.data?.refresh_token || null;
            if (newToken) {
              // update storage
              localStorage.setItem('auth_token', newToken);
              if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
              if (typeof window !== 'undefined') {
                Cookies.set('auth_token', newToken, { expires: 7 });
                if (newRefresh) Cookies.set('refresh_token', newRefresh, { expires: 30 });
              }
              // set header and retry
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          }
        } catch (refreshErr) {
          console.warn('Token refresh failed:', refreshErr);
          // fall through to broadcast error and clear tokens
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              Cookies.remove('auth_token');
              Cookies.remove('refresh_token');
            }
          } catch (e) {}
        }
      }
      // Don't force redirects - let the backend handle authentication
      if (error.response.status === 401 || error.response.status === 403) {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            const protectedPaths = ['/admin', '/user'];
            const isProtectedPath = protectedPaths.some(path => error.config?.url?.includes(path));
            if (isProtectedPath) {
              localStorage.removeItem('auth_token');
            }
          }
        }
      }
      // Broadcast error message to UI
      try {
        const msg = error.response?.data?.message || error.message || `API error ${error.response.status}`;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app-error', { detail: { message: msg } }));
        }
      } catch (e) {
        // ignore dispatch errors
      }
      throw error;
    } else if (error.request) {
      console.error('No response from server:', error.request);
      const msg = 'Cannot connect to server. Please ensure the backend is running.';
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-error', { detail: { message: msg } }));
      }
      throw new Error(msg);
    } else {
      console.error('Error:', error.message);
      try {
        const msg = error.message || 'An unknown error occurred';
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app-error', { detail: { message: msg } }));
        }
      } catch (e) {}
      throw error;
    }
  }
);

// ==================== AUTH API ====================
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  register: async (data: { email: string; username: string; password: string; role: string }) => {
    const response = await api.post('/register', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  refreshToken: async (token: string) => {
    const response = await api.post('/refreshToken', { token });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/user/me');
    return response.data;
  },

  deleteCurrentUser: async () => {
    const response = await api.delete('/user/me');
    return response.data;
  },
};

// ==================== USER PROFILE API ====================
export const userApi = {
  getProfile: async () => {
    const response = await api.get('/user/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    // Note: Update profile endpoint may need to be added to backend
    const response = await api.put('/user/me', data);
    return response.data;
  },

  deleteProfile: async () => {
    const response = await api.delete('/user/me');
    return response.data;
  },
};

// ==================== ADMIN API ====================
export const adminApi = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (userId: number, role: string) => {
    const response = await api.post('/admin/users/roles', { userId, role });
    return response.data;
  },
};

// ==================== PRODUCTS API (CRUD) ====================
export const productsApi = {
  getAll: async () => {
    const response = await api.get('/demo/products');
    return response.data;
  },

  getBySku: async (sku: string) => {
    const response = await api.get(`/demo/products/${sku}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/demo/products', data);
    return response.data;
  },

  update: async (sku: string, data: any) => {
    const response = await api.put(`/demo/products/${sku}`, data);
    return response.data;
  },

  delete: async (sku: string) => {
    const response = await api.delete(`/demo/products/${sku}`);
    return response.data;
  },
};

// ==================== STOCK API (CRUD) ====================
export const stockApi = {
  getAll: async () => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.get('/demo/stock');
      return response.data;
    } catch {
      // Fallback: get all products and fetch stock for each
      return [];
    }
  },

  getBySku: async (sku: string) => {
    const response = await api.get(`/demo/stock/${sku}`);
    return response.data;
  },

  update: async (sku: string, onHand: number) => {
    const response = await api.put(`/demo/stock/${sku}`, { onHand });
    return response.data;
  },
};

// ==================== SALES API (CRUD) ====================
export const salesApi = {
  getAll: async () => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.get('/demo/sales');
      return response.data;
    } catch {
      return [];
    }
  },

  create: async (saleData: any) => {
    const response = await api.post('/demo/sales', saleData);
    return response.data;
  },

  getBySku: async (sku: string) => {
    const response = await api.get(`/demo/sales/${sku}`);
    return response.data;
  },
};

// ==================== STAFF API (CRUD) ====================
export const staffApi = {
  getAll: async () => {
    const response = await api.get('/demo/staff');
    return response.data;
  },

  getById: async (id: number) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.get(`/demo/staff/${id}`);
      return response.data;
    } catch {
      const allStaff = await staffApi.getAll();
      return allStaff.find((s: any) => s.id === id);
    }
  },

  create: async (data: any) => {
    const response = await api.post('/demo/staff', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/demo/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/demo/staff/${id}`);
    return response.data;
  },
};

// ==================== SHIFTS API (CRUD) ====================
export const shiftsApi = {
  getAll: async () => {
    const response = await api.get('/demo/shifts');
    return response.data;
  },

  getById: async (id: number) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.get(`/demo/shifts/${id}`);
      return response.data;
    } catch {
      const allShifts = await shiftsApi.getAll();
      return allShifts.find((s: any) => s.id === id);
    }
  },

  getOpen: async () => {
    const response = await api.get('/demo/shifts/open');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/demo/shifts', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.put(`/demo/shifts/${id}`, data);
      return response.data;
    } catch {
      throw new Error('Update shift endpoint not available');
    }
  },

  delete: async (id: number) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.delete(`/demo/shifts/${id}`);
      return response.data;
    } catch {
      throw new Error('Delete shift endpoint not available');
    }
  },

  assignStaff: async (shiftId: number, staffId: number) => {
    const response = await api.post(`/demo/shifts/${shiftId}/assign/${staffId}`);
    return response.data;
  },

  generateDefault: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await api.post('/demo/shifts/generate-default', null, { params });
    return response.data;
  },
};

// ==================== STAFF AVAILABILITY API (CRUD) ====================
export const staffAvailabilityApi = {
  getAll: async () => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.get('/demo/staff/availability');
      return response.data;
    } catch {
      return [];
    }
  },

  getByStaffId: async (staffId: number) => {
    const response = await api.get(`/demo/staff/availability/${staffId}`);
    return response.data;
  },

  getById: async (id: number) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.get(`/demo/staff/availability/id/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  create: async (data: any) => {
    const response = await api.post('/demo/staff/availability', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.put(`/demo/staff/availability/${id}`, data);
      return response.data;
    } catch {
      throw new Error('Update availability endpoint not available');
    }
  },

  delete: async (id: number) => {
    const response = await api.delete(`/demo/staff/availability/${id}`);
    return response.data;
  },
};

// ==================== ROSTER API (Calls FastAPI) ====================
export const rosterApi = {
  generate: async (date: string) => {
    const response = await api.post('/demo/roster/generate', null, { params: { date } });
    return response.data;
  },
};

// ==================== MANUFACTURERS API (CRUD) ====================
export const manufacturersApi = {
  getAll: async () => {
    const response = await api.get('/demo/admin/manufacturers');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/demo/admin/manufacturers/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/demo/admin/manufacturers', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/demo/admin/manufacturers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/demo/admin/manufacturers/${id}`);
    return response.data;
  },

  // Manufacturer Products (CRUD)
  getProducts: async (manufacturerId: number) => {
    const response = await api.get(`/demo/admin/manufacturers/${manufacturerId}/products`);
    return response.data;
  },

  getProductById: async (manufacturerId: number, productId: number) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.get(`/demo/admin/manufacturers/${manufacturerId}/products/${productId}`);
      return response.data;
    } catch {
      const products = await manufacturersApi.getProducts(manufacturerId);
      return products.find((p: any) => p.id === productId);
    }
  },

  createProduct: async (manufacturerId: number, data: any) => {
    const response = await api.post(`/demo/admin/manufacturers/${manufacturerId}/products`, data);
    return response.data;
  },

  updateProduct: async (manufacturerId: number, productId: number, data: any) => {
    const response = await api.put(`/demo/admin/manufacturers/${manufacturerId}/products/${productId}`, data);
    return response.data;
  },

  deleteProduct: async (manufacturerId: number, productId: number) => {
    const response = await api.delete(`/demo/admin/manufacturers/${manufacturerId}/products/${productId}`);
    return response.data;
  },

  // Manufacturer Ratings (CRUD)
  getRatings: async (manufacturerId: number) => {
    const response = await api.get(`/demo/admin/manufacturers/${manufacturerId}/ratings`);
    return response.data;
  },

  getRatingById: async (manufacturerId: number, ratingId: number) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.get(`/demo/admin/manufacturers/${manufacturerId}/ratings/${ratingId}`);
      return response.data;
    } catch {
      const ratings = await manufacturersApi.getRatings(manufacturerId);
      return ratings.find((r: any) => r.id === ratingId);
    }
  },

  createRating: async (manufacturerId: number, data: any) => {
    const response = await api.post(`/demo/admin/manufacturers/${manufacturerId}/ratings`, data);
    return response.data;
  },

  updateRating: async (manufacturerId: number, ratingId: number, data: any) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.put(`/demo/admin/manufacturers/${manufacturerId}/ratings/${ratingId}`, data);
      return response.data;
    } catch {
      throw new Error('Update rating endpoint not available');
    }
  },

  deleteRating: async (manufacturerId: number, ratingId: number) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.delete(`/demo/admin/manufacturers/${manufacturerId}/ratings/${ratingId}`);
      return response.data;
    } catch {
      throw new Error('Delete rating endpoint not available');
    }
  },

  // Manufacturer Payment Profile (CRUD)
  getPaymentProfile: async (manufacturerId: number) => {
    const response = await api.get(`/demo/admin/manufacturers/${manufacturerId}/payment-profile`);
    return response.data;
  },

  updatePaymentProfile: async (manufacturerId: number, data: any) => {
    const response = await api.put(`/demo/admin/manufacturers/${manufacturerId}/payment-profile`, data);
    return response.data;
  },
};

// ==================== PURCHASE ORDERS API (CRUD) ====================
export const purchaseOrdersApi = {
  getAll: async () => {
    const response = await api.get('/demo/manager/purchase-orders');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/demo/manager/purchase-orders/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.post('/demo/manager/purchase-orders', data);
      return response.data;
    } catch {
      throw new Error('Create purchase order endpoint not available');
    }
  },

  update: async (id: number, data: any) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.put(`/demo/manager/purchase-orders/${id}`, data);
      return response.data;
    } catch {
      throw new Error('Update purchase order endpoint not available');
    }
  },

  delete: async (id: number) => {
    // Note: This endpoint may need to be added to backend
    try {
      const response = await api.delete(`/demo/manager/purchase-orders/${id}`);
      return response.data;
    } catch {
      throw new Error('Delete purchase order endpoint not available');
    }
  },

  approve: async (id: number) => {
    const response = await api.put(`/demo/manager/purchase-orders/${id}/approve`);
    return response.data;
  },

  finalizeManufacturer: async (id: number, manufacturerId: number) => {
    const response = await api.put(`/demo/manager/purchase-orders/${id}/finalize/${manufacturerId}`);
    return response.data;
  },

  markSent: async (id: number) => {
    const response = await api.put(`/demo/manager/purchase-orders/${id}/send`);
    return response.data;
  },

  markReceived: async (id: number) => {
    const response = await api.put(`/demo/manager/purchase-orders/${id}/received`);
    return response.data;
  },
};

// ==================== AI/PURCHASE ORDER AI API (Calls FastAPI) ====================
export const purchaseOrderAiApi = {
  generateReceipt: async (poId: number): Promise<Blob> => {
    const response = await api.post(`/demo/ai/purchase-orders/${poId}/generate-receipt`, null, {
      responseType: 'blob',
    });
    return response.data;
  },

  recommendManufacturer: async (poId: number, preferredPaymentMode: string) => {
    const response = await api.post(
      `/demo/ai/purchase-orders/${poId}/recommend-manufacturer`,
      null,
      { params: { preferredPaymentMode } }
    );
    return response.data;
  },
};

// ==================== INVENTORY AGENT API (Calls FastAPI) ====================
export const inventoryAgentApi = {
  forecastAndDecide: async (sku: string) => {
    const response = await api.post('/agent/inventory/forecast', { sku });
    return response.data;
  },

  bulkForecastAndDecide: async () => {
    const response = await api.get('/agent/inventory/forecast/all');
    return response.data;
  },
};

// ==================== CUSTOMER INTENT API (Calls FastAPI) ====================
export const customerIntentApi = {
  processIntent: async (userInput: string) => {
    const response = await api.post('/demo/ai/customer/process-intent', null, {
      params: { userInput },
    });
    return response.data;
  },
};

// ==================== CHAT API (CRUD) ====================
export const chatApi = {
  getMessages: async (conversationId: string) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId: string, message: string) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, { message });
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  createConversation: async (participantId: number) => {
    const response = await api.post('/chat/conversations', { participantId });
    return response.data;
  },

  deleteConversation: async (conversationId: string) => {
    const response = await api.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  },
};

export default api;
