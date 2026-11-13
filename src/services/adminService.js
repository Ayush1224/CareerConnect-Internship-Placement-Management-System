import api from './api';

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAdminCompanies = async ({ page, limit, verified }) => {
  const response = await api.get('/admin/companies', {
    params: { page, limit, ...(verified ? { verified } : {}) }
  });
  return response.data;
};

export const setCompanyVerification = async (companyId, verified) => {
  const response = await api.patch(`/admin/companies/${companyId}/verification`, { verified });
  return response.data;
};
