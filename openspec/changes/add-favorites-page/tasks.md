# Implementation Tasks: Add Favorites Page

## Phase 1: Core Data Layer & Persistence

### Task 1.1: Create favorites type definitions
**File:** `types/favorites.types.ts`
**Dependencies:** None
**Description:** Define TypeScript types for favorites management
- [ ] Create `FavoriteItem` type: `{ movie: MovieWithTrailer, savedAt: number, contentType: 'movie' | 'tv' | 'anime' }`
- [ ] Create `FavoritesList` type: `Record<number, FavoriteItem>`
- [ ] Create `SortOption` enum: `'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'rating'`
- [ ] Create `ContentTypeFilter` type: `'all' | 'movie' | 'tv' | 'anime'`
- [ ] Export all types with proper JSDoc comments

**Validation:** TypeScript compiles without errors, types are importable

---

### Task 1.2: Create favorites utility functions
**File:** `lib/favorites.ts`
**Dependencies:** Task 1.1
**Description:** Implement localStorage utility functions for favorites CRUD operations
- [ ] Implement `loadFavorites(): FavoritesList` - reads from `cineswipe_favorites`, handles parse errors
- [ ] Implement `saveFavorite(movie: MovieWithTrailer, contentType: string): void` - saves favorite with timestamp
- [ ] Implement `removeFavorite(movieId: number): void` - removes favorite by ID
- [ ] Implement `isFavorite(movieId: number): boolean` - checks if movie is in favorites
- [ ] Implement `getFavoritesCount(): number` - returns total favorites count
- [ ] Implement `getFavoritesByType(contentType: ContentTypeFilter): FavoriteItem[]` - filters by type
- [ ] Add error handling for corrupted localStorage data
- [ ] Add JSDoc comments for all functions

**Validation:** Unit tests pass (or manual testing in console), localStorage operations work correctly

---

### Task 1.3: Create likes utility functions
**File:** `lib/likes.ts`
**Dependencies:** None
**Description:** Implement localStorage utility functions for likes management (separate from favorites)
- [ ] Implement `loadLikes(): Record<number, boolean>` - reads from `cineswipe_likes`
- [ ] Implement `saveLike(movieId: number): void` - adds movie ID to likes
- [ ] Implement `removeLike(movieId: number): void` - removes movie ID from likes
- [ ] Implement `isLiked(movieId: number): boolean` - checks if movie is liked
- [ ] Add error handling for corrupted localStorage
- [ ] Add JSDoc comments

**Validation:** Likes persist independently from favorites, localStorage works

---

### Task 1.4: Create useFavorites hook
**File:** `hooks/useFavorites.ts`
**Dependencies:** Task 1.1, Task 1.2
**Description:** React hook for favorites state management with cross-tab sync
- [ ] Create hook with state: `favorites: FavoritesList`, `favoritesCount: number`
- [ ] Implement `addFavorite(movie, contentType)` function
- [ ] Implement `removeFavorite(movieId)` function
- [ ] Implement `isFavorite(movieId)` function
- [ ] Implement `getFavoritesByFilter(contentType, sortOption, searchQuery)` function with filtering/sorting logic
- [ ] Add `useEffect` to load favorites on mount from localStorage
- [ ] Add `storage` event listener for cross-tab synchronization
- [ ] Return hook interface: `{ favorites, addFavorite, removeFavorite, isFavorite, getFavoritesByFilter, favoritesCount }`

**Validation:** Hook state updates correctly, cross-tab sync works, filtering/sorting works

---

### Task 1.5: Create useLikes hook
**File:** `hooks/useLikes.ts`
**Dependencies:** Task 1.3
**Description:** React hook for likes state management
- [ ] Create hook with state: `likes: Record<number, boolean>`
- [ ] Implement `addLike(movieId)` function
- [ ] Implement `removeLike(movieId)` function
- [ ] Implement `isLiked(movieId)` function
- [ ] Add `useEffect` to load likes on mount
- [ ] Add `storage` event listener for cross-tab sync
- [ ] Return hook interface: `{ isLiked, addLike, removeLike }`

**Validation:** Likes persist, hook updates correctly, independent from favorites

---

## Phase 2: Navigation Components

