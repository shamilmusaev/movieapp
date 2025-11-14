# Design: Modernize Feed Stack

## Context

Current feed implementation uses custom-built solutions (YouTube iframe wrapper, EventSource streaming) that have proven problematic in production. Users report lag, freezing, and unreliable autoplay. We need to modernize the stack using battle-tested libraries while maintaining the TikTok-style UX.

**Constraints:**
- Must maintain mobile-first vertical feed UX
- Cannot change API contract (other features may depend on it)
- Must support both YouTube trailers and potential TMDB-hosted videos
- Must work on iOS Safari (strict autoplay policies)
- Target: 60 FPS scrolling on mid-range mobile devices

## Goals / Non-Goals

### Goals
1. Replace custom YouTube iframe wrapper with `react-player` library
2. Replace SSE data fetching with SWR + REST API
3. Eliminate all identified performance bottlenecks (state update storms, unstable callbacks, console.logs)
4. Achieve reliable autoplay on all platforms
5. Implement proper React 19 / Next.js 16 best practices

### Non-Goals
- Virtualization (not needed for current feed lengths, can add later if needed)
- Offline support (out of MVP scope)
- Video quality selection (YouTube handles automatically)
- Custom video controls (use react-player defaults initially)
- Analytics integration (separate change)

## Decisions

### Decision 1: Use react-player Instead of Custom YouTube Iframe

**Rationale:**
- Handles YouTube iframe API lifecycle correctly (no timing race conditions)
- Supports multiple video sources (YouTube, Vimeo, direct files) out of the box
- 100k+ weekly downloads, battle-tested in production
- Built-in "light mode" for performance (thumbnail → load on click)
- Handles mobile autoplay policies correctly
- Active maintenance and community support

**Alternatives Considered:**
1. **Fix current custom implementation** - Would require deep YouTube iframe API expertise, likely to introduce new bugs
2. **Use video.js** - Heavier bundle, overcomplicated for our use case
3. **Use HTML5 video only** - Doesn't support YouTube embeds

