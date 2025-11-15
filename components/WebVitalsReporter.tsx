'use client';

/**
 * Web Vitals Reporter Component
 * Initializes Web Vitals tracking on mount
 */

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null; // This component doesn't render anything
}
