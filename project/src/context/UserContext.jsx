import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        try {
          // In a real app, validate token with backend
          // const res = await axios.get(`${API_URL}/api/auth/me`, {
          //   headers: {
          //     Authorization: `Bearer ${localStorage.token}`
          //   }
          // });
          
          // For demo, we'll just create a mock user
          setUser({
            _id: 'user1',
            username: 'Demo User',
            email: 'demo@example.com',
            avatar: 'https://i.pravatar.cc/150?img=68' // Added avatar URL
          });
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);
  
  const login = async (email, password) => {
    try {
      // In a real app, call the API
      // const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      // localStorage.setItem('token', res.data.token);
      
      // For demo purposes
      localStorage.setItem('token', 'dummy-token');
      setUser({
        _id: 'user1',
        username: 'Demo User',
        email: email,
        avatar: 'https://i.pravatar.cc/150?img=68' // Added avatar URL
      });
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      throw err;
    }
  };
  
  const register = async (username, email, password) => {
    try {
      // In a real app, call the API
      // const res = await axios.post(`${API_URL}/api/auth/register`, {
      //   username,
      //   email,
      //   password
      // });
      // localStorage.setItem('token', res.data.token);
      
      // For demo purposes
      localStorage.setItem('token', 'dummy-token');
      setUser({
        _id: 'new-user',
        username,
        email,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` // Random avatar
      });
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      throw err;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };
  
  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