### Task 2.1: Create BottomTabBar component
**File:** `components/navigation/BottomTabBar.tsx`
**Dependencies:** None (can be parallelized with Phase 1)
**Description:** Global bottom navigation with three tabs
- [ ] Create component with three tabs: Feed (home icon), Favorites (bookmark icon), Profile (user icon)
- [ ] Use Next.js `usePathname()` to detect active tab
- [ ] Add `Link` components for navigation to `/feed`, `/favorites`, `/profile`
- [ ] Style with Tailwind: fixed bottom, backdrop blur, safe-area-inset-bottom support
- [ ] Highlight active tab with accent color and indicator bar
- [ ] Add icon components (use Heroicons or SVG)
- [ ] Make responsive: show labels on tablet+, icons only on mobile
- [ ] Add accessibility: aria-labels, aria-current for active tab

**Validation:** Tab bar displays correctly, navigation works, active state highlights, safe area respected on iOS

---

### Task 2.2: Integrate BottomTabBar in app layout
**File:** `app/layout.tsx`
**Dependencies:** Task 2.1
**Description:** Add bottom tab bar to global layout
- [ ] Import `BottomTabBar` component
- [ ] Add `<BottomTabBar />` at bottom of layout (after children)
- [ ] Ensure tab bar is visible on `/feed`, `/favorites`, `/profile` routes
- [ ] Add conditional rendering to hide tab bar on landing page `/` if needed
- [ ] Test navigation between pages

**Validation:** Tab bar appears on all main pages, navigation works globally

---

### Task 2.3: Add scroll-based auto-hide for tab bar in Feed
**File:** `app/feed/page.tsx`
**Dependencies:** Task 2.2
**Description:** Implement scroll detection to hide/show bottom tab bar
- [ ] Add `useState` for `showTabBar: boolean` (default true)
- [ ] Add `useEffect` with scroll event listener
- [ ] Track scroll direction (compare previous scroll position)
- [ ] Hide tab bar when scrolling down > 50px
- [ ] Show tab bar when scrolling up
- [ ] Animate tab bar with CSS transitions (`translateY`)
- [ ] Pass `showTabBar` prop to BottomTabBar or use context
- [ ] Clean up event listener on unmount

**Validation:** Tab bar hides when scrolling down, reappears when scrolling up, smooth animations

---

### Task 2.4: Create header Favorites button
**File:** `components/feed/FeedHeader.tsx` (new or modify existing header)
**Dependencies:** Task 1.4
**Description:** Add Favorites icon button to feed header
- [ ] Create or modify FeedHeader component
- [ ] Add Favorites icon button in top-right corner
- [ ] Use `useFavorites()` hook to get `favoritesCount`
- [ ] Display badge with count if count > 0
- [ ] Link button to `/favorites` route using Next.js `Link`
- [ ] Style with Tailwind: fixed position, semi-transparent background
- [ ] Add hover/active states

**Validation:** Button displays in feed header, badge shows correct count, navigation works

---

### Task 2.5: Integrate header in Feed page
**File:** `app/feed/page.tsx`
**Dependencies:** Task 2.4
**Description:** Add FeedHeader to Feed page layout
- [ ] Import `FeedHeader` component
- [ ] Add `<FeedHeader />` at top of feed layout
- [ ] Ensure header is fixed or sticky at top
- [ ] Test navigation to Favorites

**Validation:** Header displays, Favorites button works, badge updates when saving

---

## Phase 3: Favorites Page UI Components

### Task 3.1: Create FavoriteCard component
**File:** `components/favorites/FavoriteCard.tsx`
**Dependencies:** Task 1.1
**Description:** Individual favorite card for grid display
- [ ] Accept props: `favorite: FavoriteItem`, `onRemove: (id) => void`
- [ ] Display poster image using Next.js `Image` component with blur placeholder
- [ ] Show title, year (from release_date), genres (max 2 chips)
- [ ] Show rating stars or number (vote_average)
- [ ] Show "Saved on [date]" using `savedAt` timestamp
- [ ] Add hover/tap overlay with buttons: "Remove" and "View Details"
- [ ] Implement remove button click handler calling `onRemove`
- [ ] Add fallback for missing poster (use placeholder image or gradient)
- [ ] Style with Tailwind: rounded corners, shadow, responsive sizing
- [ ] Add content type badge (Movie/TV/Anime icon) in corner

**Validation:** Card displays all metadata, remove button works, responsive on mobile/desktop

---

### Task 3.2: Create EmptyFavorites component
**File:** `components/favorites/EmptyFavorites.tsx`
**Dependencies:** None (can be parallelized)
**Description:** Empty state when no favorites exist
- [ ] Create component with illustration or icon (bookmark icon, empty state graphic)
- [ ] Display message: "No favorites yet"
- [ ] Display subtext: "Start exploring and save movies you love!"
- [ ] Add "Browse Feed" button linking to `/feed`
- [ ] Style with Tailwind: centered layout, large icon, clear CTA button
- [ ] Make responsive

