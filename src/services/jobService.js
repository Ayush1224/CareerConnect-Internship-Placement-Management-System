import api from './api';

export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const getCompanyJobs = async () => {
  const response = await api.get('/jobs/mine');
  return response.data;
};

export const createJob = async (payload) => {
  const response = await api.post('/jobs', payload);
  return response.data;
};

export const updateJob = async (id, payload) => {
  const response = await api.patch(`/jobs/${id}`, payload);
  return response.data;
};

export const closeJob = async (id) => {
  const response = await api.patch(`/jobs/${id}/close`);
  return response.data;
};
