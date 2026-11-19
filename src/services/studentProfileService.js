import api from './api';

export const getStudentProfile = async () => {
  const response = await api.get('/students/profile');
  return response.data;
};

export const updateStudentProfile = async (profile) => {
  const response = await api.patch('/students/profile', profile);
  return response.data;
};

export const uploadStudentProfileFile = async (kind, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/students/profile/${kind}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
