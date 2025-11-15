'use client';

/**
 * Modern video player component using react-player library
 * Replaces custom YouTube iframe implementation with battle-tested solution
 * Supports YouTube, Vimeo, and direct video files
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const MUTE_PREFERENCE_KEY = 'video-mute-preference';

interface VideoPlayerProps {
  /**
   * Video URL (YouTube, Vimeo, or direct video file)
   */
  url: string;

  /**
   * Whether the video is currently active (visible in viewport)
   */
  isActive?: boolean;

  /**
   * Whether the video should autoplay when active
   */
  autoplay?: boolean;

  /**
   * External mute state (controlled)
   */
  isMuted?: boolean;

  /**
   * Callback when mute state changes
   */
  onToggleMute?: () => void;

  /**
   * Callback when video is ready to play
   */
  onReady?: () => void;

  /**
   * Callback when video encounters error
   */
  onError?: (error: Error) => void;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Enable light mode (show thumbnail before loading player)
   * Default: false for TikTok-style autoplay experience
   */
  enableLightMode?: boolean;
}

/**
 * Get mute preference from localStorage (cached on first read)
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
function saveMutePreference(isMuted: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(MUTE_PREFERENCE_KEY, String(isMuted));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * VideoPlayer Component
 * Uses react-player for reliable cross-platform video playback
 */
export function VideoPlayer({
  url,
  isActive = false,
  autoplay = false,
  isMuted: externalIsMuted,
  onToggleMute,
  onReady,
  onError,
  className = '',
  enableLightMode = false,
}: VideoPlayerProps) {
  // Cache mute preference on mount - always start muted for autoplay
  const initialMuted = useRef(externalIsMuted ?? true).current;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState(1);

  const playerRef = useRef<any>(null);

  // Log for debugging (remove in production)
  useEffect(() => {
    console.log('VideoPlayer state:', { isActive, autoplay, isPlaying, isMuted, isReady });
  }, [isActive, autoplay, isPlaying, isMuted, isReady]);

  // Sync external mute state
  useEffect(() => {
    if (externalIsMuted !== undefined && externalIsMuted !== isMuted) {
      setIsMuted(externalIsMuted);
      saveMutePreference(externalIsMuted);
    }
  }, [externalIsMuted, isMuted]);

  // Control playback based on isActive
  useEffect(() => {
    if (isActive && autoplay) {
      setIsPlaying(true);

      // Also try to force play when becoming active
      if (isReady && playerRef.current) {
        setTimeout(() => {
          const player = playerRef.current?.getInternalPlayer();
          if (player && typeof player.playVideo === 'function') {
            try {
              if (typeof player.mute === 'function') {
                player.mute();
              }
              player.playVideo();
              console.log('YouTube player: forced play on active change');
            } catch (err) {
              console.error('Failed to play on active:', err);
            }
          }
        }, 50);
      }
    } else {
      setIsPlaying(false);

      // Pause when becoming inactive
      if (isReady && playerRef.current) {
        const player = playerRef.current?.getInternalPlayer();
        if (player && typeof player.pauseVideo === 'function') {
          try {
            player.pauseVideo();
          } catch (err) {
            console.error('Failed to pause:', err);
          }
        }
      }
    }
  }, [isActive, autoplay, isReady]);

  // Handle ready callback
  const handleReady = useCallback(() => {
    setIsReady(true);
    setHasError(false);

    // Aggressively start playing if video is active
    if (isActive && autoplay) {
      setIsPlaying(true);

      // Force play after a small delay to ensure player is fully ready
      setTimeout(() => {
        const player = playerRef.current?.getInternalPlayer();
        if (player && typeof player.playVideo === 'function') {
          try {
            // Ensure muted for YouTube autoplay policy
            if (typeof player.mute === 'function') {
              player.mute();
            }
            player.playVideo();
            console.log('YouTube player: forced playVideo()');
          } catch (err) {
            console.error('Failed to force play:', err);
          }
        }
      }, 100);
    }

    onReady?.();
  }, [onReady, isActive, autoplay]);

  // Handle error callback
  const handleError = useCallback((error: any) => {
    setHasError(true);
    setIsReady(false);
    onError?.(error);
  }, [onError]);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    saveMutePreference(newMuted);
    onToggleMute?.();
  }, [isMuted, onToggleMute]);

  // Handle play/pause toggle
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Handle progress
  const handleProgress = useCallback((state: any) => {
    // Can be used for analytics or showing progress
  }, []);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center p-6">
          <p className="text-white mb-4">Failed to load video</p>
          <button
            onClick={() => setHasError(false)}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Retry loading video"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-video ${className}`}>
      {/* Loading state */}
      {!isReady && !enableLightMode && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* React Player */}
      <ReactPlayer
        {...({
          ref: playerRef,
          url,
          playing: isPlaying,
          muted: isMuted,
          volume,
          loop: true,
          playsinline: true,
          light: enableLightMode,
          width: '100%',
          height: '100%',
          onReady: handleReady,
          onError: handleError,
          onProgress: handleProgress,
          controls: false,
          config: {
            youtube: {
              playerVars: {
                autoplay: 1,
                modestbranding: 1,
                rel: 0,
                fs: 0,
                disablekb: 1,
                playsinline: 1,
                iv_load_policy: 3,
                controls: 0,
                mute: 1, // Always start muted for autoplay
              },
              onReady: (event: any) => {
                // Ensure muted before playing
                event.target.mute();
                console.log('YouTube onReady callback, muted');
              },
            },
            file: {
              attributes: {
                controlsList: 'nodownload',
                disablePictureInPicture: true,
                preload: 'auto',
              },
            },
          },
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
          },
        } as any)}
      />
    </div>
  );
}

export default VideoPlayer;
