/**
 * Error handling utilities for TMDB API and application errors
 */

import {
  ApiError,
  NetworkError,
  ApiAuthenticationError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  BadRequestError,
  UnknownApiError,
  isApiError,
  isNetworkError,
  isAuthenticationError,
  isNotFoundError,
  isRateLimitError,
  isServiceUnavailableError,
} from '@/types/error.types';

/**
 * Transform any error into a user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    switch (error.constructor) {
      case ApiAuthenticationError:
        return 'There\'s a problem with the API configuration. Please check your settings.';
      case NotFoundError:
        return 'The requested movie or data could not be found.';
      case RateLimitError:
        return 'Too many requests. Please wait a moment and try again.';
      case ServiceUnavailableError:
        return 'The movie service is temporarily unavailable. Please try again later.';
      case NetworkError:
        return 'Network connection failed. Please check your internet connection.';
      case BadRequestError:
        return 'Invalid request. Please try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return 'Network connection failed. Please check your internet connection.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle API errors with appropriate user actions
 */
export function handleApiError(error: unknown): {
  message: string;
  shouldRetry: boolean;
  retryDelay?: number;
  userAction?: string;
} {
  if (isAuthenticationError(error)) {
    return {
      message: getErrorMessage(error),
      shouldRetry: false,
      userAction: 'Please check your API configuration.',
    };
  }

  if (isNotFoundError(error)) {
    return {
      message: getErrorMessage(error),
      shouldRetry: false,
      userAction: 'Try searching for a different movie.',
    };
  }

  if (isRateLimitError(error)) {
    return {
      message: getErrorMessage(error),
      shouldRetry: true,
      retryDelay: error.retryAfter ? error.retryAfter * 1000 : 5000,
      userAction: 'Please wait a moment before trying again.',
    };
  }

  if (isServiceUnavailableError(error)) {
    return {
      message: getErrorMessage(error),
      shouldRetry: true,
      retryDelay: 10000,
      userAction: 'The service is temporarily down, please try again in a few moments.',
    };
  }

  if (isNetworkError(error)) {
    return {
      message: getErrorMessage(error),
      shouldRetry: true,
      retryDelay: 2000,
      userAction: 'Check your internet connection and try again.',
    };
  }

  if (isApiError(error)) {
    return {
      message: getErrorMessage(error),
      shouldRetry: error.statusCode >= 500,
      retryDelay: 5000,
      userAction: 'Please try again later.',
    };
  }

  return {
    message: getErrorMessage(error),
    shouldRetry: false,
    userAction: 'Please refresh the page and try again.',
  };
}

/**
 * Create a safe error handler for React components
 */
export function createErrorHandler(
  onError?: (error: Error, errorInfo: { message: string; shouldRetry: boolean }) => void
) {
  return (error: unknown) => {
    const errorInfo = handleApiError(error);
    const errorObj = error instanceof Error ? error : new Error(String(error));

    onError?.(errorObj, errorInfo);

    // Log error for debugging
    console.error('API Error:', error);

    return errorInfo;
  };
}

/**
 * Check if an error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  return handleApiError(error).shouldRetry;
}

/**
 * Get suggested retry delay for an error
 */
export function getRetryDelay(error: unknown): number {
  return handleApiError(error).retryDelay || 1000;
}

/**
 * Wrap async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    onError?: (error: unknown) => void;
    fallbackValue?: T;
    retries?: number;
  } = {}
): Promise<T> {
  const { onError, fallbackValue, retries = 0 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        onError?.(error);
        if (fallbackValue !== undefined) {
          return fallbackValue;
        }
        throw error;
      }

      // Only retry if error is recoverable
      if (!isRecoverableError(error)) {
        onError?.(error);
        if (fallbackValue !== undefined) {
          return fallbackValue;
        }
        throw error;
      }

      // Wait before retry
      const delay = getRetryDelay(error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}