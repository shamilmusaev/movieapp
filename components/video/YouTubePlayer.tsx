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
   * Whether the video should be muted
   */
  isMuted?: boolean;

  /**
   * Callback when mute state changes
   */
  onToggleMute?: () => void;

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
  isMuted: externalIsMuted = true,
  onToggleMute,
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
      controls: '0', // Hide YouTube controls for immersive experience
      rel: '0', // Don't show related videos
      loop: '1',
      playlist: videoId, // Required for loop to work
      enablejsapi: '1', // Enable JavaScript API for better control
      playsinline: '1', // Play inline on iOS
      fs: '0', // Disable fullscreen button
      iv_load_policy: '3', // Hide video annotations
      disablekb: '1', // Disable keyboard controls
    });

    console.log('🎥 Building iframe URL for video:', videoId);
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  // Control playback based on isActive with retry mechanism
  useEffect(() => {
    if (!iframeRef.current || !isLoaded) return;

    console.log('▶️ YouTube playback control - isActive:', isActive, 'isPlaying:', isPlaying, 'videoId:', videoId);

    const sendCommand = (command: string, attempt: number = 1) => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) return;

        console.log(`📡 Sending command to YouTube (attempt ${attempt}):`, command);

        iframe.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: '',
          }),
          '*'
        );

        // Retry up to 3 times with increasing delays for better reliability
        if (command === 'playVideo' && attempt < 3) {
          setTimeout(() => sendCommand(command, attempt + 1), attempt * 500);
        }
      } catch (error) {
        console.warn('Failed to control YouTube player:', error);
      }
    };

    // Play if active and playing state is true, otherwise pause
    const command = isActive && isPlaying ? 'playVideo' : 'pauseVideo';

    // Longer initial delay to ensure YouTube API is fully ready
    const timer = setTimeout(() => {
      sendCommand(command);
    }, 300);

    return () => clearTimeout(timer);
  }, [isActive, isPlaying, videoId, isLoaded]);

  // Handle mute state changes
  useEffect(() => {
    if (!iframeRef.current || !isLoaded) return;

    console.log('🔊 YouTube mute control - externalIsMuted:', externalIsMuted, 'videoId:', videoId);

    // Longer delay to ensure YouTube API is ready
    const timer = setTimeout(() => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) return;

        // Send mute or unmute command based on external state
        const command = externalIsMuted ? 'mute' : 'unMute';

        console.log('📡 Sending mute command to YouTube:', command);

        iframe.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: '',
          }),
          '*'
        );
      } catch (error) {
        console.warn('Failed to control YouTube mute state:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [externalIsMuted, videoId, isLoaded]);

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
      {/* Loading or inactive state */}
      {(!isActive || !isLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          {!isActive ? (
            <div className="text-white text-sm">Ready to play</div>
          ) : (
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* YouTube iframe - always render but control play/pause via postMessage */}
      <iframe
        ref={iframeRef}
        src={buildIframeUrl(videoId)}
        title="YouTube video player"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ border: 'none' }}
      />

      {/* Overlay to hide YouTube UI elements with corner blocks */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Top-left corner block - covers channel avatar and title start */}
        <div 
          className="absolute top-0 left-0 w-[200px] h-[70px] bg-gradient-to-r from-black via-black/95 to-transparent"
          aria-hidden="true"
        />
        
        {/* Top-right corner block - covers "Copy link" button and "1/1" counter */}
        <div 
          className="absolute top-0 right-0 w-[200px] h-[70px] bg-gradient-to-l from-black via-black/95 to-transparent"
          aria-hidden="true"
        />
        
        {/* Bottom overlay - covers progress bar and remaining controls */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-black via-black/90 to-transparent"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const YouTubePlayer = memo(YouTubePlayerComponent);
