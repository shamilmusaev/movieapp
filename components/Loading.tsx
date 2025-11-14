import React from 'react';
import { LOADING_MESSAGES } from '@/lib/utils/constants';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  center?: boolean;
  className?: string;
}

export function Loading({
  message = 'Loading...',
  size = 'medium',
  center = true,
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClasses = center
    ? 'flex flex-col items-center justify-center'
    : 'flex flex-col items-center';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-blue-600`}></div>

        {/* Optional inner spinner for better visual effect */}
        <div className={`${sizeClasses[size]} absolute top-0 animate-spin rounded-full border-2 border-transparent border-r-gray-400`}></div>
      </div>

      {message && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

// Specific loading components for different contexts
export function MovieCardLoading() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-64"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export function MovieGridLoading({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <MovieCardLoading key={i} />
      ))}
    </div>
  );
}

export function FullPageLoading({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loading
          message={message || LOADING_MESSAGES.FETCHING_MOVIES}
          size="large"
        />
      </div>
    </div>
  );
}

export function InlineLoading({ message }: { message?: string }) {
  return (
    <div className="py-8 flex justify-center">
      <Loading
        message={message}
        size="medium"
        center={false}
      />
    </div>
  );
}

// Skeleton loading components
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{
            width: i === lines - 1 ? '75%' : '100%' // Last line shorter
          }}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden animate-pulse ${className}`}>
      <div className="bg-gray-200 h-48"></div>
      <div className="p-4">
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

// Loading overlay for async operations
export function LoadingOverlay({
  isLoading,
  message,
  children
}: {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <Loading message={message} size="medium" center={false} />
        </div>
      )}
    </div>
  );
}

// Progress bar for loading states
export function ProgressBar({
  progress = 0,
  className = ''
}: {
  progress?: number;
  className?: string;
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${clampedProgress}%` }}
      ></div>
    </div>
  );
}