import api from './api';

export const loginUser = async (payload) => {
  const response = await api.post('/auth/login', payload);
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const forgotPassword = async (payload) => {
  const response = await api.post('/auth/forgot-password', payload);
  return response.data;
};

export const resetPassword = async (payload) => {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
};
