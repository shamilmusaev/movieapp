# Design: Initial Architecture Setup

## Context

CineSwipe is starting from a default Next.js 16 template. We need to establish the foundational architecture that will support:
- Mobile-first, performance-optimized video feed
- TMDB API integration for movie data and trailers
- Type-safe data handling throughout the application
- Scalable structure for future features (favorites, collections, recommendations)

This is the first architectural decision that sets patterns for all future development.

## Goals

1. **Type Safety**: Comprehensive TypeScript types for all data structures
2. **Clean Architecture**: Clear separation between API layer, utilities, and UI
3. **Developer Experience**: Intuitive folder structure and import patterns
4. **Performance Foundation**: Patterns that support caching and optimization
5. **Error Resilience**: Graceful handling of API failures and network issues

## Non-Goals

1. UI/UX implementation (beyond basic error boundaries)
2. Video player integration
3. State management beyond basic React patterns
4. Backend services or authentication
5. Advanced caching strategies (will come later)

## Decisions

### Decision 1: Next.js App Router with File-Based Structure

**Choice**: Use Next.js App Router with clear functional separation (`/app`, `/components`, `/lib`, `/hooks`, `/types`, `/context`)

**Rationale**:
- App Router is Next.js 13+ recommended approach with better performance
- Clear separation between routes (`/app`) and reusable code (`/lib`, `/components`) improves maintainability
- Atomic design principles in `/components` (atoms/molecules/organisms) scale well for component libraries
- Dedicated `/types` directory makes TypeScript definitions easy to find and reuse

**Alternatives Considered**:
- **Pages Router**: Older, more familiar, but less optimal for our use case
- **Feature-based folders** (e.g., `/features/feed`, `/features/movie`): Rejected because this is foundational work that doesn't fit neatly into feature boundaries yet
- **Monolithic `/src` directory**: Rejected for lack of clear separation

### Decision 2: Native Fetch with Thin Wrapper

**Choice**: Use native `fetch` API with a thin wrapper for TMDB requests, rather than axios or heavy HTTP clients

**Rationale**:
- Next.js optimizes native fetch with caching and deduplication
- Smaller bundle size (axios adds ~15KB)
- Sufficient for our API needs (REST endpoints, JSON responses)
- TypeScript support is excellent with native fetch

**Alternatives Considered**:
- **axios**: More features, but unnecessary complexity and bundle size for our needs
- **SWR/React Query**: Will consider later for client-side data fetching, but not needed for initial server-side setup
- **tRPC**: Overkill without a custom backend

### Decision 3: TypeScript Strict Mode with Explicit Types

**Choice**: Enable TypeScript strict mode and define explicit types for all TMDB data structures

**Rationale**:
- Catches bugs at compile time rather than runtime
- Provides excellent IDE autocomplete and documentation
- TMDB API has well-defined schemas that map cleanly to TypeScript interfaces
- Strict mode prevents common errors (null/undefined handling, implicit any, etc.)

**Trade-offs**:
- Slightly more upfront work to define types
- **Mitigation**: Types will save debugging time and improve development speed long-term

### Decision 4: Environment Variables for Configuration

**Choice**: Use `.env.local` for TMDB API key with `NEXT_PUBLIC_` prefix for client-side access

**Rationale**:
- Standard Next.js pattern
- Keeps secrets out of version control
- `NEXT_PUBLIC_` prefix makes it explicit which variables are exposed to browser
- Easy for developers to configure locally

**Alternatives Considered**:
- **Config file in repo**: Security risk, rejected
- **Server-only API routes**: Adds latency for client-side requests, may consider later for sensitive operations

### Decision 5: Path Aliases with `@/` Prefix

**Choice**: Configure `@/` as root alias and `@/components`, `@/lib`, `@/types`, `@/hooks` for specific directories

**Rationale**:
- Cleaner imports: `import { Movie } from '@/types/movie.types'` vs `import { Movie } from '../../../../types/movie.types'`
- Easier refactoring (path doesn't break when file moves)
- Standard pattern in Next.js community

**Implementation**: Update `tsconfig.json` paths configuration

### Decision 6: Custom Error Classes for API Failures

**Choice**: Define custom error classes (ApiAuthenticationError, NetworkError, NotFoundError, ServiceUnavailableError) rather than generic Error objects

**Rationale**:
- Enables type-safe error handling with `instanceof` checks
- Provides structured error information (status codes, context)
- Makes debugging easier with specific error types
- Allows UI to show appropriate user-facing messages

**Pattern**:
```typescript
try {
  const movie = await getMovieById(123)
} catch (error) {
  if (error instanceof NotFoundError) {
    // Show "Movie not found" UI
  } else if (error instanceof ApiAuthenticationError) {
    // Show "Check API configuration" message
  }
}
```

### Decision 7: In-Memory Genre Caching

**Choice**: Cache genre list in memory on first fetch, refresh only on application restart

**Rationale**:
- Genre list rarely changes
- Reduces API calls (TMDB rate limits to consider)
- Simple implementation without external caching layer
- Fast lookups for genre ID to name mapping

**Trade-off**: Cache is per-instance (not shared across serverless functions), but this is acceptable for MVP

## Risks / Trade-offs

### Risk: TMDB Rate Limits (40 requests per 10 seconds)
**Mitigation**:
- Document rate limits in code
- Implement client-side request queuing if needed in future
- Use Next.js cache for server-side requests
- Consider response caching for frequently accessed data

### Risk: API Key Exposure in Client
**Trade-off**:
- Using `NEXT_PUBLIC_` exposes API key to browser
- **Acceptable for MVP** because TMDB allows this and has per-key rate limiting
- **Future improvement**: Move sensitive operations to API routes if abuse becomes an issue

### Risk: Type Drift Between TMDB API and Our Types
**Mitigation**:
- Use TMDB official documentation as source of truth
- Add runtime validation for critical fields if API changes are detected
- Version types if major API changes occur
- Consider codegen from OpenAPI spec in future if available

### Risk: Over-Engineering Too Early
**Mitigation**:
- Keep initial implementation minimal
- Avoid abstractions until patterns emerge (Rule of Three)
- Document where complexity might be added later but don't build it now

## Migration Plan

**No migration needed** - this is greenfield development on starter template.

**Rollback**: If architectural decisions prove problematic:
1. Can revert to simpler structure
2. TypeScript types are non-breaking (can be simplified)
3. Path aliases can be removed without breaking existing code (just less convenient)

## Implementation Approach

1. **Phase 1: Structure** (30 min)
   - Create folder structure
   - Update tsconfig.json
   - Add .env.local.example

2. **Phase 2: Types** (45 min)
   - Define all TypeScript interfaces
   - Create error classes
   - Export from index files

3. **Phase 3: API Client** (1-2 hours)
   - Implement fetch wrapper
   - Create endpoint functions
   - Add error handling

4. **Phase 4: Testing** (30 min)
   - Manual testing with real API
   - Verify error handling
   - Check type safety

**Total estimated time**: 3-4 hours for experienced Next.js developer

## Open Questions

None at this time. All decisions are based on well-established patterns for Next.js + TypeScript applications.

## Future Considerations

These are **not** in scope now but documented for future reference:

1. **Client-side data fetching library** (SWR/React Query) for feed and real-time updates
2. **Request caching strategy** beyond Next.js defaults
3. **API routes as proxy** if TMDB rate limits or security become issues
4. **Testing infrastructure** (Jest, React Testing Library, Playwright)
5. **Code generation** from TMDB OpenAPI spec if available
6. **Monitoring and observability** for API errors and performance
