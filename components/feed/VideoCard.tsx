'use client';

/**
 * Video Card component - displays a movie with trailer or poster fallback
 */

import { memo, useCallback } from 'react';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { VideoOverlay } from './VideoOverlay';
import { useMutePreference } from '@/hooks/useMutePreference';
import { computeTMDBImageUrl } from '@/lib/utils/feed';
import type { MovieWithTrailer } from '@/types/feed.types';
import Image from 'next/image';

interface VideoCardProps {
  movie: MovieWithTrailer;
  isActive: boolean;
  index?: number;
  onMovieClick?: (movie: MovieWithTrailer) => void;
  registerCard?: (index: number, node: HTMLElement | null) => void;
  unregisterCard?: (index: number) => void;
  shouldRenderPlayer?: boolean;
}

/**
 * Video Card Component
 * Shows YouTube trailer if available, otherwise shows poster with fallback message
 */
function VideoCardComponent({
  movie,
  isActive,
  index = 0,
  onMovieClick,
  registerCard,
  unregisterCard,
  shouldRenderPlayer = true,
}: VideoCardProps) {
  const { isMuted, toggleMute } = useMutePreference();

  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        registerCard?.(index, node);
      } else {
        unregisterCard?.(index);
      }
    },
    [registerCard, unregisterCard, index]
  );

  const handleMovieClick = useCallback(() => {
    onMovieClick?.(movie);
  }, [movie, onMovieClick]);

  const posterUrl = computeTMDBImageUrl(movie.poster_path, 'w780');
  const backdropUrl = computeTMDBImageUrl(movie.backdrop_path, 'w1280');

  // Prioritize loading first 3 images for better LCP
  const shouldPrioritize = index < 3;

  const showVideo = Boolean(movie.trailerId && shouldRenderPlayer);
  const videoUrl = movie.trailerId ? `https://www.youtube.com/watch?v=${movie.trailerId}` : '';

  return (
    <div
      ref={handleRef}
      className="relative w-full h-screen flex-shrink-0 snap-start bg-black"
    >
      {showVideo ? (
        <VideoPlayer
          url={videoUrl}
          isActive={isActive}
          autoplay={true}
          isMuted={isMuted}
          className="w-full h-full"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Background image with blur */}
          {backdropUrl && (
            <div className="absolute inset-0">
              <Image
                src={backdropUrl}
                alt=""
                fill
                className="object-cover opacity-40 blur-sm"
                priority={shouldPrioritize}
              />
            </div>
          )}

          <div className="relative z-10 max-w-md w-full mx-auto p-6">
            {posterUrl ? (
              <div className="relative aspect-[2/3] w-full mb-6 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority={shouldPrioritize}
                />
              </div>
            ) : (
              <div className="aspect-[2/3] w-full mb-6 rounded-lg bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500">No poster available</span>
              </div>
            )}

            <div className="text-center">
              <p className="text-white/60 mb-4">
                {movie.trailerId
                  ? 'Loading preview...'
                  : 'No trailer available for this movie'}
              </p>
              <button
                onClick={handleMovieClick}
                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      <VideoOverlay
        movie={movie}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onMovieClick={handleMovieClick}
      />
    </div>
  );
}

/**
 * Custom memo comparator for VideoCard
 * Only re-render if meaningful props changed (movie ID, active state, render flag)
 */
function arePropsEqual(
  prevProps: Readonly<VideoCardProps>,
  nextProps: Readonly<VideoCardProps>
): boolean {
  return (
    prevProps.movie.id === nextProps.movie.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.shouldRenderPlayer === nextProps.shouldRenderPlayer &&
    prevProps.index === nextProps.index &&
    prevProps.onMovieClick === nextProps.onMovieClick &&
    prevProps.registerCard === nextProps.registerCard &&
    prevProps.unregisterCard === nextProps.unregisterCard
  );
}

export const VideoCard = memo(VideoCardComponent, arePropsEqual);
