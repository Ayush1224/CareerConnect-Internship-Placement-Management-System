import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '../services/authService';
import { clearAuthToken, getAuthToken, storeAuthToken } from '../utils/authToken';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getAuthToken()));

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  const login = useCallback(async (token, remember = true) => {
    storeAuthToken(token, remember);
    try {
      const response = await getCurrentUser(token);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  useEffect(() => {
    let active = true;
    const token = getAuthToken();
    const handleExpiredSession = () => logout();

    window.addEventListener('careerconnect:session-expired', handleExpiredSession);
    if (token) {
      getCurrentUser(token)
        .then((response) => {
          if (active) setUser(response.data.user);
        })
        .catch(() => {
          if (active) logout();
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
      window.removeEventListener('careerconnect:session-expired', handleExpiredSession);
    };
  }, [logout]);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
