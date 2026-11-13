import api from './api';

export const getApplications = async () => {
  const response = await api.get('/applications');
  return response.data;
};

export const applyToJob = async (jobId, payload) => {
  const response = await api.post('/applications', { ...payload, jobId });
  return response.data;
};

export const getCompanyApplicants = async (jobId) => {
  const response = await api.get(`/applications/jobs/${jobId}`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.patch(`/applications/${applicationId}/status`, { status });
  return response.data;
};
