'use client';

/**
 * Video Card component - displays a movie with trailer or poster fallback
 */

import { memo, useCallback } from 'react';
import { YouTubePlayer } from '@/components/video/YouTubePlayer';
import { VideoOverlay } from './VideoOverlay';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useVideoIntersection } from '@/hooks/useVideoIntersection';
import { computeTMDBImageUrl } from '@/lib/utils/feed';
import type { MovieWithTrailer } from '@/types/feed.types';
import Image from 'next/image';

interface VideoCardProps {
  movie: MovieWithTrailer;
  isActive: boolean;
  autoplay?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  onMovieClick?: (movie: MovieWithTrailer) => void;
}

/**
 * Video Card Component
 * Shows YouTube trailer if available, otherwise shows poster with fallback message
 */
function VideoCardComponent({
  movie,
  isActive,
  autoplay = false,
  onVisibilityChange,
  onMovieClick,
}: VideoCardProps) {
  const { isMuted, toggleMute } = useVideoPlayer({
    videoId: movie.trailerId || '',
    autoplay,
    globalAutoplay: autoplay && isActive,
  });

  // Track visibility with Intersection Observer
  const { ref } = useVideoIntersection({
    threshold: 0.5,
    rootMargin: '100px', // Start loading slightly before visible
    onVisibilityChange: (visible, ratio) => {
      console.log('👁️ Visibility changed for', movie.title, '- visible:', visible, 'ratio:', ratio);
      onVisibilityChange?.(visible);
    },
  });

  const handleMovieClick = useCallback(() => {
    onMovieClick?.(movie);
  }, [movie, onMovieClick]);

  const posterUrl = computeTMDBImageUrl(movie.poster_path, 'w780');
  const backdropUrl = computeTMDBImageUrl(movie.backdrop_path, 'w1280');

  // If movie has trailer, show video player
  if (movie.trailerId) {
    return (
      <div
        ref={ref}
        className="relative w-full h-screen flex-shrink-0 snap-start bg-black"
      >
        <YouTubePlayer
          videoId={movie.trailerId}
          autoplay={isActive}
          isActive={isActive}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          className="w-full h-full"
        />

        <VideoOverlay
          movie={movie}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onMovieClick={handleMovieClick}
        />
      </div>
    );
  }

  // Fallback: Show poster if no trailer available
  return (
    <div
      ref={ref}
      className="relative w-full h-screen flex-shrink-0 snap-start bg-black flex items-center justify-center"
    >
      {/* Background image with blur */}
      {backdropUrl && (
        <div className="absolute inset-0">
          <Image
            src={backdropUrl}
            alt=""
            fill
            className="object-cover opacity-40 blur-sm"
            priority={isActive}
          />
        </div>
      )}

      {/* Poster */}
      <div className="relative z-10 max-w-md w-full mx-auto p-6">
        {posterUrl ? (
          <div className="relative aspect-[2/3] w-full mb-6 rounded-lg overflow-hidden shadow-2xl">
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover"
              priority={isActive}
            />
          </div>
        ) : (
          <div className="aspect-[2/3] w-full mb-6 rounded-lg bg-gray-800 flex items-center justify-center">
            <span className="text-gray-500">No poster available</span>
          </div>
        )}

        {/* No trailer message */}
        <div className="text-center">
          <p className="text-white/60 mb-4">No trailer available for this movie</p>
          <button
            onClick={handleMovieClick}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            View Details
          </button>
        </div>
      </div>

      <VideoOverlay
        movie={movie}
        isMuted={true}
        onToggleMute={() => {}}
        onMovieClick={handleMovieClick}
      />
    </div>
  );
}

export const VideoCard = memo(VideoCardComponent);
