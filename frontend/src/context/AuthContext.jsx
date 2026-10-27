import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('gr_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Fetch full user profile & vehicles
  const fetchProfile = async (currentToken = token) => {
    if (!currentToken) {
      setLoading(false);
      return null;
    }
    try {
      const res = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        setUser(data.data.user);
        localStorage.setItem('gr_user', JSON.stringify(data.data.user));
        return data.data.user;
      } else {
        // Token might be invalid
        logout();
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (phone, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (data.success && data.data?.token) {
      setToken(data.data.token);
      setUser(data.data);
      localStorage.setItem('gr_token', data.data.token);
      localStorage.setItem('gr_user', JSON.stringify(data.data));
      return { success: true, user: data.data };
    }
    return { success: false, message: data.message || 'Login failed' };
  };

  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success && data.data?.token) {
      setToken(data.data.token);
      setUser(data.data);
      localStorage.setItem('gr_token', data.data.token);
      localStorage.setItem('gr_user', JSON.stringify(data.data));
      return { success: true, user: data.data };
    }
    return { success: false, message: data.message || 'Registration failed' };
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('gr_token');
    localStorage.removeItem('gr_user');
  };

  // Helper for authenticated API calls
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      login,
      register,
      logout,
      fetchProfile,
      authFetch,
      isAuthenticated: Boolean(token && user)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