**Validation:** Empty state displays when no favorites, button navigates to feed

---

### Task 3.3: Create FavoritesHeader component
**File:** `components/favorites/FavoritesHeader.tsx`
**Dependencies:** Task 1.1
**Description:** Header with search, tabs, and sort controls
- [ ] Accept props: `onSearchChange`, `onFilterChange`, `onSortChange`, `activeFilter`, `activeSort`, `searchQuery`, `counts: { all, movie, tv, anime }`
- [ ] Create search input with placeholder "Search favorites..."
- [ ] Add clear button (X icon) when search has text
- [ ] Create tab buttons: All, Movies (count), TV Shows (count), Anime (count)
- [ ] Highlight active tab
- [ ] Create sort dropdown or button group with options: Date Added (newest), Date Added (oldest), Title A-Z, Title Z-A, Rating
- [ ] Implement all change handlers calling parent callbacks
- [ ] Style with Tailwind: sticky header, backdrop blur, mobile-responsive
- [ ] Debounce search input (300ms) using `useDeferredValue` or custom debounce

**Validation:** Search filters results, tabs switch filter, sort changes order, UI is responsive

---

### Task 3.4: Create FavoritesGrid component
**File:** `components/favorites/FavoritesGrid.tsx`
**Dependencies:** Task 3.1
**Description:** Responsive grid layout for favorite cards
- [ ] Accept props: `favorites: FavoriteItem[]`, `onRemove: (id) => void`
- [ ] Render grid with responsive columns: 2 (mobile), 3-4 (tablet), 4-6 (desktop)
- [ ] Use CSS Grid or Tailwind grid classes
- [ ] Map over favorites and render `FavoriteCard` for each
- [ ] Handle empty array (render nothing, EmptyFavorites is handled by parent)
- [ ] Add smooth transitions when items are removed
- [ ] Add loading skeleton if favorites are being loaded
- [ ] Style with appropriate gaps and padding

**Validation:** Grid is responsive, cards display correctly, removal animations work

---

### Task 3.5: Create Favorites page
**File:** `app/favorites/page.tsx`
**Dependencies:** Task 1.4, Task 3.1, Task 3.2, Task 3.3, Task 3.4
**Description:** Main Favorites page combining all components with filtering/sorting logic
- [ ] Import all favorites components and `useFavorites` hook
- [ ] Create state: `searchQuery`, `contentFilter: ContentTypeFilter`, `sortOption: SortOption`
- [ ] Create state: `counts: { all, movie, tv, anime }` calculated from favorites
- [ ] Use `useFavorites()` hook to get favorites data
- [ ] Implement filtering logic: filter by `contentFilter`, then by `searchQuery`, then sort by `sortOption`
- [ ] Use `useMemo` to optimize filtered/sorted results
- [ ] Persist `contentFilter` and `sortOption` in sessionStorage
- [ ] Render `FavoritesHeader` with all handlers and props
- [ ] Conditionally render `EmptyFavorites` if no favorites, else render `FavoritesGrid`
- [ ] Handle remove favorite action calling `removeFavorite` from hook
- [ ] Add page title/meta tags using Next.js metadata
- [ ] Add smooth scroll behavior CSS
- [ ] Test all filtering/sorting combinations

**Validation:** Page displays favorites correctly, filtering works, sorting works, search works, remove works, persistence works

---

## Phase 4: Feed Integration

### Task 4.1: Connect VideoOverlay Save button to favorites
**File:** `components/feed/VideoOverlay.tsx`
**Dependencies:** Task 1.4
**Description:** Replace local state with useFavorites hook
- [ ] Import `useFavorites` hook
- [ ] Remove local `isSaved` state
- [ ] Use `isFavorite(movie.id)` to determine saved state
- [ ] Update Save button onClick to call `addFavorite(movie, contentType)` or `removeFavorite(movie.id)`
- [ ] Ensure button shows filled/unfilled state based on `isFavorite` result
- [ ] Pass `contentType` prop to VideoOverlay from parent (determine from movie type)
- [ ] Test saving and unsaving from feed

**Validation:** Save button persists favorites to localStorage, state updates correctly, button state is accurate

---

