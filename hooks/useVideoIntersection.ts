'use client';

/**
 * Hook for detecting video visibility using Intersection Observer API
 */

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseVideoIntersectionOptions {
  /**
   * Threshold for intersection (0-1)
   * @default 0.5 (50% visible)
   */
  threshold?: number;

  /**
   * Root margin for early detection
   * @default '0px'
   */
  rootMargin?: string;

  /**
   * Callback when visibility changes
   */
  onVisibilityChange?: (isVisible: boolean, ratio: number) => void;
}

interface UseVideoIntersectionReturn {
  /**
   * Ref to attach to the video element
   */
  ref: RefObject<HTMLDivElement | null>;

  /**
   * Whether the video is currently visible (above threshold)
   */
  isVisible: boolean;

  /**
   * Intersection ratio (0-1)
   */
  intersectionRatio: number;
}

/**
 * Custom hook for tracking video visibility with Intersection Observer
 * Follows best practices from 2024: runs off main thread, better performance than scroll events
 */
export function useVideoIntersection(
  options: UseVideoIntersectionOptions = {}
): UseVideoIntersectionReturn {
  const {
    threshold = 0.5,
    rootMargin = '0px',
    onVisibilityChange,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          const visible = entry.isIntersecting && ratio >= threshold;

          setIntersectionRatio(ratio);
          setIsVisible(visible);

          // Call callback if provided
          if (onVisibilityChange) {
            onVisibilityChange(visible, ratio);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Observe the element
    observer.observe(element);

    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, onVisibilityChange]);

  return {
    ref,
    isVisible,
    intersectionRatio,
  };
}
