import apiClient from './apiClient';

export const adminService = {
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (payload: { userId: number; role: string }) => {
    const response = await apiClient.post('/admin/users/roles', payload);
    return response.data;
  }
};
