# tmdb-integration Specification

## Purpose
TBD - created by archiving change setup-initial-architecture. Update Purpose after archive.
## Requirements
### Requirement: TMDB API Client
The system SHALL provide a TMDB API client that handles authentication, request construction, and error handling for all TMDB API interactions.

#### Scenario: Fetch trending movies
- **GIVEN** the API client is configured with a valid API key
- **WHEN** a request is made to fetch trending movies
- **THEN** the client constructs the correct URL with authentication and returns typed response data

#### Scenario: Handle API rate limiting
- **GIVEN** the application makes multiple API requests
- **WHEN** TMDB rate limit is approached (40 requests per 10 seconds)
- **THEN** the client implements appropriate throttling or queuing to avoid errors

#### Scenario: Handle network errors
- **GIVEN** a TMDB API request is made
- **WHEN** a network error occurs
- **THEN** the client throws a descriptive error that can be caught and handled by calling code

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

### Requirement: Genre Metadata
The system SHALL fetch and cache genre definitions from TMDB `/genre/movie/list` endpoint to enable genre-based filtering and display.

#### Scenario: Load genre list on application start
- **GIVEN** the application initializes
- **WHEN** genre data is needed for the first time
- **THEN** it fetches the genre list from TMDB and caches it locally

#### Scenario: Map genre IDs to names
- **GIVEN** a movie has genre IDs [28, 12, 878]
- **WHEN** displaying the movie information
- **THEN** the system maps these IDs to genre names ["Action", "Adventure", "Science Fiction"]

### Requirement: Response Type Safety
The system SHALL provide TypeScript types for all TMDB API responses to ensure type safety throughout the application.

#### Scenario: Type-safe movie data handling
- **GIVEN** a function receives movie data from the API
- **WHEN** it accesses movie properties
- **THEN** TypeScript validates property names and types at compile time

#### Scenario: Invalid API response structure
- **GIVEN** the TMDB API returns an unexpected response structure
- **WHEN** the response is parsed
- **THEN** the type system or runtime validation catches the mismatch and prevents silent failures

### Requirement: Error Handling
The system SHALL provide standardized error handling for TMDB API failures with clear error messages and error types.

#### Scenario: Invalid API key
- **GIVEN** the API key is missing or invalid
- **WHEN** any TMDB API request is made
- **THEN** a clear authentication error is thrown with instructions to check environment configuration

#### Scenario: Movie not found
- **GIVEN** a request is made for a non-existent movie ID
- **WHEN** the API returns 404
- **THEN** a NotFoundError is thrown that can be caught and handled appropriately

#### Scenario: API service unavailable
- **GIVEN** TMDB API is temporarily down
- **WHEN** a request is made
- **THEN** a ServiceUnavailableError is thrown with retry suggestions

### Requirement: Watch Provider Integration
The system SHALL fetch streaming availability data from TMDB `/movie/{id}/watch/providers` endpoint to show users where content can be watched.

#### Scenario: Fetch watch providers for a movie
- **GIVEN** a movie is displayed
- **WHEN** the user views where to watch
- **THEN** the system returns a list of streaming services with links organized by region

#### Scenario: No watch providers available
- **GIVEN** a movie has no streaming availability
- **WHEN** watch provider data is requested
- **THEN** the system returns an empty list and UI shows appropriate message

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