### Task 4.2: Connect VideoOverlay Like button to likes
**File:** `components/feed/VideoOverlay.tsx`
**Dependencies:** Task 1.5
**Description:** Replace local state with useLikes hook
- [ ] Import `useLikes` hook
- [ ] Remove local `isLiked` state
- [ ] Use `isLiked(movie.id)` to determine liked state
- [ ] Update Like button onClick to call `addLike(movie.id)` or `removeLike(movie.id)`
- [ ] Ensure button shows filled/unfilled heart based on `isLiked` result
- [ ] Test liking and unliking from feed

**Validation:** Like button persists likes to localStorage, independent from favorites, state updates correctly

---

### Task 4.3: Determine contentType for VideoOverlay
**File:** `app/feed/page.tsx` or `components/feed/FeedContainer.tsx`
**Dependencies:** Task 4.1
**Description:** Pass contentType prop to VideoOverlay based on current feed tab
- [ ] In feed component, track which tab is active: 'movie', 'tv', 'anime'
- [ ] Pass `contentType` prop to VideoCard or VideoOverlay
- [ ] Update VideoOverlay props to accept `contentType: 'movie' | 'tv' | 'anime'`
- [ ] Use contentType when saving to favorites
- [ ] Validate that saved favorites have correct contentType

**Validation:** Favorites saved from Movies tab have contentType='movie', TV Shows have 'tv', Anime have 'anime'

---

## Phase 5: Polish & Testing

### Task 5.1: Add loading states
**Files:** `app/favorites/page.tsx`, `components/favorites/FavoritesGrid.tsx`
**Dependencies:** Phase 3 complete
**Description:** Add skeleton loaders and loading indicators
- [ ] Create skeleton loader component for FavoriteCard
- [ ] Show skeleton grid when favorites are loading (initial mount)
- [ ] Add loading spinner for search/filter operations if needed
- [ ] Test loading states

**Validation:** Loading states appear briefly on mount, no flash of empty state

---

### Task 5.2: Add error handling
**Files:** `hooks/useFavorites.ts`, `lib/favorites.ts`, `app/favorites/page.tsx`
**Dependencies:** Phase 1 complete
**Description:** Handle localStorage errors and edge cases
- [ ] Wrap localStorage operations in try-catch
- [ ] Show error toast or message if localStorage is full or disabled
- [ ] Handle corrupted data gracefully (clear and restart)
- [ ] Test with localStorage disabled (private browsing)
- [ ] Test with localStorage quota exceeded

**Validation:** App doesn't crash with localStorage errors, user sees helpful error messages

---

### Task 5.3: Add animations and transitions
**Files:** All components
**Dependencies:** Phase 3 complete
**Description:** Polish UI with smooth animations
- [ ] Add fade-in animation when Favorites page loads
- [ ] Add slide-up animation for bottom tab bar
- [ ] Add scale/fade animation when removing favorite card
- [ ] Add smooth transitions for filter/sort changes
- [ ] Add hover effects for cards and buttons
- [ ] Test animations on mobile and desktop

**Validation:** All interactions feel smooth, no janky animations, 60fps maintained

---

### Task 5.4: Responsive design testing
**Files:** All components
**Dependencies:** Phase 3, Phase 4 complete
**Description:** Test and refine responsive behavior across devices
- [ ] Test on mobile (< 768px): iPhone SE, iPhone 14, Android
- [ ] Test on tablet (768px - 1024px): iPad, iPad Pro
- [ ] Test on desktop (> 1024px): 1080p, 1440p, 4K
- [ ] Test portrait and landscape orientations
- [ ] Verify touch targets are minimum 44px on mobile
- [ ] Verify safe-area-inset support on iOS devices
- [ ] Fix any layout issues or overflow

**Validation:** Layout works perfectly on all tested devices, no horizontal scroll, touch-friendly

---

### Task 5.5: Accessibility audit
**Files:** All components
**Dependencies:** Phase 3, Phase 4 complete
**Description:** Ensure accessibility standards are met
- [ ] Add proper aria-labels to all buttons and icons
- [ ] Add aria-current to active tab states
- [ ] Add alt text to all images (posters)
- [ ] Test keyboard navigation (tab through all elements)
- [ ] Test screen reader (VoiceOver on iOS, TalkBack on Android)
- [ ] Verify color contrast meets WCAG AA standards
- [ ] Add focus visible styles for keyboard users
- [ ] Test with browser accessibility tools

**Validation:** Page is fully accessible, keyboard navigable, screen reader friendly

---

