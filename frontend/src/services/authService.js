import api from './api';

/**
 * Authentication service
 * Handles login, logout, and token management
 */

export const login = async (email, password) => {
  const response = await api.post('/login', {
    email,
    password
  });
  return response.data;
};

export const logout = async () => {
  // Backend logout is a no-op, just clear local storage
  return Promise.resolve();
};

export const refreshToken = async (refreshTokenValue) => {
  const response = await api.post('/refreshToken', {
    token: refreshTokenValue
  });
  return response.data;
};
