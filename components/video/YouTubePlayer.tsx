'use client';

/**
 * YouTube iframe player component
 * Implements 2024 best practices: allow="autoplay" attribute, no deprecated parameters
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface YouTubePlayerProps {
  /**
   * YouTube video ID
   */
  videoId: string;
  /**
   * Indicates whether this iframe should actively play audio/video.
   */
  isActive: boolean;
  /**
   * Whether the video should be muted.
   */
  isMuted?: boolean;
  /**
   * Callback when the iframe loads.
   */
  onLoad?: () => void;
  /**
   * Callback when iframe errors.
   */
  onError?: () => void;
  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * YouTube Player Component
 * Uses iframe embed with proper 2024 parameters (no deprecated modestbranding)
 */
function YouTubePlayerComponent({
  videoId,
  isActive,
  isMuted = true,
  onLoad,
  onError,
  className = '',
}: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const buildIframeUrl = useCallback(
    (id: string) => {
      const params = new URLSearchParams({
        autoplay: '1',
        mute: '1',
        controls: '0',
        rel: '0',
        loop: '1',
        playlist: id,
        enablejsapi: '1',
        playsinline: '1',
        fs: '0',
        iv_load_policy: '3',
        disablekb: '1',
      });

      return `https://www.youtube.com/embed/${id}?${params.toString()}`;
    },
    []
  );

  const iframeSrc = useMemo(() => buildIframeUrl(videoId), [buildIframeUrl, videoId]);
  const iframeKey = useMemo(() => `${videoId}-${reloadKey}`, [videoId, reloadKey]);

  const sendCommand = useCallback(
    (command: 'playVideo' | 'pauseVideo' | 'mute' | 'unMute', attempt: number = 1) => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      try {
        iframe.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: '',
          }),
          '*'
        );

        if (command === 'playVideo' && attempt < 3) {
          setTimeout(() => sendCommand(command, attempt + 1), attempt * 400);
        }
      } catch (error) {
        console.warn('Failed to control YouTube player:', error);
      }
    },
    []
  );

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      sendCommand(isActive ? 'playVideo' : 'pauseVideo');
    }, 150);
    return () => clearTimeout(timer);
  }, [isActive, isLoaded, sendCommand]);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      sendCommand(isMuted ? 'mute' : 'unMute');
    }, 150);
    return () => clearTimeout(timer);
  }, [isMuted, isLoaded, sendCommand]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [videoId, reloadKey]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleRetry = () => {
    setHasError(false);
    setReloadKey(prev => prev + 1);
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center p-6">
          <p className="text-white mb-4">Failed to load video</p>
          <button
            onClick={handleRetry}
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
      {(!isLoaded || !isActive) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          {isLoaded ? (
            <div className="text-white text-sm">Ready to play</div>
          ) : (
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      <iframe
        key={iframeKey}
        ref={iframeRef}
        src={iframeSrc}
        title="YouTube video player"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ border: 'none' }}
      />

      <div className="absolute inset-0 pointer-events-none z-10">
        <div
          className="absolute top-0 left-0 w-[200px] h-[70px] bg-gradient-to-r from-black via-black/95 to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 right-0 w-[200px] h-[70px] bg-gradient-to-l from-black via-black/95 to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-black via-black/90 to-transparent"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export const YouTubePlayer = memo(YouTubePlayerComponent);
