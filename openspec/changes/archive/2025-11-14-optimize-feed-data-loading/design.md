# Design: Feed Data Loading Optimization

## Context

The current feed implementation (`useFeedData` + `transformMovieForFeed`) makes multiple sequential TMDB API requests from the client:
1. One request for trending movies list
2. 10 separate requests for movie videos (trailers)
3. Client-side rate limiting adds 250ms between each request
4. Genre loading blocks feed initialization until complete

This results in **3-5 second initial load times**, far from the <1s target for a TikTok-like feed experience.

### Current Architecture
```
Client (useFeedData)
  └─> TMDB /trending/movie/day [1 request, ~500ms]
  └─> For each movie (10x):
       └─> TMDB /movie/{id}/videos [10 requests, ~250ms each + rate limit]
       └─> Total: ~4-5 seconds before first video visible
```

### Constraints
- TMDB API rate limit: 40 requests per 10 seconds
- Next.js App Router supports Route Handlers with ISR caching
- Mobile users need instant perceived load (<500ms to first content)

## Goals / Non-Goals

### Goals
- Reduce initial feed load time from 3-5s to <1s
- Reduce time to first visible video to <500ms
- Maintain or improve caching effectiveness
- Keep client-side code simple and maintainable
- Enable progressive rendering (show cards as ready)

### Non-Goals
- Real-time feed updates (current 1-hour cache is acceptable)
- Personalization (still using trending API)
- Handling 100+ concurrent users (MVP scale)
- Optimizing video playback itself (separate concern)

## Decisions

### Decision 1: Server-Side Data Aggregation via Route Handler

**Chosen:** Create `/api/feed/trending` Route Handler that aggregates TMDB data server-side.

**Why:**
- Eliminates client-side rate limiting bottleneck (250ms delays)
- Enables parallel requests on server (10 movies fetched concurrently)
- Leverages Next.js ISR for automatic caching and revalidation
- Reduces client bundle size (less API logic)
- Better error handling and retry logic on server

**How:**
```typescript
// app/api/feed/trending/route.ts
export async function GET(request: Request) {
  const { page = 1 } = parseSearchParams(request);

  // 1. Fetch trending movies (1 request)
  const trending = await getTrendingMovies({ page });

  // 2. Fetch details + videos for each movie in parallel (10 concurrent requests)
  const moviesWithVideos = await Promise.allSettled(
    trending.results.slice(0, 10).map(movie =>
      getMovieById(movie.id, { append_to_response: 'videos' })
    )
  );

  // 3. Transform and return
  return NextResponse.json(transformForFeed(moviesWithVideos));
}

export const revalidate = 3600; // ISR: 1 hour cache
```

**Alternatives considered:**
1. **Client-side parallel requests without rate limiting** - Would hit TMDB rate limits under load, no caching benefits
2. **GraphQL layer** - Over-engineered for MVP, adds complexity
3. **External caching service (Redis)** - Unnecessary infrastructure for MVP scale

### Decision 2: Remove Genre Loading Blocker

**Chosen:** Load genres asynchronously, show genre IDs initially, hydrate names after loading.

**Why:**
- Genre loading currently blocks entire feed initialization
- Genre names are nice-to-have, not critical for first render
- Users prefer seeing content immediately over waiting for genre names

**How:**
```typescript
// Show genre IDs immediately
<GenreChip>{movie.genre_ids[0]}</GenreChip>

// Hydrate with names when ready
useEffect(() => {
  loadGenres().then(genres => setGenreMap(genres));
}, []);
```

**Alternatives considered:**
1. **Bundle genres with feed data** - Adds payload size, genres rarely change
2. **Hardcode genre map** - Breaks when TMDB updates genres

### Decision 3: Progressive Rendering with Streaming-Like UX

**Chosen:** Display movie cards as data becomes available instead of waiting for all data.

**Why:**
- Perceived performance matters more than actual load time
- Users see content within 500ms even if full page takes 1s
- Aligns with modern web app patterns (React Suspense)

**How:**
```typescript
// useFeedData returns movies as they're ready
const [movies, setMovies] = useState<MovieWithTrailer[]>([]);

useEffect(() => {
  fetchFeed(page).then(data => {
    // Add movies incrementally as they arrive
    data.forEach(movie => setMovies(prev => [...prev, movie]));
  });
}, [page]);
```

