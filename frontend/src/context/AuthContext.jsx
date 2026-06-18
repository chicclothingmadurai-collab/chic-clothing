import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('chic_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('chic_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem('chic_user', JSON.stringify(data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('chic_token', data.token);
    localStorage.setItem('chic_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const adminLogin = async (credentials) => {
    const { data } = await authAPI.adminLogin(credentials);
    localStorage.setItem('chic_token', data.token);
    localStorage.setItem('chic_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (credentials) => {
    const { data } = await authAPI.register(credentials);
    localStorage.setItem('chic_token', data.token);
    localStorage.setItem('chic_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('chic_token');
    localStorage.removeItem('chic_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('chic_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, adminLogin, register, logout, updateUser, isAdmin, isAuthenticated, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
