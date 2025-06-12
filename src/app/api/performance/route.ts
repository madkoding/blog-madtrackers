import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface PerformanceData {
  url: string;
  userAgent: string;
  metrics: PerformanceMetric[];
  webpSupport?: boolean;
  connectionType?: string;
}

// Thresholds based on Web Vitals
const METRIC_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint (replaces FID)
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = METRIC_THRESHOLDS[metric as keyof typeof METRIC_THRESHOLDS];
  if (!thresholds) {return 'good';}
  
  if (value <= thresholds.good) {return 'good';}
  if (value <= thresholds.poor) {return 'needs-improvement';}
  return 'poor';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data: PerformanceData = await request.json();
    
    // Process metrics and add ratings
    const processedMetrics = data.metrics.map(metric => ({
      ...metric,
      rating: getRating(metric.name, metric.value),
      timestamp: Date.now(),
    }));

    // Log performance data (in production, you might want to store this in a database)
    console.log('Performance Data Received:', {
      url: data.url,
      userAgent: data.userAgent,
      webpSupport: data.webpSupport,
      connectionType: data.connectionType,
      metrics: processedMetrics,
    });

    // Calculate performance score
    const score = calculatePerformanceScore(processedMetrics);

    return NextResponse.json({
      success: true,
      score,
      processedMetrics,
      recommendations: generateRecommendations(processedMetrics, data),
    });
  } catch (error) {
    console.error('Performance API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process performance data' },
      { status: 500 }
    );
  }
}

function getScoreFromRating(rating: 'good' | 'needs-improvement' | 'poor'): number {
  if (rating === 'good') {return 100;}
  if (rating === 'needs-improvement') {return 70;}
  return 40;
}

function calculatePerformanceScore(metrics: PerformanceMetric[]): number {
  const weights = {
    LCP: 0.25,
    INP: 0.25, // Updated from FID to INP
    CLS: 0.25,
    FCP: 0.15,
    TTFB: 0.10,
  };

  let totalScore = 0;
  let totalWeight = 0;

  metrics.forEach(metric => {
    const weight = weights[metric.name as keyof typeof weights];
    if (weight) {
      const score = getScoreFromRating(metric.rating);
      totalScore += score * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

function generateRecommendations(
  metrics: PerformanceMetric[], 
  data: PerformanceData
): string[] {
  const recommendations: string[] = [];

  metrics.forEach(metric => {
    if (metric.rating === 'poor') {
      switch (metric.name) {
        case 'LCP':
          recommendations.push('Optimize largest content (images, fonts) for faster loading');
          if (!data.webpSupport) {
            recommendations.push('Consider using WebP images for better compression');
          }
          break;
        case 'INP':
          recommendations.push('Reduce JavaScript execution time and main thread blocking');
          break;
        case 'CLS':
          recommendations.push('Ensure proper image dimensions and avoid layout shifts');
          break;
        case 'FCP':
          recommendations.push('Optimize critical rendering path and reduce render-blocking resources');
          break;
        case 'TTFB':
          recommendations.push('Optimize server response time and consider CDN usage');
          break;
      }
    }
  });

  return [...new Set(recommendations)]; // Remove duplicates
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Performance monitoring endpoint',
    metrics: Object.keys(METRIC_THRESHOLDS),
    thresholds: METRIC_THRESHOLDS,
  });
}
