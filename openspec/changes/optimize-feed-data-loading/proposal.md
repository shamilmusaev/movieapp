# Change: Optimize Feed Data Loading Performance

## Why

The current feed implementation makes 10+ separate TMDB API requests per page (1 trending + 10 video requests), with each request delayed by 250ms due to rate limiting. Additionally, genre loading blocks the entire feed initialization. This results in 3-5 second delays before users see the first movie, significantly degrading UX. Users expect TikTok-like instant feed loading with smooth scrolling.

## What Changes

### Server-Side Data Aggregation
- Create Next.js Route Handler `/api/feed/trending` that aggregates movie data with trailers server-side
- Use TMDB `/movie/{id}?append_to_response=videos` to fetch movie details + videos in single requests per movie
- Parallelize all movie+video requests on server (no client-side rate limiting bottleneck)
- Cache aggregated results using Next.js ISR (revalidate: 3600s)
- Return ready-to-render feed data to client in one request

### Client-Side Optimizations
- **BREAKING:** Refactor `useFeedData` to fetch from `/api/feed/trending` instead of direct TMDB calls
- Remove genre loading blocker: show genre IDs initially, hydrate names asynchronously
- Implement progressive rendering: display movie cards as data becomes available (streaming-like UX)
- Add prefetching for next page when user is 5 videos from end
- Simplify `transformMovieForFeed` since server returns pre-processed data

### Performance Targets
- Initial feed load: <1 second (from current 3-5 seconds)
- Time to first video visible: <500ms
- Pagination load: <800ms

## Impact

- **Affected specs:**
  - `feed-data-integration` - MODIFIED: Change data fetching strategy from client-direct to server-aggregated
  - `tmdb-integration` - ADDED: New Route Handler capability for server-side TMDB data aggregation

- **Affected code:**
  - `app/api/feed/trending/route.ts` (new) - Server-side Route Handler for aggregated feed data
  - `hooks/useFeedData.ts` - Refactor to call `/api/feed/trending`, progressive rendering logic
  - `lib/utils/feed.ts` - Simplify `transformMovieForFeed` (server pre-processes)
  - `lib/api/tmdb/movies.ts` - Add server-only utility for batch movie+video fetching
  - `types/api.types.ts` - Add types for feed API request/response

- **Dependencies:**
  - Requires completed `add-vertical-video-feed` change
  - No breaking changes to component props (VideoCard, FeedContainer unchanged)
  - Genre map hydration is backwards compatible

## Notes

This is a performance optimization focused on initial load speed. Future optimizations could include:
- Streaming responses with Server-Sent Events for instant first card
- Edge caching with CDN for globally distributed users
- Incremental Static Regeneration for popular trending pages

The hybrid approach (server aggregation + client optimization) provides the best balance of performance, caching, and UX responsiveness.
