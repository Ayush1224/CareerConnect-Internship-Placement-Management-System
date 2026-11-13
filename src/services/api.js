import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { clearAuthToken, getAuthToken } from '../utils/authToken';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/me'];
    const isAuthEndpoint = authEndpoints.some((endpoint) => error.config?.url?.includes(endpoint));
    if (error.response?.status === 401 && getAuthToken() && !isAuthEndpoint) {
      clearAuthToken();
      window.dispatchEvent(new Event('careerconnect:session-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
