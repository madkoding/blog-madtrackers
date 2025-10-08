'use client';

import { useEffect } from 'react';

interface RecaptchaProviderProps {
  children: React.ReactNode;
}

export default function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!siteKey) {
      console.warn('reCAPTCHA site key no está configurado');
      return;
    }

    // Verificar si el script ya está cargado
    if (document.querySelector('script[src*="recaptcha"]')) {
      return;
    }

    // Crear y cargar el script de reCAPTCHA
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('reCAPTCHA script cargado exitosamente');
      
      // Ocultar el badge de reCAPTCHA
      const style = document.createElement('style');
      style.innerHTML = '.grecaptcha-badge { visibility: hidden; }';
      document.head.appendChild(style);
    };
    
    script.onerror = () => {
      console.error('Error cargando el script de reCAPTCHA');
    };

    document.head.appendChild(script);

    // Cleanup function para remover el script si es necesario
    return () => {
      const existingScript = document.querySelector('script[src*="recaptcha"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return <>{children}</>;
}
