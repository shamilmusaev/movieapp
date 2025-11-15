'use client';

/**
 * Hook for improved feed gesture handling using @use-gesture
 * Provides smooth swipe/drag interactions for TikTok-style feed
 */

import { useDrag } from '@use-gesture/react';
import { useCallback } from 'react';

interface UseFeedGesturesOptions {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  enabled?: boolean;
}

export function useFeedGestures({
  onSwipeUp,
  onSwipeDown,
  enabled = true,
}: UseFeedGesturesOptions) {
  const handleGesture = useCallback(
    ({ swipe: [, swipeY], direction: [, dirY], cancel }: any) => {
      if (!enabled) return;

      // Swipe detected
      if (swipeY === -1) {
        // Swipe up - next video
        onSwipeUp();
      } else if (swipeY === 1) {
        // Swipe down - previous video
        onSwipeDown();
      }
    },
    [enabled, onSwipeUp, onSwipeDown]
  );

  const bind = useDrag(handleGesture, {
    axis: 'y', // Only vertical dragging
    filterTaps: true, // Don't trigger on taps
    swipe: {
      velocity: 0.5, // Minimum velocity to trigger swipe
      distance: 60, // Minimum distance to trigger swipe
      duration: 400, // Maximum duration for swipe
    },
    preventDefault: false,
    triggerAllEvents: false,
  });

  return enabled ? bind() : {};
}
