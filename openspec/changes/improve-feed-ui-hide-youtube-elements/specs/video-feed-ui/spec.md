# Video Feed UI Specification - Delta

## ADDED Requirements

### Requirement: Independent Feed State Per Content Type
The system SHALL maintain separate feed state for each content type (Movies, TV Shows, Anime) using `Record<FeedContentType, FeedState>` structure to enable independent pagination and content caching.

#### Scenario: Maintain separate state per content type
- **GIVEN** feed manages multiple content types
- **WHEN** storing feed state
- **THEN** state structure uses `Record<'movie' | 'tv' | 'anime', FeedState>` mapping each type to its own state

#### Scenario: Each state contains complete pagination data
- **GIVEN** state for a content type is stored
- **WHEN** accessing state
- **THEN** state includes: `movies: MovieWithTrailer[]`, `page: number`, `hasMore: boolean`, `viewedMovieIds: Set<number>`, `loading: boolean`, `error: string | null`

#### Scenario: Initialize new content type state
- **GIVEN** user switches to content type never loaded before
- **WHEN** accessing state for that type
- **THEN** system creates new FeedState with page=1, empty movies array, hasMore=true

#### Scenario: Restore cached content type state
- **GIVEN** user previously loaded Movies and switched to TV Shows
- **WHEN** user switches back to Movies
- **THEN** system restores previous Movies state with all loaded movies and current page number

#### Scenario: Independent pagination counters
- **GIVEN** Movies at page 3, TV Shows at page 1, Anime at page 2
- **WHEN** user switches between tabs
- **THEN** each content type maintains its own page counter independently

### Requirement: Content Type Navigation Tabs
The system SHALL provide horizontal tab navigation at the top of the feed allowing users to switch between Movies, TV Shows, and Anime content types.

#### Scenario: Display content type tabs
- **GIVEN** feed page loads
- **WHEN** user views the top of the screen
- **THEN** horizontal tab bar displays with three options: "Movies", "TV Shows", "Anime"

#### Scenario: Highlight active tab
- **GIVEN** user is viewing a specific content type
- **WHEN** looking at tab bar
- **THEN** active tab is visually highlighted with underline or background color

#### Scenario: Switch to Movies content
- **GIVEN** user is viewing TV Shows or Anime
- **WHEN** user taps "Movies" tab
- **THEN** feed refreshes and displays trending movie trailers

#### Scenario: Switch to TV Shows content
- **GIVEN** user is viewing Movies or Anime
- **WHEN** user taps "TV Shows" tab
- **THEN** feed refreshes and displays trending TV show trailers/teasers

#### Scenario: Switch to Anime content
- **GIVEN** user is viewing Movies or TV Shows
- **WHEN** user taps "Anime" tab
- **THEN** feed refreshes and displays anime trailers (filtered by animation genre and Japan region)

#### Scenario: Default to Movies on first visit
- **GIVEN** user visits feed for the first time
- **WHEN** page loads
- **THEN** "Movies" tab is active by default

#### Scenario: Persist tab selection in session
- **GIVEN** user switches to TV Shows or Anime
- **WHEN** user scrolls through feed and refreshes page
- **THEN** previously selected tab remains active during the same session

#### Scenario: Independent pagination per content type
- **GIVEN** user has scrolled through 20 movies
- **WHEN** user switches to TV Shows tab
- **THEN** system shows first page of TV shows (separate state, not affected by movie pagination)

#### Scenario: Restore previous content when returning to tab
- **GIVEN** user loaded 20 movies, then switched to TV Shows
- **WHEN** user switches back to Movies tab
- **THEN** previously loaded 20 movies are displayed immediately (cached state restored)

#### Scenario: Anime filtering with multi-stage strategy
- **GIVEN** user switches to Anime tab
- **WHEN** API route fetches anime content
- **THEN** request uses `/discover/movie` with `with_origin_country=JP`, `with_genres=16`, `sort_by=popularity.desc`, `vote_count.gte=50`

#### Scenario: Anime fallback when insufficient results
- **GIVEN** primary anime discover returns < 10 results
- **WHEN** API route evaluates results
- **THEN** system retries without `with_original_language` constraint or uses `with_keywords=210024` (anime keyword)

#### Scenario: Anime trailer fetching without append_to_response
- **GIVEN** anime movies fetched from `/discover`
- **WHEN** API route needs trailers
- **THEN** system makes separate parallel `/movie/{id}/videos` requests for each anime movie (discover does not support append_to_response)

## MODIFIED Requirements

### Requirement: Feed Container Layout
The system SHALL provide a full-screen vertical scrolling container that displays video cards with content type navigation at the top.

#### Scenario: Tab bar positioned at top of feed
- **GIVEN** feed page is displayed
- **WHEN** user views screen
- **THEN** content type tabs are fixed at the top, above video cards

#### Scenario: Video cards fill screen below tabs
- **GIVEN** tabs are displayed at top
- **WHEN** rendering video cards
- **THEN** each card fills remaining screen height (100vh minus tab bar height)

#### Scenario: Tab bar remains visible during scroll
- **GIVEN** user is scrolling through feed
- **WHEN** swiping between videos
- **THEN** tab bar remains fixed at top (does not scroll away)

#### Scenario: Smooth transition when switching tabs
- **GIVEN** user taps a different content type tab
- **WHEN** feed content changes
- **THEN** old content fades out and new content fades in smoothly
