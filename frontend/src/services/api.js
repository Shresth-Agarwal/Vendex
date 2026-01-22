import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      throw new Error('Request timeout. Please check if the backend is running.');
    } else if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Unauthorized - clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      console.error('API Error:', error.response.status, error.response.data);
      throw error;
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server:', error.request);
      throw new Error('Cannot connect to server. Please ensure the backend is running on http://localhost:8080');
    } else {
      console.error('Error:', error.message);
      throw error;
    }
  }
);

// Products API
export const getProducts = async () => {
  const response = await api.get('/demo/products');
  return response.data;
};

export const getProduct = async (sku) => {
  const response = await api.get(`/demo/products/${sku}`);
  return response.data;
};

// Stock API
// Note: Backend doesn't have GET /demo/stock endpoint
// We'll fetch products and then get stock for each
export const getAllStock = async () => {
  try {
    // Try to get all products first, then fetch stock for each
    const products = await getProducts();
    const stockPromises = products.map(product => 
      getStock(product.sku).catch(() => ({ sku: product.sku, onHand: 0, lastUpdated: null }))
    );
    return await Promise.all(stockPromises);
  } catch (error) {
    console.error('Error fetching all stock:', error);
    throw error;
  }
};

export const getStock = async (sku) => {
  const response = await api.get(`/demo/stock/${sku}`);
  return response.data;
};

export const updateStock = async (sku, onHand) => {
  const response = await api.put(`/demo/stock/${sku}`, { onHand });
  return response.data;
};

// Sales API
export const createSale = async (saleData) => {
  const response = await api.post('/demo/sales', saleData);
  return response.data;
};

export const getSales = async (sku) => {
  const response = await api.get(`/demo/sales/${sku}`);
  return response.data;
};

// Customer Intent API
export const processCustomerIntent = async (userInput) => {
  const response = await api.post('/demo/ai/customer/process-intent', null, {
    params: { userInput },
  });
  return response.data;
};

// Manufacturer API
export const getAllManufacturers = async () => {
  const response = await api.get('/demo/admin/manufacturers');
  return response.data;
};

export const getManufacturer = async (id) => {
  const response = await api.get(`/demo/admin/manufacturers/${id}`);
  return response.data;
};

// Purchase Order API
export const getAllPurchaseOrders = async () => {
  const response = await api.get('/demo/manager/purchase-orders');
  return response.data;
};

export const getPurchaseOrder = async (id) => {
  const response = await api.get(`/demo/manager/purchase-orders/${id}`);
  return response.data;
};

// Receipt API (Python FastAPI)
const PYTHON_API_BASE_URL = 'http://localhost:8000';
const pythonApi = axios.create({
  baseURL: PYTHON_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const generateReceipt = async (receiptData) => {
  const response = await pythonApi.post('/api/generate-receipt', receiptData, {
    responseType: 'blob', // For PDF download
  });
  return response.data;
};

// Chat API (Mock structure - can be connected to real backend later)
// Since there's no chat endpoint in the backend, we'll create a mock service
export const getChatHistory = async (manufacturerId) => {
  // Mock implementation - replace with real endpoint when available
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 100);
  });
};

export const sendChatMessage = async (manufacturerId, message) => {
  // Mock implementation - replace with real endpoint when available
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        message,
        sender: 'vendor',
        receiver: `manufacturer-${manufacturerId}`,
        timestamp: new Date().toISOString(),
      });
    }, 300);
  });
};

export default api;
