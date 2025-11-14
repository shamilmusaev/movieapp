/**
 * TMDB API client with error handling, rate limiting, and caching
 */

import {
  ApiError,
  NetworkError,
  UnknownApiError,
  createErrorFromResponse,
  isApiError
} from '@/types/error.types';
import { ApiResponse } from '@/types/api.types';
import {
  getTmdbEnvConfig,
  RATE_LIMIT_CONFIG,
  CACHE_CONFIG
} from './config';

// Request queue for rate limiting
class RequestQueue {
  private lastRequestTime = 0;
  private queue: Array<() => Promise<any>> = [];

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minDelay = RATE_LIMIT_CONFIG.MIN_DELAY_BETWEEN_REQUESTS;

    if (timeSinceLastRequest < minDelay) {
      setTimeout(() => this.processQueue(), minDelay - timeSinceLastRequest);
      return;
    }

    const request = this.queue.shift();
    if (request) {
      this.lastRequestTime = Date.now();
      // Don't wait for the request to complete, just fire it
      request().catch(() => {
        // Error handling is done by the individual caller
      });

      // Process next request after a short delay
      setTimeout(() => this.processQueue(), minDelay);
    }
  }
}

const requestQueue = new RequestQueue();

/**
 * Make a fetch request to the TMDB API with proper error handling
 */
export async function tmdbFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const { apiKey, baseUrl } = getTmdbEnvConfig();
  const url = `${baseUrl}${endpoint}`;

  const defaultHeaders = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    next: {
      revalidate: 3600, // Default cache time of 1 hour
      ...options.next,
    },
  };

  return requestQueue.add(async () => {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        // Try to parse error response from TMDB
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // If we can't parse the error, create a generic one
          throw new UnknownApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
        }

        throw createErrorFromResponse(errorData);
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      if (isApiError(error)) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed', error);
      }

      throw error;
    }
  });
}

/**
 * Wrapper for GET requests with automatic caching
 */
export async function tmdbGet<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  cacheConfig?: { revalidate?: number; tags?: string[] }
): Promise<T> {
  const searchParams = new URLSearchParams();

  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  const response = await tmdbFetch<T>(url, {
    method: 'GET',
    next: cacheConfig,
  });

  return response.data;
}

/**
 * Retry logic for failed requests
 */
export async function tmdbFetchWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  maxRetries: number = RATE_LIMIT_CONFIG.RETRY_ATTEMPTS
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await tmdbFetch<T>(endpoint, options);
      return response.data;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof ApiError) {
        if (error.statusCode === 401 || error.statusCode === 404 || error.statusCode === 422) {
          throw error;
        }
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = RATE_LIMIT_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Check if the API is accessible
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    await tmdbGet('/configuration', {}, { revalidate: 300 }); // 5 minute cache
    return true;
  } catch {
    return false;
  }
}