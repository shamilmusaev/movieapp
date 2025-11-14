/**
 * Custom error classes for TMDB API and application error handling
 */

// Base API error class
export abstract class ApiError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Authentication error (401)
export class ApiAuthenticationError extends ApiError {
  readonly statusCode = 401;
  readonly code = 'API_AUTHENTICATION_ERROR';

  constructor(message = 'Invalid API key or authentication failed', context?: Record<string, unknown>) {
    super(message, context);
  }
}

// Not found error (404)
export class NotFoundError extends ApiError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND_ERROR';

  constructor(message = 'Resource not found', context?: Record<string, unknown>) {
    super(message, context);
  }
}

// Rate limit error (429)
export class RateLimitError extends ApiError {
  readonly statusCode = 429;
  readonly code = 'RATE_LIMIT_ERROR';

  constructor(message = 'API rate limit exceeded', public readonly retryAfter?: number, context?: Record<string, unknown>) {
    super(message, context);
  }
}

// Server error (5xx)
export class ServiceUnavailableError extends ApiError {
  readonly statusCode = 503;
  readonly code = 'SERVICE_UNAVAILABLE_ERROR';

  constructor(message = 'TMDB service temporarily unavailable', context?: Record<string, unknown>) {
    super(message, context);
  }
}

// Network connectivity error
export class NetworkError extends ApiError {
  readonly statusCode = 0;
  readonly code = 'NETWORK_ERROR';

  constructor(message = 'Network connection failed', public readonly originalError?: Error, context?: Record<string, unknown>) {
    super(message, context);
  }
}

// Bad request error (400)
export class BadRequestError extends ApiError {
  readonly statusCode = 400;
  readonly code = 'BAD_REQUEST_ERROR';

  constructor(message = 'Invalid request parameters', context?: Record<string, unknown>) {
    super(message, context);
  }
}

// Generic API error for unexpected status codes
export class UnknownApiError extends ApiError {
  readonly statusCode: number;
  readonly code = 'UNKNOWN_API_ERROR';

  constructor(statusCode: number, message = 'Unknown API error occurred', context?: Record<string, unknown>) {
    super(message, context);
    this.statusCode = statusCode;
  }
}

// Error type guard functions
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAuthenticationError(error: unknown): error is ApiAuthenticationError {
  return error instanceof ApiAuthenticationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isServiceUnavailableError(error: unknown): error is ServiceUnavailableError {
  return error instanceof ServiceUnavailableError;
}

// Error response type from TMDB API
export interface TmdbErrorResponse {
  status_code: number;
  status_message: string;
  success: false;
}

// Function to create appropriate error from TMDB response
export function createErrorFromResponse(response: TmdbErrorResponse): ApiError {
  switch (response.status_code) {
    case 401:
      return new ApiAuthenticationError(response.status_message);
    case 404:
      return new NotFoundError(response.status_message);
    case 429:
      return new RateLimitError(response.status_message);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServiceUnavailableError(response.status_message);
    default:
      return new UnknownApiError(response.status_code, response.status_message);
  }
}