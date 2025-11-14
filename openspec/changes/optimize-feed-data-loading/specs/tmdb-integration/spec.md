# TMDB Integration Specification - Delta

## ADDED Requirements

### Requirement: Server-Side Feed Aggregation Route Handler
The system SHALL provide a Next.js Route Handler at `/api/feed/trending` that aggregates TMDB movie data with trailers server-side, enabling optimized feed loading with caching.

#### Scenario: Route Handler endpoint exists
- **GIVEN** the application is deployed
- **WHEN** client requests `GET /api/feed/trending`
- **THEN** Route Handler returns aggregated feed data in JSON format

#### Scenario: Accept pagination parameters
- **GIVEN** client needs a specific page of trending movies
- **WHEN** client requests `/api/feed/trending?page=2`
- **THEN** server fetches and returns data for page 2 from TMDB

#### Scenario: Fetch trending movies from TMDB
- **GIVEN** Route Handler receives request for page 1
- **WHEN** processing the request
- **THEN** server calls TMDB `/trending/movie/day?page=1` to get trending list

#### Scenario: Parallel movie details with videos
- **GIVEN** server has list of 10 trending movies
- **WHEN** aggregating feed data
- **THEN** server executes 10 parallel requests to `/movie/{id}?append_to_response=videos` without client-side rate limits

#### Scenario: Transform TMDB data for feed format
- **GIVEN** server receives raw TMDB responses
- **WHEN** preparing API response
- **THEN** server transforms data into FeedMovie format with computed image URLs and extracted best trailers

#### Scenario: ISR caching configuration
- **GIVEN** Route Handler is configured with `export const revalidate = 3600`
- **WHEN** Next.js serves requests
- **THEN** responses are cached for 1 hour and revalidated in background

#### Scenario: Stale-while-revalidate behavior
- **GIVEN** cached response exists but is stale
- **WHEN** request arrives during revalidation
- **THEN** server serves stale cache immediately while fetching fresh data in background

#### Scenario: Handle TMDB API errors gracefully
- **GIVEN** TMDB API returns 500 error during aggregation
- **WHEN** processing feed request
- **THEN** Route Handler returns appropriate error response with status code and message

#### Scenario: Return typed response format
- **GIVEN** Route Handler successfully aggregates data
- **WHEN** returning response
- **THEN** response follows FeedApiResponse type with movies array, pagination metadata, and status

### Requirement: Server-Side Utility for Batch Movie Fetching
The system SHALL provide server-side utility functions for efficiently fetching and processing multiple movies with videos in parallel.

#### Scenario: Batch fetch movies with videos
- **GIVEN** array of movie IDs [123, 456, 789]
- **WHEN** calling `fetchMoviesWithVideos(ids)`
- **THEN** function returns array of MovieDetails with videos, handling partial failures gracefully

#### Scenario: Handle append_to_response parameter
- **GIVEN** server needs movie details with videos
- **WHEN** fetching from TMDB
- **THEN** utility uses `append_to_response=videos` to reduce request count

#### Scenario: Extract best trailer from videos
- **GIVEN** movie has multiple video entries
- **WHEN** processing video data
- **THEN** utility extracts best YouTube trailer using priority logic (official trailer > official > any trailer)

## MODIFIED Requirements

### Requirement: Movie Data Fetching
The system SHALL provide functions to fetch movie data from TMDB endpoints both client-side and server-side, with server-side functions supporting batch operations and append_to_response.

#### Scenario: Fetch movie with trailers
- **GIVEN** a movie ID exists in TMDB
- **WHEN** the application requests movie details with videos
- **THEN** it returns movie metadata and an array of video objects including trailers

#### Scenario: Fetch similar movies for recommendations
- **GIVEN** a user likes a specific movie
- **WHEN** the application requests similar movies
- **THEN** it returns an array of related movies with basic metadata

#### Scenario: Server-side batch movie details fetch
- **GIVEN** server needs details for multiple movies
- **WHEN** using `getMovieById` with `append_to_response=videos`
- **THEN** function returns MovieDetails with embedded videos array in single request

## REMOVED Requirements

None. All existing requirements are preserved, with additions for server-side capabilities.
