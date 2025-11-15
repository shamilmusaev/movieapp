/**
 * Web Vitals monitoring for performance tracking
 * Tracks Core Web Vitals (2025): INP, LCP, CLS, TTFB, FCP
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

const vitalsUrl = '/api/vitals';

function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
    });
  }

  // Send to analytics endpoint in production
  if (process.env.NODE_ENV === 'production') {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    });

    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsUrl, body);
    } else {
      fetch(vitalsUrl, { body, method: 'POST', keepalive: true });
    }
  }
}

/**
 * Initialize Web Vitals tracking
 * Call this in your app's main entry point
 */
export function initWebVitals() {
  try {
    // Track all Core Web Vitals
    onCLS(sendToAnalytics);   // Cumulative Layout Shift
    onINP(sendToAnalytics);   // Interaction to Next Paint (new in 2025, replaced FID)
    onFCP(sendToAnalytics);   // First Contentful Paint
    onLCP(sendToAnalytics);   // Largest Contentful Paint
    onTTFB(sendToAnalytics);  // Time to First Byte
  } catch (err) {
    console.error('Failed to initialize Web Vitals:', err);
  }
}

/**
 * Get performance rating for a metric value
 */
export function getPerformanceRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    INP: { good: 200, poor: 500 },      // milliseconds
    LCP: { good: 2500, poor: 4000 },    // milliseconds
    CLS: { good: 0.1, poor: 0.25 },     // score
    FCP: { good: 1800, poor: 3000 },    // milliseconds
    TTFB: { good: 800, poor: 1800 },    // milliseconds
  };

  const threshold = thresholds[metricName];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}
