import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig'; // Используем настроенный axios

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get('/api/core/verify-session/');
        setIsAuthenticated(response.data.isValid);
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/login', {
          state: { from: window.location.pathname }
        });
      } finally {
        setIsLoading(false);
      }
    };
    verifyAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;