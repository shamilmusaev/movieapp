# Favorites Management Specification - Delta

## ADDED Requirements

### Requirement: Favorites Page Display
The system SHALL provide a dedicated Favorites page at `/favorites` route displaying all saved movies, TV shows, and anime in a responsive grid layout with poster cards.

#### Scenario: Navigate to Favorites page
- **GIVEN** user clicks Favorites icon in bottom tab bar or header button
- **WHEN** navigation occurs
- **THEN** browser navigates to `/favorites` route and displays Favorites page

#### Scenario: Display favorites as grid
- **GIVEN** user has saved items in favorites
- **WHEN** Favorites page loads
- **THEN** all favorites are displayed in responsive grid (2 cols mobile, 3-4 cols tablet, 4-6 cols desktop)

#### Scenario: Each favorite card shows metadata
- **GIVEN** a favorite item is displayed in grid
- **WHEN** user views the card
- **THEN** card shows poster image, title, year, genres (max 2), rating, and save date

#### Scenario: Hover reveals action buttons
- **GIVEN** user hovers/taps on favorite card
- **WHEN** interaction occurs
- **THEN** overlay appears with buttons: "Remove from Favorites", "View Details"

#### Scenario: Remove from favorites
- **GIVEN** user clicks "Remove from Favorites" button
- **WHEN** action is confirmed
- **THEN** item is removed from localStorage and grid updates immediately

#### Scenario: View details from favorites
- **GIVEN** user clicks "View Details" button or card title
- **WHEN** click occurs
- **THEN** system navigates to movie detail page (future implementation) or opens TMDB link

#### Scenario: Empty favorites state
- **GIVEN** user has no saved favorites
- **WHEN** Favorites page loads
- **THEN** empty state is displayed with message "No favorites yet" and "Browse Feed" button

### Requirement: Content Type Filtering
The system SHALL provide horizontal tab navigation at top of Favorites page to filter favorites by content type: All, Movies, TV Shows, Anime.

#### Scenario: Display content type tabs
- **GIVEN** Favorites page is loaded
- **WHEN** user views top of page
- **THEN** tabs are displayed: "All", "Movies", "TV Shows", "Anime" with item counts in badges

#### Scenario: Filter by Movies
- **GIVEN** user taps "Movies" tab
- **WHEN** filter is applied
- **THEN** grid displays only items with `contentType: 'movie'`

#### Scenario: Filter by TV Shows
- **GIVEN** user taps "TV Shows" tab
- **WHEN** filter is applied
- **THEN** grid displays only items with `contentType: 'tv'`

#### Scenario: Filter by Anime
- **GIVEN** user taps "Anime" tab
- **WHEN** filter is applied
- **THEN** grid displays only items with `contentType: 'anime'`

#### Scenario: Default to All on first visit
- **GIVEN** user visits Favorites page for first time
- **WHEN** page loads
- **THEN** "All" tab is active and all favorites are displayed

#### Scenario: Persist tab selection in session
- **GIVEN** user switches to "Movies" tab
- **WHEN** user navigates away and returns to Favorites page
- **THEN** "Movies" tab remains active during same browser session

### Requirement: Sorting Options
The system SHALL provide sorting controls to reorder favorites by different criteria: Date Added, Title, Rating.

#### Scenario: Display sorting dropdown
- **GIVEN** Favorites page is loaded
- **WHEN** user views header controls
- **THEN** sorting dropdown/button group is displayed with current sort option

#### Scenario: Sort by Date Added (newest first)
- **GIVEN** user selects "Date Added (newest)" from sort dropdown
- **WHEN** sort is applied
- **THEN** favorites are ordered by `savedAt` timestamp descending

#### Scenario: Sort by Date Added (oldest first)
- **GIVEN** user selects "Date Added (oldest)" from sort dropdown
- **WHEN** sort is applied
- **THEN** favorites are ordered by `savedAt` timestamp ascending

#### Scenario: Sort by Title (A-Z)
- **GIVEN** user selects "Title (A-Z)" from sort dropdown
- **WHEN** sort is applied
- **THEN** favorites are ordered alphabetically by title ascending

