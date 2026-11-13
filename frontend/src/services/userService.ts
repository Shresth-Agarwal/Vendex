import apiClient from './apiClient';

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/user/me');
    return response.data;
  },

  deleteProfile: async () => {
    const response = await apiClient.delete('/user/me');
    return response.data;
  }
};
