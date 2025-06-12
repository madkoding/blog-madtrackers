"use client";

import { useState, useEffect } from 'react';
import { logger } from '../lib/logger';

interface UseUserAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  jwtToken: string | null;
  handleAuthSuccess: (jwt: string) => void;
  handleLogout: () => void;
  requestAuth: () => void;
}

export function useUserAuth(): UseUserAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const token = localStorage.getItem('madtrackers_jwt');
        
        if (token) {
          // Decodificar JWT para verificar expiración
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          
          // Verificar si el token no ha expirado y es usuario o admin
          if (payload.exp > now && (payload.type === 'user' || payload.type === 'admin')) {
            setJwtToken(token);
            setIsAuthenticated(true);
            setShowAuthModal(false);
          } else {
            // Token expirado o tipo no válido
            localStorage.removeItem('madtrackers_jwt');
            setJwtToken(null);
            setIsAuthenticated(false);
            setShowAuthModal(true);
          }
        } else {
          setJwtToken(null);
          setIsAuthenticated(false);
          setShowAuthModal(true);
        }
      } catch (error) {
        logger.error('Error al verificar JWT:', error);
        localStorage.removeItem('madtrackers_jwt');
        setJwtToken(null);
        setIsAuthenticated(false);
        setShowAuthModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleAuthSuccess = (jwt: string) => {
    setJwtToken(jwt);
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('madtrackers_jwt');
    setJwtToken(null);
    setIsAuthenticated(false);
    setShowAuthModal(true);
  };

  const requestAuth = () => {
    setShowAuthModal(true);
  };

  return {
    isAuthenticated,
    isLoading,
    showAuthModal,
    jwtToken,
    handleAuthSuccess,
    handleLogout,
    requestAuth
  };
}