**Trade-offs:**
- **Pro:** Eliminates 200+ lines of complex iframe management code
- **Pro:** Proven reliability across browsers and devices
- **Pro:** Future-proof (supports adding Vimeo, direct videos easily)
- **Con:** Adds 45KB to bundle (acceptable for reliability gain)
- **Con:** Less control over YouTube player internals (but we don't need it)

### Decision 2: Replace SSE with SWR + Simple REST API

**Rationale:**
- SSE causes state update storms (20+ rapid setState calls)
- SWR automatically batches updates and provides caching
- Vercel-maintained, designed for Next.js
- Built-in request deduplication (no more race conditions)
- Simpler to debug and reason about than EventSource
- Automatic stale-while-revalidate pattern improves perceived performance

**Alternatives Considered:**
1. **React Query** - Similar features, but SWR is lighter and Vercel-recommended
2. **Keep SSE but batch updates** - Still complex, doesn't solve caching
3. **Plain fetch with useEffect** - Doesn't solve caching or deduplication

**Trade-offs:**
- **Pro:** Eliminates EventSource cleanup issues
- **Pro:** Automatic caching across content type switches
- **Pro:** Simpler API route (no streaming complexity)
- **Pro:** Better TypeScript support
- **Con:** Loses "progressive loading" UX (acceptable, initial load still <1s)
- **Con:** Adds 12KB to bundle (tiny, worth it)

### Decision 3: Use React 19 useTransition for Tab Switching

**Rationale:**
- Next.js 16 already includes React 19
- useTransition keeps UI responsive during state updates
- Prevents visible freezes when switching content types
- No additional dependencies

**Implementation:**
```typescript
const [isPending, startTransition] = useTransition()

const handleContentTypeChange = (newType) => {
  startTransition(() => {
    setContentType(newType)
  })
}
```

**Trade-offs:**
- **Pro:** Native React solution (no library needed)
- **Pro:** Keeps UI responsive
- **Pro:** Built-in loading state (isPending)
- **Con:** Slightly delays state update (acceptable for smooth UX)

### Decision 4: Memoize VideoCard with Custom Comparator

**Rationale:**
- VideoCard re-renders unnecessarily when feed data changes
- React.memo with custom comparator prevents re-renders when props haven't meaningfully changed
- Significant performance gain (20+ cards × unnecessary renders)

**Implementation:**
```typescript
const VideoCard = React.memo(VideoCardComponent, (prev, next) => {
  return (
    prev.movie.id === next.movie.id &&
    prev.isActive === next.isActive &&
    prev.isMuted === next.isMuted
  )
})
```

**Trade-offs:**
- **Pro:** Eliminates majority of unnecessary re-renders
- **Pro:** Simple to implement
- **Con:** Must maintain comparator when adding new props
- **Con:** Shallow comparison could miss deep changes (not an issue for our immutable data)

### Decision 5: Stabilize Intersection Observer Callbacks

**Rationale:**
- Current implementation recreates observer on every render
- Causes performance issues and potential memory leaks
- useCallback with proper dependencies fixes this

**Implementation:**
```typescript
const handleVisibilityChange = useCallback((visible: boolean) => {
  if (visible) {
    onVideoActive(movie.id)
  }
}, [movie.id, onVideoActive])
```

**Trade-offs:**
- **Pro:** Observer created once, not every render
- **Pro:** Proper cleanup
- **Con:** Must carefully manage dependency array

## Architecture

### New Data Flow

```
User Action (Click Tab)
    ↓
useTransition wraps state update
    ↓
SWR cache lookup (instant if cached)
    ↓
    ├─ Cache hit → Immediate render
    └─ Cache miss → Background fetch → Revalidate
        ↓
    REST API /api/feed/trending?page=1&type=tv
        ↓
    Server fetches TMDB (cached via ISR)
        ↓
    Return paginated JSON
    ↓
SWR updates cache + triggers render
    ↓
VideoCard (memoized) renders
    ↓
react-player (light mode) shows thumbnail
    ↓
User scrolls → Intersection Observer (stable callback)
    ↓
Video becomes active → react-player loads + autoplays
```

### Component Structure

```
/app/feed/page.tsx
    ├─ useFeedData(contentType) [SWR-based]
    ├─ useTransition for tab switching
    └─ <FeedContainer>
        ├─ Memoized state
        ├─ useCallback for all handlers
        └─ <VideoCard> (React.memo)
            ├─ useVideoIntersection (stable callbacks)
            └─ <VideoPlayer> (react-player wrapper)
                └─ ReactPlayer with light mode
```

### API Changes

**Before (SSE):**
```
GET /api/feed/trending?page=1&type=movie
→ EventSource stream
→ Event: start
→ Event: movie (x20)
→ Event: complete
```

**After (REST):**
```
GET /api/feed/trending?page=1&type=movie
→ JSON response
→ { movies: [...], hasMore: true, page: 1 }
```

## Migration Plan

### Phase 1: Add Dependencies (5 min)
```bash
npm install react-player swr
```

### Phase 2: Create New Components (30 min)
1. Create `VideoPlayer.tsx` with react-player
2. Create `useFeedData.ts` with SWR
3. Test in isolation

### Phase 3: Update API Route (15 min)
1. Remove EventSource logic
2. Return simple JSON
3. Keep ISR caching
4. Test with curl

### Phase 4: Refactor Feed Container (45 min)
1. Add useTransition
2. Switch to SWR hook
3. Memoize state and callbacks
4. Remove SSE-related code

### Phase 5: Optimize VideoCard (30 min)
1. Add React.memo with comparator
2. Stabilize intersection observer callbacks
3. Replace YouTubePlayer with VideoPlayer

### Phase 6: Cleanup (15 min)
1. Remove old hooks (useStreamingFeedData, useVideoPlayer)
2. Remove old YouTubePlayer component
3. Remove all console.log statements
4. Update imports

### Phase 7: Testing (30 min)
1. Test autoplay on all content types
2. Test tab switching smoothness
3. Test infinite scroll pagination
4. Test on mobile devices
5. Run `npm run build` and fix any errors

Total Estimated Time: ~3 hours

## Risks / Trade-offs

### Risk 1: react-player Bundle Size
**Mitigation:** Use lazy loading variant (`react-player/lazy`), only loads YouTube player chunk when needed. Net bundle increase ~30KB after tree-shaking.

### Risk 2: SWR Cache Stale Data
**Mitigation:** Configure appropriate `revalidateOnFocus: false` and `dedupingInterval`. Server ISR cache is source of truth.

### Risk 3: Breaking Mobile Autoplay
**Mitigation:** react-player handles mobile autoplay policies correctly. Test on iOS Safari and Android Chrome before shipping.

### Risk 4: Performance Regression
**Mitigation:**
- Monitor with React DevTools Profiler
- Ensure memo comparators are correct
- Remove all console.logs
- Test on low-end devices

### Trade-off: Lose Progressive Loading UX
- **Current:** Videos appear one-by-one as SSE streams them
- **New:** All videos load at once (but still <1s due to server aggregation)
- **Acceptable:** Users prefer instant complete page over progressive loading

## Open Questions

None - requirements are clear, approach is proven, implementation is straightforward.

## Success Metrics

1. **Scrolling FPS:** Maintain 60 FPS (measure with Chrome DevTools Performance tab)
2. **Autoplay Success Rate:** 100% on YouTube videos (from ~60%)
3. **Tab Switch Time:** <100ms freeze (from 1-2s)
4. **Re-render Count:** <5 per user action (from 20+)
5. **Memory Leaks:** Zero (verify with Chrome DevTools Memory profiler)
6. **Build Success:** Zero TypeScript errors, warnings under 5
7. **Bundle Size:** <50KB increase (acceptable for gains)

## References

- [react-player documentation](https://www.npmjs.com/package/react-player)
- [SWR documentation](https://swr.vercel.app/)
- [React 19 useTransition](https://react.dev/reference/react/useTransition)
- [Next.js 16 performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Context7 react-player examples](https://context7.com/cookpete/react-player/llms.txt)
