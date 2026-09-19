import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure Axios request interceptor so EVERY outgoing request has the latest token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize token state with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('token') || token;
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/profile');
        setUser(res.data.data);
      } catch (err) {
        console.error('Failed to load user profile:', err.response?.data?.message || err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const userData = res.data.data;
    // Set synchronously before navigating so subsequent requests have the token
    localStorage.setItem('token', userData.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    setToken(userData.token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, currencyPreference = 'INR') => {
    const res = await axios.post('/api/auth/register', {
      name,
      email,
      password,
      currencyPreference
    });
    const userData = res.data.data;
    // Set synchronously before navigating
    localStorage.setItem('token', userData.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    setToken(userData.token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    const res = await axios.put('/api/auth/profile', updatedData);
    setUser(res.data.data);
    return res.data.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
