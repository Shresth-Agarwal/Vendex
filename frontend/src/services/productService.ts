import apiClient from './apiClient';

export const productService = {
  // GET (fetch data)
  getProducts: async () => {
    const response = await apiClient.get('/api/products');
    return response.data;
  },
  
  getProductById: async (id: number) => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },

  // POST (create data)
  createProduct: async (productData: any) => {
    const response = await apiClient.post('/api/products', productData);
    return response.data;
  },

  // PUT (update data)
  updateProduct: async (id: number, productData: any) => {
    const response = await apiClient.put(`/api/products/${id}`, productData);
    return response.data;
  },

  // DELETE
  deleteProduct: async (id: number) => {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  }
};
