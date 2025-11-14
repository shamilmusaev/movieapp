# Feed Data Integration Specification - Delta

## ADDED Requirements

### Requirement: Server-Side Data Aggregation
The system SHALL provide a Next.js Route Handler that aggregates trending movie data with trailers server-side, reducing client-side API calls and enabling server-side caching.

#### Scenario: Route Handler fetches aggregated feed data
- **GIVEN** client requests `/api/feed/trending?page=1`
- **WHEN** Route Handler processes the request
- **THEN** server fetches trending movies and their video data in parallel, transforms into feed format, and returns aggregated response

#### Scenario: Server-side parallel video fetching
- **GIVEN** trending movies list contains 10 movies
- **WHEN** Route Handler processes video data
- **THEN** all 10 movie video requests execute in parallel without client-side rate limiting delays

#### Scenario: ISR caching for feed endpoint
- **GIVEN** Route Handler configured with `revalidate: 3600`
- **WHEN** multiple clients request the same page within cache window
- **THEN** cached response is served without calling TMDB API

#### Scenario: Append videos to movie details request
- **GIVEN** server needs movie details and videos
- **WHEN** fetching from TMDB
- **THEN** server uses `/movie/{id}?append_to_response=videos` to get both in single request

### Requirement: Progressive Feed Rendering
The system SHALL display movie cards progressively as data becomes available instead of waiting for complete page load, improving perceived performance.

#### Scenario: Show first cards immediately
- **GIVEN** feed data is being fetched from API
- **WHEN** first 3 movies are ready
- **THEN** those cards render immediately while remaining movies load

#### Scenario: Incremental state updates
- **GIVEN** server returns movie data
- **WHEN** client receives response
- **THEN** movies are added to feed state incrementally, triggering progressive UI updates

#### Scenario: Loading indicators for pending cards
- **GIVEN** some movies are still loading
- **WHEN** user scrolls to pending positions
- **THEN** skeleton loaders display until data arrives

## MODIFIED Requirements

### Requirement: Trending Movies as Feed Source
The system SHALL fetch trending movies through a server-side Route Handler instead of direct TMDB API calls, enabling better caching and performance.

#### Scenario: Fetch initial feed via Route Handler
- **GIVEN** the feed page loads
- **WHEN** initial data is requested
- **THEN** client calls `/api/feed/trending?page=1` which returns pre-aggregated movie data with trailers

#### Scenario: Pagination through Route Handler
- **GIVEN** user has scrolled through initial movies
- **WHEN** more content is needed
- **THEN** client calls `/api/feed/trending?page=2` and server returns next page from TMDB with aggregated data

#### Scenario: Server fetches from TMDB
- **GIVEN** Route Handler receives request
- **WHEN** cache is stale or missing
- **THEN** server fetches from TMDB `/trending/movie/day` and processes results

### Requirement: Trailer Extraction and Filtering
The system SHALL extract official trailers on the server side during data aggregation, reducing client-side processing and API calls.

#### Scenario: Server extracts trailers during aggregation
- **GIVEN** server fetches movie with `append_to_response=videos`
- **WHEN** processing movie data
- **THEN** server extracts best trailer using priority logic and includes in response

#### Scenario: Pre-processed trailer data in API response
- **GIVEN** client receives feed data from `/api/feed/trending`
- **WHEN** rendering movie cards
- **THEN** trailer information is already extracted and ready to use (no client-side filtering needed)

#### Scenario: Server handles movies without trailers
- **GIVEN** a movie has no trailer videos in TMDB
- **WHEN** server processes the movie
- **THEN** response includes `trailer: null` and client shows poster fallback

### Requirement: Genre Mapping
The system SHALL load genres asynchronously without blocking feed initialization, displaying genre IDs initially and hydrating names when available.

#### Scenario: Feed loads without waiting for genres
- **GIVEN** the feed initializes
- **WHEN** genre data is not yet loaded
- **THEN** feed displays movies immediately with genre IDs as fallback

#### Scenario: Async genre hydration
- **GIVEN** movies are displayed with genre IDs
- **WHEN** genre list finishes loading
- **THEN** UI updates to show genre names without re-rendering entire feed

#### Scenario: Genre names display when available
- **GIVEN** genre map is loaded
- **WHEN** new movies are added to feed
- **THEN** those movies immediately display genre names instead of IDs

#### Scenario: Graceful handling of missing genre names
- **GIVEN** a movie has a genre ID not in cached list
- **WHEN** rendering genre chips
- **THEN** system shows genre ID or skips that genre without breaking UI

### Requirement: Feed Data Transformation
The system SHALL perform data transformation on the server side, returning feed-ready data to minimize client-side processing.

#### Scenario: Server transforms movies for feed display
- **GIVEN** raw TMDB data is fetched on server
- **WHEN** preparing API response
- **THEN** server creates FeedMovie objects with computed URLs, extracted trailers, and formatted fields

#### Scenario: Computed image URLs on server
- **GIVEN** movie has poster_path "/abc123.jpg"
- **WHEN** server transforms data
- **THEN** response includes full URL "https://image.tmdb.org/t/p/w500/abc123.jpg"

#### Scenario: Client receives ready-to-render data
- **GIVEN** client fetches from `/api/feed/trending`
- **WHEN** response arrives
- **THEN** data requires minimal transformation before rendering (only genre name hydration)

### Requirement: Feed Performance Optimization
The system SHALL optimize feed loading to achieve <1s initial load and <500ms time-to-first-content through server-side aggregation and caching.

#### Scenario: Single API call for feed page
- **GIVEN** client needs feed data
- **WHEN** fetching a page
- **THEN** only one HTTP request is made to `/api/feed/trending` (not 11+ to TMDB)

#### Scenario: Server-side parallel processing
- **GIVEN** server handles feed request
- **WHEN** fetching movie videos
- **THEN** all requests execute in parallel without 250ms rate-limit delays

#### Scenario: ISR cache hit for common pages
- **GIVEN** page 1 was recently requested
- **WHEN** another user requests page 1 within cache window
- **THEN** response is served from Next.js cache instantly (<50ms)

#### Scenario: Prefetch next page before user reaches end
- **GIVEN** user is 5 videos from end of current page
- **WHEN** scrolling continues
- **THEN** client prefetches next page in background for instant pagination

## REMOVED Requirements

None. All existing requirements are preserved with modifications for server-side architecture.
