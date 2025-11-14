# Feed Data Integration Specification Deltas

## MODIFIED Requirements

### Requirement: Trending Movies as Feed Source
The system SHALL provide trending movie data through a simplified REST API route handler instead of Server-Sent Events, returning complete JSON responses that work seamlessly with SWR's caching and revalidation.

#### Scenario: REST endpoint returns JSON response
- **GIVEN** client requests `/api/feed/trending?page=1&type=movie`
- **WHEN** server processes request
- **THEN** returns JSON object `{ movies: MovieWithTrailer[], hasMore: boolean, page: number }`

#### Scenario: ISR caching reduces TMDB API calls
- **GIVEN** Route Handler configured with `revalidate: 1800`
- **WHEN** multiple requests for same page within 30 minutes
- **THEN** cached response served without calling TMDB

#### Scenario: Simple error responses
- **GIVEN** TMDB API fails or rate limits
- **WHEN** error occurs
- **THEN** Route Handler returns JSON error with appropriate HTTP status code

### Requirement: Feed Data Deduplication
The system SHALL use SWR's built-in caching to prevent duplicate requests instead of manual viewed movie tracking, simplifying client-side code.

#### Scenario: SWR cache prevents duplicate fetches
- **GIVEN** same feed page requested multiple times
- **WHEN** within dedupingInterval (60 seconds)
- **THEN** SWR returns cached data without new API call

#### Scenario: Client-side viewed tracking still works
- **GIVEN** need to track which movies user has seen
- **WHEN** video becomes visible
- **THEN** movie ID added to session storage set (independent of SWR caching)

### Requirement: Feed Performance Optimization
The system SHALL achieve <1s initial load and <100ms subsequent page loads through SWR caching and ISR, eliminating the complexity of Server-Sent Events.

#### Scenario: SWR cache hit returns instantly
- **GIVEN** feed page was recently fetched
- **WHEN** same page requested again
- **THEN** SWR returns cached data in <10ms without network request

#### Scenario: ISR serves cached response fast
- **GIVEN** server-side cache is fresh
- **WHEN** new client requests page
- **THEN** Next.js serves cached response in <50ms

#### Scenario: Parallel fetching when needed
- **GIVEN** user switches to uncached content type
- **WHEN** multiple data dependencies exist
- **THEN** SWR fetches them in parallel without sequential delays

#### Scenario: Background revalidation
- **GIVEN** stale cached data exists
- **WHEN** page is accessed
- **THEN** SWR shows stale data immediately while revalidating in background

## REMOVED Requirements

### Requirement: Server-Side Data Aggregation - EventSource streaming
**Reason:** Server-Sent Events add complexity without proportional benefit. Causes state update storms (20+ rapid setState calls) and cleanup issues. Simple REST + SWR provides better UX through instant cache hits and background revalidation.

**Migration:**
- Remove EventSource creation and management code
- Remove event listeners (start, movie, data, complete, error events)
- Remove streaming-specific state (streamingStatus, eventSourceRef, timeoutRef)
- Replace with simple SWR hook: `useSWRInfinite((index) => `/api/feed/trending?page=${index}`, fetcher)`

### Requirement: Progressive Feed Rendering - Incremental streaming
**Reason:** While progressive rendering from SSE felt nice, it caused performance issues. With server-side aggregation and fast API responses (<500ms), full-page load is instant enough. SWR's stale-while-revalidate provides better perceived performance.

**Migration:**
- Remove incremental state update logic
- Remove skeleton loaders for individual cards (keep page-level loader)
- SWR loads full page at once, which is fast enough with ISR caching

## ADDED Requirements

### Requirement: SWR Integration for Data Fetching
The system SHALL use SWR (stale-while-revalidate) library for all feed data fetching, providing automatic caching, request deduplication, and background revalidation.

