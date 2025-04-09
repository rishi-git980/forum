import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const validateToken = (token) => {
    if (!token) return false;
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return tokenPayload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken && validateToken(storedToken)) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Login failed');
      }

      if (!responseData.token || !responseData.id) {
        throw new Error('Invalid login response: missing token or user ID');
      }

      const userData = {
        _id: responseData.id,
        username: responseData.username,
        email: responseData.email,
        avatar: responseData.avatar,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', responseData.token);
      setUser(userData);
      setToken(responseData.token);

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed');
      }

      if (!responseData.token || !responseData.id) {
        throw new Error('Invalid registration response: missing token or user ID');
      }

      const userData = {
        _id: responseData.id,
        username: responseData.username,
        email: responseData.email,
        avatar: responseData.avatar,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', responseData.token);
      setUser(userData);
      setToken(responseData.token);

      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  const updateUser = (updates) => {
    setUser(prev => {
      if (!prev) return prev;

      const newUser = typeof updates === 'function' 
        ? updates(prev)
        : { ...prev, ...updates };

      // Ensure we're not storing undefined values
      Object.keys(newUser).forEach(key => {
        if (newUser[key] === undefined) {
          delete newUser[key];
        }
      });

      // Update localStorage with the complete user object
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return newUser;
    });
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 