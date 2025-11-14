'use client';

/**
 * Video overlay component showing movie metadata and controls
 */

import { memo } from 'react';
import type { MovieWithTrailer } from '@/types/feed.types';

interface VideoOverlayProps {
  movie: MovieWithTrailer;
  isMuted: boolean;
  onToggleMute: () => void;
  onMovieClick?: () => void;
}

/**
 * Video Overlay Component
 * Shows movie title, genres, rating with gradient background for readability
 */
function VideoOverlayComponent({
  movie,
  isMuted,
  onToggleMute,
  onMovieClick,
}: VideoOverlayProps) {
  // Format rating to 1 decimal place
  const rating = movie.vote_average?.toFixed(1) ?? 'N/A';

  // Get year from release date
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'TBA';

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top gradient for better text readability */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />

      {/* Bottom gradient with content */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-8">
        <div className="max-w-2xl">
          {/* Movie Title */}
          <h2
            className="text-white text-2xl font-bold mb-2 drop-shadow-lg cursor-pointer hover:text-gray-200 transition-colors pointer-events-auto"
            onClick={onMovieClick}
          >
            {movie.title}
          </h2>

          {/* Year and Rating */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-gray-300 text-sm">{year}</span>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white text-sm font-medium">{rating}</span>
            </div>
          </div>

          {/* Genres */}
          {movie.genresDisplay && movie.genresDisplay.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genresDisplay.filter(Boolean).map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mute/Unmute Button - Top Right */}
      <button
        onClick={onToggleMute}
        className="absolute top-6 right-6 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors pointer-events-auto"
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      >
        {isMuted ? (
          // Muted icon
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        ) : (
          // Unmuted icon
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export const VideoOverlay = memo(VideoOverlayComponent);