### Task 5.6: Performance optimization
**Files:** `app/favorites/page.tsx`, `components/favorites/FavoritesGrid.tsx`
**Dependencies:** Phase 3, Phase 4 complete
**Description:** Optimize rendering and performance
- [ ] Add `useMemo` for expensive filtering/sorting operations
- [ ] Add `useCallback` for event handlers to prevent re-renders
- [ ] Memoize `FavoriteCard` component with `React.memo`
- [ ] Lazy load images with Next.js Image blur placeholder
- [ ] Test with 100+ favorites to ensure performance
- [ ] Profile with React DevTools to identify bottlenecks
- [ ] Consider virtual scrolling if grid has > 100 items (optional future enhancement)

**Validation:** Page renders quickly, scrolling is smooth, no performance warnings

---

### Task 5.7: Cross-tab synchronization testing
**Files:** `hooks/useFavorites.ts`, `hooks/useLikes.ts`
**Dependencies:** Phase 1, Phase 4 complete
**Description:** Test and verify cross-tab sync works correctly
- [ ] Open app in two browser tabs
- [ ] Save favorite in tab 1, verify it appears in tab 2 Favorites page
- [ ] Remove favorite in tab 2, verify it disappears in tab 1
- [ ] Test likes synchronization across tabs
- [ ] Test rapid actions in both tabs simultaneously
- [ ] Fix any race conditions or sync issues

**Validation:** Changes in one tab immediately reflect in other tabs, no sync bugs

---

### Task 5.8: Integration testing
**Files:** All
**Dependencies:** All phases complete
**Description:** End-to-end testing of complete favorites feature
- [ ] Test flow: Browse feed → Save movie → Navigate to Favorites → See saved movie
- [ ] Test flow: Remove from Favorites → Return to feed → Verify unsaved state
- [ ] Test flow: Save movie from Movies tab → Switch to TV Shows tab → Save TV show → Navigate to Favorites → Filter by Movies → See only movie
- [ ] Test search: Save 5 movies → Search for specific title → Verify results
- [ ] Test sorting: Save multiple items → Sort by Title A-Z → Verify order
- [ ] Test empty state: Remove all favorites → Verify empty state → Click "Browse Feed" → Verify navigation
- [ ] Test navigation: Use bottom tab bar → Use header button → Both work
- [ ] Test Like independence: Like movie without saving → Verify not in Favorites

**Validation:** All user flows work end-to-end, no bugs, smooth experience

---

## Phase 6: Build & Deployment

### Task 6.1: Run npm build and fix errors
**Dependencies:** All phases complete
**Description:** Build production bundle and resolve any issues
- [ ] Run `npm run build`
- [ ] Fix any TypeScript errors
- [ ] Fix any ESLint warnings
- [ ] Fix any build warnings (unused variables, imports, etc.)
- [ ] Verify build completes successfully
- [ ] Test production build locally: `npm run start`

**Validation:** Build succeeds with no errors, production app runs correctly

---

### Task 6.2: Update documentation
**Files:** `README.md`, `CLAUDE.md` (if needed)
**Dependencies:** All tasks complete
**Description:** Document new Favorites feature
- [ ] Update README with Favorites page description
- [ ] Document localStorage structure for developers
- [ ] Document component architecture for Favorites
- [ ] Add screenshots or GIFs of Favorites page (optional)
- [ ] Update any developer documentation

**Validation:** Documentation is clear and helpful for future developers

---

### Task 6.3: Final testing before commit
**Dependencies:** All phases complete
**Description:** Final comprehensive test before committing changes
- [ ] Test all features on local development server
- [ ] Test all features on production build
- [ ] Verify no console errors or warnings
- [ ] Verify no broken links or navigation
- [ ] Test on at least 2 different browsers (Chrome, Safari)
- [ ] Test on at least 1 mobile device (real device or simulator)

**Validation:** Everything works perfectly, no bugs found

---

## Notes

**Parallelizable Tasks:**
- Phase 1 (data layer) can be completed first
- Phase 2 (navigation) can be started in parallel with Phase 1
- Phase 3 (UI components) depends on Phase 1 types but can start on layout/styling early
- Phase 4 (integration) depends on Phase 1 and Phase 3

**Testing Strategy:**
- Manual testing throughout development
- Component testing in isolation before integration
- End-to-end testing after all phases complete
- Real device testing for mobile-specific features (safe areas, gestures)

**Performance Targets:**
- Page load < 1 second
- Search/filter updates < 100ms
- Smooth 60fps scrolling
- LocalStorage operations < 50ms

**Browser Compatibility:**
- Modern browsers: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- iOS Safari 14+ (safe-area-inset support)
- Chrome Android 90+
