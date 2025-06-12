import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../../../../lib/logger';

// Interfaz para métricas de rendimiento
interface PerformanceMetrics {
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  bundleLoadTime?: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Endpoint para recopilar métricas de rendimiento del cliente
 * Endpoint: /api/performance/metrics
 */
export async function POST(request: NextRequest) {
  try {
    const { metrics, timestamp, userAgent, url }: {
      metrics: PerformanceMetrics;
      timestamp: number;
      userAgent: string;
      url: string;
    } = await request.json();

    // En producción, aquí podrías enviar las métricas a un servicio de monitoreo
    // como Google Analytics, DataDog, New Relic, etc.
    
    if (process.env.NODE_ENV === 'development') {
      logger.info('📊 Métricas de rendimiento recibidas:');
      logger.info('🕐 Timestamp:', new Date(timestamp).toISOString());
      logger.info('🌐 URL:', url);
      logger.info('🔧 User Agent:', userAgent);
      logger.info('📈 Métricas:', JSON.stringify(metrics, null, 2));
    }

    // Ejemplo de cómo podrías procesar las métricas
    const performanceScore = calculatePerformanceScore(metrics);
    
    // Aquí podrías guardar en base de datos, enviar alertas, etc.
    if (performanceScore < 70) {
      logger.warn(`⚠️ Rendimiento bajo detectado: ${performanceScore}/100`);
    }

    return NextResponse.json({ 
      success: true, 
      score: performanceScore,
      message: 'Métricas procesadas correctamente' 
    });

  } catch (error) {
    logger.error('Error procesando métricas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Calcula una puntuación de rendimiento simplificada basada en Core Web Vitals
 */
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;
  
  // FCP (First Contentful Paint)
  const fcp = metrics.firstContentfulPaint ?? 0;
  if (fcp > 3000) {score -= 20;}
  else if (fcp > 1800) {score -= 10;}
  
  // LCP (Largest Contentful Paint)
  const lcp = metrics.largestContentfulPaint ?? 0;
  if (lcp > 4000) {score -= 25;}
  else if (lcp > 2500) {score -= 12;}
  
  // FID (First Input Delay)
  const fid = metrics.firstInputDelay ?? 0;
  if (fid > 300) {score -= 25;}
  else if (fid > 100) {score -= 12;}
  
  // CLS (Cumulative Layout Shift)
  const cls = metrics.cumulativeLayoutShift ?? 0;
  if (cls > 0.25) {score -= 25;}
  else if (cls > 0.1) {score -= 12;}
  
  // Bundle load time
  const bundleTime = metrics.bundleLoadTime ?? 0;
  if (bundleTime > 2000) {score -= 5;}
  
  return Math.max(0, Math.round(score));
}
