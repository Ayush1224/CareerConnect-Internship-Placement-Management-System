const TOKEN_KEY = 'careerconnect_token';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY) || window.sessionStorage.getItem(TOKEN_KEY);
};

export const storeAuthToken = (token, remember = true) => {
  if (typeof window === 'undefined') return;
  clearAuthToken();
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
};