**Alternatives considered:**
1. **True streaming with SSE** - Complex, requires polling/websocket management
2. **Show skeleton loaders** - Less engaging than progressive content reveal

### Decision 4: Use `append_to_response=videos` for Single-Request Data

**Chosen:** Server fetches `/movie/{id}?append_to_response=videos` instead of separate video requests.

**Why:**
- TMDB supports appending videos to movie details response
- Reduces 10 requests down to 10 requests but with combined data (net: same request count but simpler)
- Actually, we're still at 10 requests per page, but server can parallelize without client rate limits

**Note:** This doesn't reduce request count to TMDB, but server parallelization eliminates the 250ms sequential delays.

**Alternatives considered:**
1. **Batch endpoint** - TMDB doesn't provide batch movie fetch endpoint
2. **Cache video responses separately** - More complex cache invalidation

## Risks / Trade-offs

### Risk 1: Server Load Under High Traffic
**Risk:** Route Handler could become bottleneck if 100+ concurrent users hit `/api/feed/trending`.
**Mitigation:**
- ISR caching means most requests hit cache (no TMDB calls)
- Monitor with Next.js analytics
- If needed, add Redis or CDN layer in future

### Risk 2: Stale Cache During TMDB Outages
**Risk:** If TMDB is down during revalidation, users get stale data or errors.
**Mitigation:**
- Use `stale-while-revalidate` pattern (serve stale, update background)
- Add circuit breaker for TMDB API
- Cache responses for 1 hour (acceptable staleness)

### Risk 3: Increased Server Costs
**Risk:** Moving API calls to server increases Vercel/hosting costs.
**Mitigation:**
- ISR caching dramatically reduces actual TMDB calls
- Most requests served from cache (cheap)
- Monitor usage and optimize if needed

### Trade-off: Client-Side Flexibility
**Trade-off:** Moving logic to server reduces client-side flexibility (e.g., custom sorting, filtering).
**Accepted because:** MVP doesn't require dynamic client-side transformations; simplicity and speed are priority.

## Migration Plan

### Phase 1: Create Route Handler (No Breaking Changes)
1. Implement `/api/feed/trending` Route Handler
2. Add comprehensive tests for server-side data aggregation
3. Deploy and validate caching behavior
4. Monitor performance metrics

### Phase 2: Refactor Client Hook
1. Update `useFeedData` to call `/api/feed/trending` instead of TMDB directly
2. Implement progressive rendering in `FeedContainer`
3. Remove genre loading blocker
4. Test on staging environment

### Phase 3: Cleanup
1. Remove unused `transformMovieForFeed` client-side logic
2. Simplify `useFeedData` hook
3. Update documentation

### Rollback Strategy
- If Route Handler fails, revert `useFeedData` to call TMDB directly
- Feature flag for gradual rollout: `USE_API_ROUTE` env variable
- Keep old client logic for one release cycle

## Open Questions

1. **Should we implement Server-Sent Events for true streaming?**
   - Answer: Not for MVP. Progressive rendering with standard HTTP is sufficient.

2. **How to handle TMDB rate limits on server side?**
   - Answer: ISR caching prevents most direct TMDB calls. Add request queue if needed.

3. **Should genres be bundled with feed response?**
   - Answer: No. Genres change rarely, better to fetch once and cache on client.

4. **What about pagination prefetching?**
   - Answer: Implement client-side prefetch when user is 5 videos from end. Server stays stateless.

## Performance Targets

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Initial load time | 3-5s | <1s | Time from route load to first movie visible |
| Time to first content | 3-5s | <500ms | Time to first card rendered |
| Pagination load | 2-3s | <800ms | Time from scroll trigger to new cards visible |
| TMDB API calls per page load | 11 | 1-2 | Monitor server logs (cached vs fresh) |

## Success Metrics

- [ ] 90th percentile initial load time <1s
- [ ] First video visible <500ms on mobile 4G
- [ ] Cache hit rate >80% for trending endpoint
- [ ] Zero increase in client bundle size
- [ ] Lighthouse performance score improves by 10+ points
