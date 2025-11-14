# Change: Add Favorites Page

## Why

Users need a dedicated page to view, manage, and organize their saved movies, TV shows, and anime. Currently, the Save button in the feed stores favorites in component state but doesn't persist them or provide a way to view the collection. According to the project goals (MVP 1.0), "Ability to save movies and collections to favorites" is a core feature that's missing.

Without a Favorites page, users cannot:
- See all their saved content in one place
- Remove items from favorites
- Filter saved content by type (Movies, TV Shows, Anime)
- Search within their favorites
- Sort saved content by different criteria

This change implements a full-featured Favorites page with localStorage persistence, navigation, and rich filtering/sorting capabilities.

## What Changes

### Favorites Page with Grid Layout
- Create `/favorites` route with responsive grid layout
- Display saved movies/TV shows/anime as poster cards (Netflix-style)
- Each card shows: poster, title, year, genres, rating, save date
- Hover/tap reveals action buttons: Remove from favorites, Open details
- Empty state with call-to-action when no favorites exist

### Navigation to Favorites Page
- Bottom navigation bar (Tab Bar) with three tabs: **Feed**, **Favorites**, **Profile** (placeholder)
- Fixed at bottom with safe-area-inset support for iOS/Android
- Icons with labels, active state highlighting
- Button in feed header (top-right corner) as alternative entry point
- Both navigation methods work together

### Content Type Filtering
- Horizontal tab bar at top of Favorites page: **All**, **Movies**, **TV Shows**, **Anime**
- Filter favorites by selected content type
- Show count badges for each type (e.g., "Movies (12)")
- Default to "All" on first visit, persist selection in sessionStorage

### Sorting Options
- Dropdown or button group for sorting
- Options: **Date Added (newest first)**, **Date Added (oldest first)**, **Title (A-Z)**, **Title (Z-A)**, **Rating (high to low)**
- Default: Date Added (newest first)
- Persist sort preference in sessionStorage

### Search Functionality
- Search bar at top of page (below tabs, above grid)
- Real-time filtering by movie/TV show title
- Case-insensitive search
- Displays "No results found" if search yields nothing
- Clear search button (X icon) when input has text

### LocalStorage Persistence
- Structure: `{ movieId: { movie: MovieWithTrailer, savedAt: timestamp, contentType: 'movie'|'tv'|'anime' } }`
- Key: `cineswipe_favorites`
- Favorites are stored as object map for O(1) lookup
- Auto-sync across tabs using `storage` event listener
- Export/import utilities for future backup feature

### Like vs Save Distinction
- **Like button**: Signals recommendation algorithm, does NOT save to Favorites
- **Save button**: Saves to Favorites, displayed on Favorites page
- Separate localStorage keys: `cineswipe_likes` and `cineswipe_favorites`
- Both persist independently

### Mobile-First Responsive Design
- Mobile: 2-column grid with compact cards
- Tablet (768px+): 3-4 column grid
- Desktop (1024px+): 4-6 column grid with max-width constraint
- Touch-friendly tap targets (minimum 44px)
- Smooth scroll behavior

## Impact

- **Affected specs:**
  - `project-structure` - ADDED: Favorites page route and components
  - New spec: `favorites-management` - ADDED: All favorites functionality, persistence, navigation
  - `video-feed-ui` - MODIFIED: Bottom navigation bar integration

- **Affected code:**
  - `app/favorites/page.tsx` (new) - Favorites page component
  - `components/favorites/FavoritesGrid.tsx` (new) - Grid layout for favorites
  - `components/favorites/FavoriteCard.tsx` (new) - Individual favorite card component
  - `components/favorites/FavoritesHeader.tsx` (new) - Search, tabs, sort controls
  - `components/favorites/EmptyFavorites.tsx` (new) - Empty state component
  - `components/navigation/BottomTabBar.tsx` (new) - Bottom navigation component
  - `hooks/useFavorites.ts` (new) - Hook for favorites CRUD operations
  - `hooks/useLikes.ts` (new) - Hook for likes (separate from favorites)
  - `lib/favorites.ts` (new) - Utilities for favorites localStorage operations
  - `types/favorites.types.ts` (new) - TypeScript types for favorites
  - `app/feed/page.tsx` - Integrate BottomTabBar and connect Save button
  - `components/feed/VideoOverlay.tsx` - Connect Save/Like buttons to hooks
  - `app/layout.tsx` - Add BottomTabBar to global layout

- **Dependencies:**
  - Requires completed `add-vertical-video-feed` change (feed exists, VideoOverlay buttons exist)
  - No breaking changes to existing functionality
  - Backward compatible (favorites start empty, no migration needed)

## Notes

**LocalStorage Structure Design:**
```typescript
// cineswipe_favorites
{
  "12345": {
    "movie": { /* full MovieWithTrailer object */ },
    "savedAt": 1699900000000,
    "contentType": "movie"
  },
  "67890": {
    "movie": { /* full MovieWithTrailer object */ },
    "savedAt": 1699900001000,
    "contentType": "tv"
  }
}

// cineswipe_likes (separate storage)
{
  "12345": true,
  "54321": true
}
```

**Navigation UX:**
- Bottom Tab Bar is globally visible on all pages (Feed, Favorites, Profile)
- Tab Bar hides when scrolling down in feed for immersive experience, reappears when scrolling up
- Header button in Feed provides quick access without leaving feed context
- Both navigation methods highlight Favorites tab when active

**Empty State:**
- Illustrated empty state with icon/illustration
- Message: "No favorites yet. Start exploring and save movies you love!"
- Call-to-action button: "Browse Feed" → redirects to `/feed`

**Performance Considerations:**
- Lazy load images using Next.js Image component with blur placeholder
- Virtual scrolling if favorites exceed 100 items (future optimization)
- Debounce search input (300ms) to avoid excessive re-renders
- Memoize filtered/sorted results to prevent unnecessary recalculation

**Future Enhancements (not in this change):**
- Export favorites to JSON file
- Import favorites from file
- Share favorites list with others
- Create custom collections/folders within favorites
- Drag-and-drop reordering
- Batch actions (select multiple, delete all)
- Sync favorites to backend/cloud (requires user accounts)
