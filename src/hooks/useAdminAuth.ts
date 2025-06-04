"use client";

import { useState, useEffect } from 'react';

interface UseAdminAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  handleAuthSuccess: () => void;
  handleLogout: () => void;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const token = localStorage.getItem('madtrackers_jwt');
        
        if (token) {
          // Decodificar JWT para verificar expiración
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          
          // Verificar si el token no ha expirado y es admin
          if (payload.exp > now && payload.type === 'admin') {
            setIsAuthenticated(true);
            setShowAuthModal(false);
          } else {
            // Token expirado o no es admin
            localStorage.removeItem('madtrackers_jwt');
            setIsAuthenticated(false);
            setShowAuthModal(true);
          }
        } else {
          setIsAuthenticated(false);
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('Error al verificar JWT:', error);
        localStorage.removeItem('madtrackers_jwt');
        setIsAuthenticated(false);
        setShowAuthModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('madtrackers_jwt');
    setIsAuthenticated(false);
    setShowAuthModal(true);
  };

  return {
    isAuthenticated,
    isLoading,
    showAuthModal,
    handleAuthSuccess,
    handleLogout
  };
}
