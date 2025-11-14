'use client';

/**
 * YouTube iframe player component
 * Implements 2024 best practices: allow="autoplay" attribute, no deprecated parameters
 */

import { useEffect, useRef, memo } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';

interface YouTubePlayerProps {
  /**
   * YouTube video ID
   */
  videoId: string;

  /**
   * Whether to autoplay the video
   */
  autoplay?: boolean;

  /**
   * Whether the video is currently active (visible)
   */
  isActive?: boolean;

  /**
   * Callback when video loads
   */
  onLoad?: () => void;

  /**
   * Callback when video errors
   */
  onError?: () => void;

  /**
   * CSS class name
   */
  className?: string;
}

/**
 * YouTube Player Component
 * Uses iframe embed with proper 2024 parameters (no deprecated modestbranding)
 */
function YouTubePlayerComponent({
  videoId,
  autoplay = false,
  isActive = false,
  onLoad,
  onError,
  className = '',
}: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    isPlaying,
    isMuted,
    hasError,
    isLoaded,
    setPlaying,
    setError,
    setLoaded,
  } = useVideoPlayer({
    videoId,
    autoplay,
  });

  // Build YouTube iframe URL with 2024 best practices
  const buildIframeUrl = (videoId: string): string => {
    const params = new URLSearchParams({
      autoplay: '1', // Always enable autoplay (controlled by isActive via postMessage)
      mute: '1', // Always start muted for browser autoplay policy
      controls: '1',
      rel: '0', // Don't show related videos
      loop: '1',
      playlist: videoId, // Required for loop to work
      enablejsapi: '1', // Enable JavaScript API for better control
      playsinline: '1', // Play inline on iOS
    });

    console.log('🎥 Building iframe URL for video:', videoId);
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  // Control playback based on isActive
  useEffect(() => {
    if (!iframeRef.current || !isLoaded) return;

    console.log('▶️ YouTube playback control - isActive:', isActive, 'isPlaying:', isPlaying, 'videoId:', videoId);

    // Small delay to ensure YouTube API is ready
    const timer = setTimeout(() => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) return;

        // Play if active and playing state is true, otherwise pause
        const command = isActive && isPlaying ? 'playVideo' : 'pauseVideo';

        console.log('📡 Sending command to YouTube:', command);

        iframe.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: '',
          }),
          '*'
        );
      } catch (error) {
        console.warn('Failed to control YouTube player:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isActive, isPlaying, videoId, isLoaded]);

  // Handle iframe load
  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  // Handle iframe error
  const handleError = () => {
    setError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center p-6">
          <p className="text-white mb-4">Failed to load video</p>
          <button
            onClick={() => setError(false)}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-video ${className}`}>
      {/* Loading spinner */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* YouTube iframe */}
      <iframe
        ref={iframeRef}
        src={buildIframeUrl(videoId)}
        title="YouTube video player"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
        className="absolute inset-0 w-full h-full"
        style={{ border: 'none' }}
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const YouTubePlayer = memo(YouTubePlayerComponent);
