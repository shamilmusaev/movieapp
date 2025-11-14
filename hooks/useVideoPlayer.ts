'use client';

/**
 * Hook for managing video player state
 */

import { useState, useEffect, useCallback } from 'react';
import type { VideoPlayerState } from '@/types/feed.types';

interface UseVideoPlayerOptions {
  videoId: string;
  autoplay?: boolean;
  initialMuted?: boolean;
}

interface UseVideoPlayerReturn extends VideoPlayerState {
  togglePlay: () => void;
  toggleMute: () => void;
  setPlaying: (playing: boolean) => void;
  setMuted: (muted: boolean) => void;
  setError: (hasError: boolean) => void;
  setLoaded: (loaded: boolean) => void;
}

const MUTE_PREFERENCE_KEY = 'cineswipe_mute_preference';

/**
 * Get mute preference from localStorage
 */
function getMutePreference(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    const stored = localStorage.getItem(MUTE_PREFERENCE_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

/**
 * Save mute preference to localStorage
 */
function saveMutePreference(muted: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(MUTE_PREFERENCE_KEY, String(muted));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Custom hook for managing video player state
 */
export function useVideoPlayer(options: UseVideoPlayerOptions): UseVideoPlayerReturn {
  const { videoId, autoplay = false, initialMuted } = options;

  const [state, setState] = useState<VideoPlayerState>(() => ({
    isPlaying: autoplay,
    isMuted: initialMuted ?? getMutePreference(),
    volume: 1,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
    hasError: false,
  }));

  /**
   * Toggle play/pause
   */
  const togglePlay = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  /**
   * Toggle mute/unmute
   */
  const toggleMute = useCallback(() => {
    setState(prev => {
      const newMuted = !prev.isMuted;
      saveMutePreference(newMuted);
      return {
        ...prev,
        isMuted: newMuted,
      };
    });
  }, []);

  /**
   * Set playing state
   */
  const setPlaying = useCallback((playing: boolean) => {
    setState(prev => ({
      ...prev,
      isPlaying: playing,
    }));
  }, []);

  /**
   * Set muted state
   */
  const setMuted = useCallback((muted: boolean) => {
    saveMutePreference(muted);
    setState(prev => ({
      ...prev,
      isMuted: muted,
    }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((hasError: boolean) => {
    setState(prev => ({
      ...prev,
      hasError,
      isPlaying: hasError ? false : prev.isPlaying,
    }));
  }, []);

  /**
   * Set loaded state
   */
  const setLoaded = useCallback((loaded: boolean) => {
    setState(prev => ({
      ...prev,
      isLoaded: loaded,
    }));
  }, []);

  // Reset state when videoId changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isPlaying: autoplay,
      isLoaded: false,
      hasError: false,
      currentTime: 0,
      duration: 0,
    }));
  }, [videoId, autoplay]);

  return {
    ...state,
    togglePlay,
    toggleMute,
    setPlaying,
    setMuted,
    setError,
    setLoaded,
  };
}
