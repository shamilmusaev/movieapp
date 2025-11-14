'use client';

/**
 * Hook for handling streaming feed data with Server-Sent Events
 * Provides immediate UI updates as movies become available
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MovieWithTrailer, FeedState, FeedContentType } from '@/types/feed.types';

interface UseStreamingFeedDataReturn extends FeedState {
  retry: () => Promise<void>;
  cancel: () => void;
  loadMore: () => void;
  streamingStatus?: string;
  setContentType: (type: FeedContentType) => void;
}

/**
 * Custom hook for managing streaming feed data with progressive loading
 * Uses Server-Sent Events to show content immediately
 */
export function useStreamingFeedData(initialContentType: FeedContentType = 'movie'): UseStreamingFeedDataReturn {
  const [contentType, setContentType] = useState<FeedContentType>(initialContentType);
  
  // Independent state for each content type
  const [allStates, setAllStates] = useState<Record<FeedContentType, FeedState>>({
    movie: {
      movies: [],
      loading: true,
      error: null,
      hasMore: true,
      page: 1,
      viewedMovieIds: new Set<number>(),
    },
    tv: {
      movies: [],
      loading: true,
      error: null,
      hasMore: true,
      page: 1,
      viewedMovieIds: new Set<number>(),
    },
    anime: {
      movies: [],
      loading: true,
      error: null,
      hasMore: true,
      page: 1,
      viewedMovieIds: new Set<number>(),
    },
  });

  const [streamingStatus, setStreamingStatus] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start streaming feed data
   */
  const startStreaming = useCallback(
    async (page: number = 1) => {

      
      // Cancel any existing connection
      cancel();
      
      // Reset state for new stream
      setAllStates(prev => ({
        ...prev,
        [contentType]: {
          ...prev[contentType],
          loading: true,
          error: null,
          ...(page === 1 && { movies: [], viewedMovieIds: new Set() })
        }
      }));
      
      setStreamingStatus('connecting');

      // Create EventSource for streaming with content type
      const eventSource = new EventSource(`/api/feed/trending?page=${page}&media_type=${contentType}`);
      eventSourceRef.current = eventSource;

      // Set timeout for connection
      timeoutRef.current = setTimeout(() => {
        if (!eventSource.readyState || eventSource.readyState === EventSource.CONNECTING) {
          console.warn('⏰ Connection timeout');
          setStreamingStatus('timeout');
          eventSource.close();
          setAllStates(prev => ({
            ...prev,
            [contentType]: {
              ...prev[contentType],
              loading: false,
              error: 'Connection timeout'
            }
          }));
        }
      }, 30000); // 30 second timeout

      eventSource.onopen = () => {
        console.log('✅ Streaming connection opened');
        setStreamingStatus('connected');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ Streaming error:', error);
        setStreamingStatus('error');
        setAllStates(prev => ({
          ...prev,
          [contentType]: {
            ...prev[contentType],
            loading: false,
            error: 'Streaming connection failed'
          }
        }));
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        eventSource.close();
      };

      eventSource.addEventListener('start', (event) => {
        try {
          if (!event.data || event.data === '') {
            console.warn('⚠️ Empty start event received');
            return;
          }
          const data = JSON.parse(event.data);
          setStreamingStatus(data.status);
          console.log('📡 Stream started:', data.status);
        } catch (error) {
          console.error('❌ Error parsing start event:', error);
        }
      });

      eventSource.addEventListener('movie', (event) => {
        try {
          if (!event.data || event.data === '') {
            console.warn('⚠️ Empty movie event received');
            return;
          }
          
          const data = JSON.parse(event.data);
          const { movie, index, total, type } = data;
          
          console.log(`🎬 Received ${type} movie ${index + 1}/${total}:`, movie.title);
          
          setAllStates(prev => {
            const currentState = prev[contentType];
            
            // Check if movie already exists (avoid duplicates)
            if (currentState.movies.some(m => m.id === movie.id)) {
              return prev;
            }

            // Add movie to the list
            const newMovies = [...currentState.movies, movie];
            const viewedIds = new Set([...currentState.viewedMovieIds, movie.id]);

            // Update streaming status for progress
            if (type === 'priority' && index === 0) {
              setStreamingStatus('showing_priority');
            } else if (type === 'background') {
              setStreamingStatus(`batch_${data.batch || 1}`);
            }

            return {
              ...prev,
              [contentType]: {
                ...currentState,
                movies: newMovies,
                viewedMovieIds: viewedIds,
                loading: false,
              },
            };
          });
        } catch (error) {
          console.error('❌ Error parsing movie event:', error);
        }
      });

      // Handle status updates
      const statusHandler = (event: MessageEvent) => {
        try {
          if (!event.data || event.data === '') {
            console.warn('⚠️ Empty status event received');
            return;
          }
          
          const data = JSON.parse(event.data);
          setStreamingStatus(data.status);
          console.log('📊 Status update:', data.status);
          
          if (data.status === 'priority_complete') {
            console.log(`✅ Priority batch complete: ${data.count} movies`);
          } else if (data.status === 'batch_complete') {
            console.log(`✅ Batch ${data.batch} complete: ${data.count} movies`);
          }
        } catch (error) {
          console.error('❌ Error parsing status event:', error);
        }
      };

      eventSource.addEventListener('data', statusHandler);

      eventSource.addEventListener('complete', (event) => {
        try {
          if (!event.data || event.data === '') {
            console.warn('⚠️ Empty complete event received');
            return;
          }
          
          const data = JSON.parse(event.data);
          console.log('🎉 Streaming complete:', {
            total: data.movies.length,
            page: data.page,
            hasMore: data.hasMore
          });

          setStreamingStatus('complete');
          
          setAllStates(prev => {
            const currentState = prev[contentType];
            
            // Update final movie list with all processed movies
            const uniqueMovies = data.movies.filter(
              (movie: MovieWithTrailer) => !currentState.movies.some(m => m.id === movie.id)
            );

            const finalMovies = page === 1 
              ? uniqueMovies 
              : [...currentState.movies, ...uniqueMovies];

            const finalViewedIds = new Set([
              ...currentState.viewedMovieIds,
              ...uniqueMovies.map((m: MovieWithTrailer) => m.id)
            ]);

            return {
              ...prev,
              [contentType]: {
                ...currentState,
                movies: finalMovies,
                loading: false,
                page,
                hasMore: data.hasMore,
                viewedMovieIds: finalViewedIds,
              },
            };
          });

          eventSource.close();
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        } catch (error) {
          console.error('❌ Error parsing complete event:', error);
          setAllStates(prev => ({
            ...prev,
            [contentType]: {
              ...prev[contentType],
              loading: false,
              error: 'Failed to process streaming response'
            }
          }));
        }
      });

      eventSource.addEventListener('error', (event: any) => {
        try {
          // EventSource error events may not have data property
          let data = null;
          if (event.data && event.data !== '') {
            data = JSON.parse(event.data);
          }
          
          console.error('❌ Stream error:', data || event);
          setStreamingStatus('error');
          setAllStates(prev => ({
            ...prev,
            [contentType]: {
              ...prev[contentType],
              loading: false,
              error: data?.error || 'Streaming connection failed'
            }
          }));
        } catch (parseError) {
          console.error('❌ Error parsing error event:', parseError);
          setAllStates(prev => ({
            ...prev,
            [contentType]: {
              ...prev[contentType],
              loading: false,
              error: 'Streaming connection failed'
            }
          }));
        }
        eventSource.close();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      });

    },
    [contentType]
  );

  // Reset and reload when content type changes
  useEffect(() => {
    cancel();
    
    // Start streaming for new content type if not loaded yet
    setTimeout(() => {
      startStreaming(1);
    }, 100);
  }, [contentType]);

  /**
   * Load initial streaming feed
   */
  useEffect(() => {
    const currentState = allStates[contentType];
    if (currentState.movies.length === 0) {
      startStreaming(1);
    }
  }, [allStates, contentType, startStreaming]);

  /**
   * Cancel streaming connection
   */
  const cancel = useCallback(() => {

    setStreamingStatus('canceled');
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Retry streaming
   */
  const retry = useCallback(async () => {
    console.log('🔄 Retrying streaming connection');
    cancel();
    const currentState = allStates[contentType];
    setTimeout(() => {
      startStreaming(currentState.page);
    }, 1000); // Small delay before retry
  }, [allStates, contentType, startStreaming, cancel]);

  /**
   * Load more movies (pagination)
   */
  const loadMore = useCallback(async () => {
    const currentState = allStates[contentType];
    if (currentState.loading || !currentState.hasMore) return;
    
    console.log('📄 Loading more movies, current page:', currentState.page);
    await startStreaming(currentState.page + 1);
  }, [allStates, contentType, startStreaming]);

  return {
    ...allStates[contentType],
    streamingStatus,
    loadMore,
    retry,
    cancel,
    setContentType,
  };
}
