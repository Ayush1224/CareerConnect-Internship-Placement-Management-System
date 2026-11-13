import api from './api';

export const getMyCompanyProfile = async () => {
  const response = await api.get('/companies/me');
  return response.data;
};

export const saveMyCompanyProfile = async (payload) => {
  const response = await api.put('/companies/me', payload);
  return response.data;
};