#### Scenario: useSWRInfinite for pagination
- **GIVEN** feed needs infinite scroll
- **WHEN** implementing data fetching
- **THEN** use useSWRInfinite hook with key function `(index) => `/api/feed/trending?page=${index + 1}&type=${type}`

#### Scenario: Automatic caching across renders
- **GIVEN** component unmounts and remounts
- **WHEN** data is requested
- **THEN** SWR returns cached data instantly if still fresh

#### Scenario: Request deduplication
- **GIVEN** multiple components request same data simultaneously
- **WHEN** requests fire
- **THEN** SWR makes single API call and shares result

#### Scenario: Stale-while-revalidate pattern
- **GIVEN** cached data becomes stale
- **WHEN** data is accessed
- **THEN** SWR shows stale data immediately while fetching fresh data in background

#### Scenario: Background revalidation on focus
- **GIVEN** user returns to tab after being away
- **WHEN** window gains focus (configurable: revalidateOnFocus)
- **THEN** SWR optionally revalidates data to ensure freshness

### Requirement: SWR Configuration for Feed UX
The system SHALL configure SWR with appropriate options (revalidateOnFocus: false, dedupingInterval: 60000) to optimize feed performance and reduce unnecessary API calls.

#### Scenario: Disable revalidate on focus for feeds
- **GIVEN** feed data doesn't change frequently
- **WHEN** configuring SWR
- **THEN** set revalidateOnFocus: false to prevent unnecessary revalidation

#### Scenario: Deduplication interval prevents spam
- **GIVEN** rapid component remounts or state changes
- **WHEN** data is requested multiple times quickly
- **THEN** dedupingInterval: 60000 prevents duplicate requests within 60 seconds

#### Scenario: Custom fetcher function
- **GIVEN** SWR needs to fetch data
- **WHEN** fetcher is called
- **THEN** fetcher handles response parsing, error handling, and returns typed data

#### Scenario: Error retry with exponential backoff
- **GIVEN** API request fails
- **WHEN** SWR detects error
- **THEN** automatically retries with exponential backoff (configurable)

### Requirement: Simple REST API Contract
The system SHALL provide a simple, stateless REST API endpoint that returns complete paginated responses, replacing complex EventSource streaming.

#### Scenario: GET endpoint with query params
- **GIVEN** client needs feed data
- **WHEN** making request
- **THEN** use GET /api/feed/trending?page={num}&type={mediaType}

#### Scenario: Response includes pagination metadata
- **GIVEN** API returns movie list
- **WHEN** response is structured
- **THEN** includes { movies: [], hasMore: boolean, page: number, total?: number }

#### Scenario: Consistent error format
- **GIVEN** API encounters error
- **WHEN** returning error response
- **THEN** uses consistent JSON format { error: string, code: string, status: number }

#### Scenario: Content-Type JSON header
- **GIVEN** API response
- **WHEN** headers are set
- **THEN** Content-Type: application/json is always present

### Requirement: Type-Safe SWR Integration
The system SHALL use TypeScript generics with SWR to ensure type safety across data fetching layer.

#### Scenario: useSWRInfinite with typed response
- **GIVEN** SWR hook definition
- **WHEN** calling useSWRInfinite
- **THEN** generic type parameter specifies API response type: useSWRInfinite<FeedResponse>

#### Scenario: Fetcher function type safety
- **GIVEN** custom fetcher function
- **WHEN** defining fetcher
- **THEN** return type matches SWR generic: (url: string) => Promise<FeedResponse>

#### Scenario: Typed error handling
- **GIVEN** SWR error state
- **WHEN** accessing error
- **THEN** error type is defined: Error | undefined

#### Scenario: IntelliSense for data properties
- **GIVEN** SWR returns data
- **WHEN** accessing data properties
- **THEN** TypeScript provides autocomplete for movies, hasMore, page

### Requirement: Eliminate EventSource Complexity
The system SHALL remove all Server-Sent Events code, timers, and manual cleanup logic, simplifying the data layer by 80%+ lines of code.

#### Scenario: No EventSource creation
- **GIVEN** data fetching implementation
- **WHEN** searching codebase
- **THEN** zero instances of `new EventSource()` exist

#### Scenario: No manual timeout management
- **GIVEN** API request handling
- **WHEN** implementing data fetching
- **THEN** no setTimeout for 30-second timeouts, SWR handles this

#### Scenario: No manual cleanup in useEffect
- **GIVEN** data fetching hooks
- **WHEN** component unmounts
- **THEN** SWR automatically handles cleanup, no manual eventSource.close() needed

#### Scenario: No streaming status state
- **GIVEN** loading state management
- **WHEN** checking status
- **THEN** use SWR's isLoading and isValidating states instead of custom streamingStatus

#### Scenario: Delete useStreamingFeedData hook
- **GIVEN** codebase cleanup
- **WHEN** removing old code
- **THEN** entire hooks/useStreamingFeedData.ts file is deleted (replaced by useFeedData with SWR)

### Requirement: SWR Cache Invalidation Strategy
The system SHALL provide mechanisms to manually invalidate SWR cache when user actions require fresh data (e.g., content type switch, manual refresh).

#### Scenario: Mutate to force refresh
- **GIVEN** user pulls to refresh
- **WHEN** refresh action triggers
- **THEN** call mutate() from SWR to invalidate cache and refetch

#### Scenario: Cache key changes on content type
- **GIVEN** user switches from Movies to TV Shows
- **WHEN** content type changes
- **THEN** SWR cache key changes automatically, fetching new data

#### Scenario: Optimistic updates for user actions
- **GIVEN** user favorites a movie
- **WHEN** action completes
- **THEN** mutate() can optimistically update cache before server confirms

#### Scenario: Cache persistence across sessions
- **GIVEN** SWR cache in memory
- **WHEN** user refreshes page
- **THEN** cache is cleared (stateless, re-fetches on mount) unless using SWR persistence middleware
