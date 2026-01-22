import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      throw new Error('Request timeout. Please check if the backend is running.');
    } else if (error.response) {
      // Server responded with error status
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
export const getAllStock = async () => {
  const response = await api.get('/demo/stock');
  return response.data;
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

export default api;
