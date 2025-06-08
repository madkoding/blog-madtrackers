import { useState, useEffect } from 'react';

interface UseChunkLoadingOptions {
  delay?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export function useChunkLoading(options: UseChunkLoadingOptions = {}) {
  const { delay = 100, retryAttempts = 3, retryDelay = 1000 } = options;
  
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
      setIsLoading(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleLoadSuccess = () => {
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
  };

  const handleLoadError = (err: Error) => {
    setIsLoading(false);
    setError(err);
    
    if (retryCount < retryAttempts) {
      const nextRetryCount = retryCount + 1;
      setRetryCount(nextRetryCount);
      
      setTimeout(() => {
        setError(null);
        setIsLoading(true);
      }, retryDelay * nextRetryCount);
    }
  };

  const retry = () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);
  };

  return {
    shouldLoad,
    isLoading,
    error,
    retryCount,
    handleLoadSuccess,
    handleLoadError,
    retry,
  };
}

export default useChunkLoading;