#### Scenario: Sort by Title (Z-A)
- **GIVEN** user selects "Title (Z-A)" from sort dropdown
- **WHEN** sort is applied
- **THEN** favorites are ordered alphabetically by title descending

#### Scenario: Sort by Rating (high to low)
- **GIVEN** user selects "Rating" from sort dropdown
- **WHEN** sort is applied
- **THEN** favorites are ordered by `vote_average` descending

#### Scenario: Default sort on first visit
- **GIVEN** user visits Favorites page for first time
- **WHEN** page loads
- **THEN** favorites are sorted by Date Added (newest first)

#### Scenario: Persist sort preference
- **GIVEN** user selects "Title (A-Z)" sort option
- **WHEN** user navigates away and returns
- **THEN** sort preference persists during same browser session (sessionStorage)

### Requirement: Search Functionality
The system SHALL provide real-time search bar to filter favorites by movie/TV show title.

#### Scenario: Display search bar
- **GIVEN** Favorites page is loaded
- **WHEN** user views header
- **THEN** search input field is displayed below tabs with placeholder "Search favorites..."

#### Scenario: Real-time search filtering
- **GIVEN** user types "Matrix" in search bar
- **WHEN** input changes
- **THEN** grid updates in real-time showing only favorites matching "matrix" (case-insensitive)

#### Scenario: Debounce search input
- **GIVEN** user types rapidly in search bar
- **WHEN** input events fire
- **THEN** search filtering is debounced by 300ms to avoid excessive re-renders

#### Scenario: Clear search
- **GIVEN** search bar has text "Avatar"
- **WHEN** user clicks "X" clear button
- **THEN** search input is cleared and all favorites are displayed again

#### Scenario: No search results
- **GIVEN** user searches for "XYZ123NonExistent"
- **WHEN** no favorites match search query
- **THEN** "No results found" message is displayed with current search term

#### Scenario: Search works with filters
- **GIVEN** user has "Movies" tab active and searches "Avatar"
- **WHEN** both filters are applied
- **THEN** grid shows only movies matching "Avatar" (filters are combined)

### Requirement: LocalStorage Persistence
The system SHALL persist favorites in browser localStorage using structured JSON format with movie data, timestamp, and content type.

#### Scenario: Save movie to favorites
- **GIVEN** user clicks Save button in feed
- **WHEN** save action occurs
- **THEN** movie object with `{ movie, savedAt, contentType }` is stored in localStorage at key `cineswipe_favorites.{movieId}`

#### Scenario: Favorites stored as object map
- **GIVEN** multiple favorites are saved
- **WHEN** accessing favorites from localStorage
- **THEN** data structure is `{ [movieId]: { movie, savedAt, contentType } }` for O(1) lookup

#### Scenario: Check if movie is already saved
- **GIVEN** user views movie in feed
- **WHEN** VideoOverlay renders Save button
- **THEN** system checks `cineswipe_favorites.{movieId}` exists to show filled/unfilled icon

#### Scenario: Remove from favorites
- **GIVEN** user removes item from favorites
- **WHEN** remove action occurs
- **THEN** entry is deleted from `cineswipe_favorites` object and localStorage is updated

#### Scenario: Load favorites on page mount
- **GIVEN** user navigates to Favorites page
- **WHEN** page component mounts
- **THEN** system reads `cineswipe_favorites` from localStorage and parses JSON

#### Scenario: Handle corrupted localStorage data
- **GIVEN** localStorage contains invalid JSON for `cineswipe_favorites`
- **WHEN** system attempts to parse favorites
- **THEN** error is caught, localStorage is cleared, empty favorites object is initialized

#### Scenario: Cross-tab sync
- **GIVEN** user has two tabs open with CineSwipe
- **WHEN** user saves favorite in tab A
- **THEN** tab B detects `storage` event and updates favorites state automatically

### Requirement: Like vs Save Distinction
The system SHALL maintain separate storage and behavior for Like (recommendation signal) and Save (favorites) actions.

#### Scenario: Like stored separately from Save
- **GIVEN** user clicks Like button
- **WHEN** like action occurs
- **THEN** movie ID is stored in `cineswipe_likes` localStorage key (separate from favorites)

