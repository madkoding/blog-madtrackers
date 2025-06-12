'use client';

import { useEffect } from 'react';
import { useWebPSupport } from '../../../hooks/useWebPSupport';

interface Metric {
  name: string;
  value: number;
  id?: string;
  delta?: number;
}

export default function WebVitalsMonitor() {
  const isWebPSupported = useWebPSupport();

  useEffect(() => {
    if (typeof window === 'undefined') {return;}

    const metrics: Metric[] = [];

    // Function to send metrics to our API
    const sendMetrics = async () => {
      if (metrics.length === 0) {return;}

      try {
        await fetch('/api/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: window.location.href,
            userAgent: navigator.userAgent,
            webpSupport: isWebPSupported,
            connectionType: (navigator as Navigator & {
              connection?: { effectiveType?: string };
            }).connection?.effectiveType ?? 'unknown',
            metrics: metrics.map(metric => ({
              name: metric.name,
              value: metric.value,
              timestamp: Date.now(),
            })),
          }),
        });
      } catch (error) {
        console.error('Failed to send performance metrics:', error);
      }
    };

    // Web Vitals collection
    const reportMetric = (metric: Metric) => {
      metrics.push(metric);
      console.log(`[Web Vitals] ${metric.name}:`, metric.value);
    };

    // Import and setup web-vitals if available
    const setupWebVitals = async () => {
      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');
        
        onCLS(reportMetric);
        onINP(reportMetric); // Interaction to Next Paint (replaces FID)
        onFCP(reportMetric);
        onLCP(reportMetric);
        onTTFB(reportMetric);

        // Send metrics after page load
        setTimeout(sendMetrics, 2000);
        
        // Send metrics before page unload
        window.addEventListener('beforeunload', sendMetrics);
        
        return () => {
          window.removeEventListener('beforeunload', sendMetrics);
        };
      } catch (error) {
        console.warn('Web Vitals not available:', error);
        
        // Fallback: collect basic performance metrics
        const collectBasicMetrics = () => {
          const navigation = performance.getEntriesByType('navigation')[0];
          if (navigation) {
            reportMetric({
              name: 'TTFB',
              value: navigation.responseStart - navigation.fetchStart,
            });
            
            reportMetric({
              name: 'FCP',
              value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            });
          }
        };

        if (document.readyState === 'complete') {
          collectBasicMetrics();
        } else {
          window.addEventListener('load', collectBasicMetrics);
        }
      }
    };

    setupWebVitals();
  }, [isWebPSupported]);

  // This component doesn't render anything visible
  return null;
}
