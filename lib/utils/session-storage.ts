/**
 * Session Storage utilities for client-side persistence
 * All functions are safe to use in both client and server components
 */

import type { FeedContentType } from '@/types/feed.types';

const CONTENT_TYPE_KEY = 'cineswipe-content-type';
const DEFAULT_CONTENT_TYPE: FeedContentType = 'movie';

/**
 * Get the selected content type from session storage
 * Returns default content type if not set
 */
export function getContentType(): FeedContentType {
  if (typeof window === 'undefined') {
    return DEFAULT_CONTENT_TYPE;
  }

  try {
    const stored = sessionStorage.getItem(CONTENT_TYPE_KEY);
    if (stored && ['movie', 'tv', 'anime'].includes(stored)) {
      return stored as FeedContentType;
    }
  } catch (error) {
    console.warn('Failed to read content type from session storage:', error);
  }

  return DEFAULT_CONTENT_TYPE;
}

/**
 * Set the selected content type in session storage
 */
export function setContentType(type: FeedContentType): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(CONTENT_TYPE_KEY, type);
  } catch (error) {
    console.warn('Failed to save content type to session storage:', error);
  }
}

/**
 * Clear the content type from session storage
 */
export function clearContentType(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(CONTENT_TYPE_KEY);
  } catch (error) {
    console.warn('Failed to clear content type from session storage:', error);
  }
}
