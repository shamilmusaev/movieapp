# Project Context

## Purpose

**Project Name:** CineSwipe (working title)
**Version:** MVP 1.0
**Platform:** Web (Next.js / React / TypeScript), mobile-first

CineSwipe is a mobile-first web application that provides a TikTok-like vertical feed experience for discovering movies, TV series, and anime through short video clips (trailers, teasers, highlights). Users scroll through a vertical feed, watch trailers, and quickly decide if content interests them by adding to favorites or liking.

### Main Goals (MVP)
1. Simple way to discover new movies through short videos in browser
2. Stable personalized feed based on user preferences
3. Ability to save movies and collections to favorites
4. Browse thematic/editorial collections
5. Smooth video scrolling without repeats and delays

### Long-term Goals
1. AI-generated collections
2. Custom user collections
3. Advanced personalization
4. AI-generated clips
5. Monetization through affiliate links

## Tech Stack

### Frontend
- **Framework:** Next.js (latest stable)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (mobile-first approach)
- **Video Player:** HTML5 video with custom controls
- **State Management:** React Context/Hooks (or Zustand if needed)

### Data & Storage
- **Local Storage:** localStorage / IndexedDB for favorites, preferences, and behavioral signals
- **Caching:** Next.js ISR/SSR, client-side caching
- **Optional Backend:** Node.js / Supabase / Firebase (future iterations)

### APIs & External Services
- **TMDB API:** Movies metadata, trailers, genres, ratings, similar movies, watch providers
- **YouTube:** Video playback (video keys from TMDB)

## Project Conventions

### Code Style
- **TypeScript:** Strict mode enabled, explicit types preferred
- **Naming:**
  - Components: PascalCase (e.g., `MovieCard.tsx`)
  - Utilities/hooks: camelCase (e.g., `useFeedData.ts`)
  - Constants: UPPER_SNAKE_CASE
- **File Structure:**
  ```
  /app          - Next.js app router pages
  /components   - Reusable UI components
  /lib          - Utilities, API clients, types
  /hooks        - Custom React hooks
  /context      - React context providers
  /public       - Static assets
  ```
- **Formatting:** Use Prettier with standard Next.js config
- **Linting:** ESLint with Next.js recommended rules

### Architecture Patterns
- **Component Architecture:** Atomic design principles (atoms, molecules, organisms)
- **Mobile-First:** All components designed for vertical mobile screens first, desktop as enhancement
- **Single Video Player:** Only one active video player at a time to optimize performance
- **Infinite Scroll:** Feed uses infinite scroll pattern with preloading
- **Lazy Loading:** Components and routes use Next.js dynamic imports and code splitting
- **Local-First:** User data (favorites, preferences) stored locally, optional sync later

### Testing Strategy
- **Unit Tests:** Critical utilities and hooks (Jest + React Testing Library)
- **Integration Tests:** Key user flows (feed scrolling, favorites, collections)
- **Performance Testing:** Monitor 60 FPS target, video loading times
- **Mobile Testing:** Test on real devices (iOS Safari, Chrome Android)

### Git Workflow
- **Branch Strategy:** Feature branches from `main`
- **Commit Convention:** Conventional Commits (feat:, fix:, docs:, etc.)
- **Pull Requests:** Required for all changes, include description and testing notes
- **OpenSpec Integration:**
  - After `/openspec:proposal` → commit + push
  - After `/openspec:apply` → commit + push
  - After `/openspec:archive` → commit + push

## Domain Context

### User Personas
1. **"Film Hunter"** - Discovers new content every evening, loves short clips, uses favorites actively
2. **"Lazy Viewer"** - Wants to just scroll the feed, prioritizes ease of use
3. **"Collector"** - Loves thematic collections, stores collections, wants to create custom ones

### Key User Scenarios
1. **Main Feed:** Vertical feed with autoplay, swipe/button navigation, like/favorite/share actions
2. **Movie Card:** Full movie details, similar movies, "where to watch" links
3. **Collections:** Editorial collections with dedicated vertical feeds
4. **Favorites:** Two tabs (Movies/Collections), sorting and filters
5. **Onboarding:** Genre selection, forms initial feed based on preferences

### Recommendation System (MVP)
- **Signals:**
  - Like/Favorite: strong positive signal
  - Watch completion: positive signal
  - Quick skip: weak negative signal
  - Genre preferences from onboarding
- **Logic:**
  - Start: trending/popular filtered by selected genres
  - Then: more movies similar to favorites
  - Minimize repeats in feed

### KPIs
1. Number of video switches per session
2. Average watch time per video
3. Favorites additions per session
4. Movie card opens
5. Retention D1/D7
6. Mobile traffic percentage

## Important Constraints

### Performance Requirements
- **Target:** 60 FPS smooth animations and scrolling
- **Video Management:** Only one active video player instance at a time
- **Preloading:** Next video must be preloaded before user reaches it
- **Data Optimization:** Minimize API calls, cache aggressively
- **Code Splitting:** Use Next.js code splitting for optimal bundle size

### UX Requirements
- **Mobile-First:** Vertical orientation, touch-friendly controls, full-screen video on mobile
- **Desktop Support:** Supported but mobile is priority
- **Instant UI Response:** UI actions must feel instant (<100ms)

### Content & Legal
- **Copyright:** Use only official TMDB/YouTube trailers
- **Fallbacks:** If YouTube video blocked:
  - Show poster instead
  - Provide "Open in YouTube" link

### Reliability
- **API Errors:** Graceful fallbacks for TMDB API failures
- **Slow Network:** Video buffering strategies for weak internet
- **No Repeats:** Algorithm must minimize showing same content

## External Dependencies

### TMDB API
- **Endpoints Used:**
  - `trending`, `popular`, `top_rated`, `upcoming`
  - `movie/{id}/videos` for trailers
  - `genre/movie/list` for genre metadata
  - `movie/{id}` for movie details
  - `movie/{id}/similar` for recommendations
  - `movie/{id}/watch/providers` for streaming availability
- **Rate Limits:** Follow TMDB rate limits (40 requests per 10 seconds)
- **API Key:** Required, store in `.env.local`

### YouTube Embed Player
- **Purpose:** Video playback for trailers
- **Integration:** Use video keys from TMDB
- **Fallback:** If embed fails, show poster + external link

### Future Dependencies
- **Backend API:** Optional for user accounts, cloud sync (Node.js/Supabase/Firebase)
- **Analytics:** Future tracking for KPIs
- **AI Services:** For collection generation and advanced recommendations
