'use client';

/**
 * Hook that persists the global mute preference so every card stays in sync.
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'cineswipe_mute_preference';

function readPreference(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return true;
    return stored === 'true';
  } catch {
    return true;
  }
}

function writePreference(value: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Ignore storage errors (e.g., Safari private mode)
  }
}

export function useMutePreference() {
  const [isMuted, setIsMuted] = useState<boolean>(() => readPreference());

  useEffect(() => {
    setIsMuted(readPreference());
  }, []);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue != null) {
        setIsMuted(event.newValue === 'true');
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setMuted = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setIsMuted(prev => {
      const nextValue = typeof value === 'function' ? value(prev) : value;
      writePreference(nextValue);
      return nextValue;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
  }, [setMuted]);

  return {
    isMuted,
    setMuted,
    toggleMute,
  };
}
