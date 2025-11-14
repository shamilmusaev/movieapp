'use client';

import React, { useEffect, useState } from 'react';
import { checkApiHealth, getTrendingMovies, getMovieGenres } from '@/lib/api/tmdb';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Loading } from '@/components/Loading';

export default function TestApiPage() {
  const [results, setResults] = useState<{
    healthCheck: boolean | null;
    trendingMovies: any | null;
    genres: any | null;
    error: string | null;
  }>({
    healthCheck: null,
    trendingMovies: null,
    genres: null,
    error: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setResults({ healthCheck: null, trendingMovies: null, genres: null, error: null });

    try {
      // Test 1: Health check
      const health = await checkApiHealth();
      setResults(prev => ({ ...prev, healthCheck: health }));

      // Test 2: Get trending movies
      const trending = await getTrendingMovies();
      setResults(prev => ({ ...prev, trendingMovies: trending }));

      // Test 3: Get genres
      const genres = await getMovieGenres();
      setResults(prev => ({ ...prev, genres: genres }));

    } catch (error) {
      setResults(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error)
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">TMDB API Test</h1>

          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Running Tests...' : 'Run Tests Again'}
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loading message="Testing API connectivity..." size="large" />
            </div>
          )}

          {!isLoading && (
            <div className="space-y-6">
              {/* Health Check */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">API Health Check</h2>
                {results.healthCheck === null ? (
                  <p className="text-gray-500">Not tested</p>
                ) : results.healthCheck ? (
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-green-700">API is accessible</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-red-700">API is not accessible</span>
                  </div>
                )}
              </div>

              {/* Trending Movies */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Trending Movies</h2>
                {results.trendingMovies === null ? (
                  <p className="text-gray-500">Not tested</p>
                ) : (
                  <div>
                    <div className="flex items-center mb-4">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-green-700">
                        Successfully fetched {results.trendingMovies.results.length} movies
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Page: {results.trendingMovies.page}</p>
                      <p>Total Results: {results.trendingMovies.total_results}</p>
                      <p>Total Pages: {results.trendingMovies.total_pages}</p>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Sample Movies:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.trendingMovies.results.slice(0, 4).map((movie: any) => (
                          <div key={movie.id} className="border rounded p-3">
                            <p className="font-medium">{movie.title}</p>
                            <p className="text-sm text-gray-600">
                              Rating: {movie.vote_average} • {movie.release_date}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Movie Genres</h2>
                {results.genres === null ? (
                  <p className="text-gray-500">Not tested</p>
                ) : (
                  <div>
                    <div className="flex items-center mb-4">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-green-700">
                        Successfully fetched {results.genres.length} genres
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {results.genres.slice(0, 8).map((genre: any) => (
                        <div key={genre.id} className="bg-gray-100 rounded px-3 py-1 text-sm">
                          {genre.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {results.error && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 text-red-700">Error</h2>
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-800">{results.error}</p>
                  </div>
                </div>
              )}

              {/* Environment Variables */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">API Key:</span>{' '}
                    <span className={process.env.NEXT_PUBLIC_TMDB_API_KEY ? 'text-green-700' : 'text-red-700'}>
                      {process.env.NEXT_PUBLIC_TMDB_API_KEY ? '✓ Configured' : '✗ Missing'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Base URL:</span>{' '}
                    <span className="text-gray-600">
                      {process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}