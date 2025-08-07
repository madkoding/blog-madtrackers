import { useCallback } from 'react';

interface UseRecaptchaReturn {
  executeRecaptcha: (action: string) => Promise<string | null>;
  isRecaptchaReady: boolean;
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export const useRecaptcha = (): UseRecaptchaReturn => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const isRecaptchaReady = typeof window !== 'undefined' && 
    window.grecaptcha && 
    typeof window.grecaptcha.execute === 'function';

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!siteKey) {
      console.error('reCAPTCHA site key no está configurado');
      return null;
    }

    if (!isRecaptchaReady) {
      console.error('reCAPTCHA no está listo');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('Error ejecutando reCAPTCHA:', error);
      return null;
    }
  }, [siteKey, isRecaptchaReady]);

  return {
    executeRecaptcha,
    isRecaptchaReady
  };
};