#### Scenario: Save adds to favorites
- **GIVEN** user clicks Save button
- **WHEN** save action occurs
- **THEN** movie is stored in `cineswipe_favorites` localStorage key and appears on Favorites page

#### Scenario: Like does not appear in Favorites
- **GIVEN** user has liked movie but not saved it
- **WHEN** user opens Favorites page
- **THEN** liked movie does NOT appear in favorites list

#### Scenario: Independent state management
- **GIVEN** user has liked and saved same movie
- **WHEN** user unlikes movie
- **THEN** movie remains in favorites (like and save states are independent)

### Requirement: Bottom Navigation Bar
The system SHALL provide persistent bottom tab bar for global navigation with three tabs: Feed, Favorites, Profile.

#### Scenario: Display bottom tab bar
- **GIVEN** user is on any main page (Feed, Favorites)
- **WHEN** page renders
- **THEN** bottom tab bar is visible with three tabs: Feed (home icon), Favorites (bookmark icon), Profile (user icon)

#### Scenario: Navigate to Feed
- **GIVEN** user is on Favorites page
- **WHEN** user taps Feed tab
- **THEN** browser navigates to `/feed` and Feed tab is highlighted

#### Scenario: Navigate to Favorites
- **GIVEN** user is on Feed page
- **WHEN** user taps Favorites tab
- **THEN** browser navigates to `/favorites` and Favorites tab is highlighted

#### Scenario: Highlight active tab
- **GIVEN** user is on Favorites page
- **WHEN** bottom tab bar is displayed
- **THEN** Favorites tab is highlighted with accent color and active indicator

#### Scenario: Safe area support
- **GIVEN** app runs on iPhone with home indicator
- **WHEN** bottom tab bar is rendered
- **THEN** tab bar includes `padding-bottom: env(safe-area-inset-bottom)` to clear iOS home bar

#### Scenario: Profile tab placeholder
- **GIVEN** user taps Profile tab
- **WHEN** navigation occurs
- **THEN** system navigates to `/profile` (placeholder page for future implementation)

#### Scenario: Auto-hide on scroll down in Feed
- **GIVEN** user scrolls down in Feed page
- **WHEN** scroll direction is detected as downward
- **THEN** bottom tab bar slides down and hides for immersive experience

#### Scenario: Auto-show on scroll up in Feed
- **GIVEN** bottom tab bar is hidden and user scrolls up
- **WHEN** scroll direction is detected as upward
- **THEN** bottom tab bar slides up and becomes visible again

### Requirement: Header Navigation Button
The system SHALL provide alternative entry point to Favorites page via header button in Feed page.

#### Scenario: Display header Favorites button
- **GIVEN** user is viewing Feed page
- **WHEN** looking at top of screen
- **THEN** Favorites icon button is visible in top-right corner of header

#### Scenario: Navigate to Favorites from header
- **GIVEN** user is on Feed page
- **WHEN** user taps Favorites header button
- **THEN** browser navigates to `/favorites` route

#### Scenario: Button shows active state
- **GIVEN** user is on Favorites page
- **WHEN** header is displayed
- **THEN** Favorites button is highlighted/active to indicate current page

### Requirement: Responsive Design
The system SHALL adapt Favorites page layout to different screen sizes while maintaining mobile-first approach.

#### Scenario: Mobile portrait (< 768px)
- **GIVEN** viewport width is less than 768px
- **WHEN** Favorites page renders
- **THEN** grid displays 2 columns with compact spacing

#### Scenario: Tablet (768px - 1024px)
- **GIVEN** viewport width is between 768px and 1024px
- **WHEN** Favorites page renders
- **THEN** grid displays 3-4 columns with medium spacing

#### Scenario: Desktop (> 1024px)
- **GIVEN** viewport width is greater than 1024px
- **WHEN** Favorites page renders
- **THEN** grid displays 4-6 columns with centered max-width constraint (1280px)

#### Scenario: Touch-friendly targets
- **GIVEN** Favorites page is displayed on mobile
- **WHEN** rendering interactive elements (buttons, tabs)
- **THEN** all tap targets are minimum 44px in size

#### Scenario: Smooth scroll behavior
- **GIVEN** user scrolls through Favorites page
- **WHEN** scroll occurs
- **THEN** smooth scroll CSS is applied for fluid experience
