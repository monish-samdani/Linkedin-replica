import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';
import { ENDPOINTS } from '../api/endpoints';
import { connectSocket, disconnectSocket } from '../socket/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve a fresh short-lived socket token. Passed to connectSocket as a provider so
  // socket.io can re-fetch on every (re)connection — tokens expire after 1 minute, so a
  // cached one would break reconnection after long network drops.
  const getSocketToken = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.AUTH.TOKEN);
      return data.data.token;
    } catch {
      // Realtime is additive — failure here just falls back to polling.
      return null;
    }
  }, []);

  const setupSocket = useCallback(() => {
    connectSocket(getSocketToken);
  }, [getSocketToken]);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.AUTH.ME);
      setUser(data.data.user);
      setupSocket();
      return data.data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, [setupSocket]);

  useEffect(() => {
    fetchMe().finally(() => setIsLoading(false));
  }, [fetchMe]);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
    setUser(data.data.user);
    setupSocket();
    return data.data.user;
  }, [setupSocket]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
    setUser(data.data.user);
    setupSocket();
    return data.data.user;
  }, [setupSocket]);

  const logout = useCallback(async () => {
    await api.post(ENDPOINTS.AUTH.LOGOUT);
    disconnectSocket();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUser,
      fetchMe,
    }),
    [user, isLoading, login, register, logout, updateUser, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
