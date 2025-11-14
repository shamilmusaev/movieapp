# Feed Data Integration Specification

## ADDED Requirements

### Requirement: Trending Movies as Feed Source
The system SHALL fetch trending movies from TMDB API as the primary source for the feed, providing fresh and popular content to users.

#### Scenario: Fetch initial batch of trending movies
- **GIVEN** the feed page loads
- **WHEN** initial data is requested
- **THEN** the system fetches the first page of daily trending movies from TMDB `/trending/movie/day` endpoint

#### Scenario: Pagination through trending movies
- **GIVEN** user has scrolled through initial movies
- **WHEN** more content is needed
- **THEN** the system fetches the next page of trending movies with incremented page parameter

#### Scenario: Trending movies with metadata
- **GIVEN** trending movies are fetched
- **WHEN** data is processed
- **THEN** each movie includes id, title, overview, poster_path, backdrop_path, release_date, vote_average, and genre_ids

### Requirement: Trailer Extraction and Filtering
The system SHALL extract official trailers from TMDB video data for each movie, prioritizing YouTube trailers and filtering for the best quality trailer.

#### Scenario: Extract official trailer from movie videos
- **GIVEN** a movie has multiple videos in TMDB
- **WHEN** trailer data is requested
- **THEN** the system filters for videos where `type === "Trailer"` and `official === true` and `site === "YouTube"`

#### Scenario: Select best trailer when multiple exist
- **GIVEN** a movie has multiple official trailers
- **WHEN** selecting which trailer to use
- **THEN** the system prioritizes: 1) "Official Trailer", 2) first trailer marked official, 3) first YouTube trailer

#### Scenario: Movie with no trailer
- **GIVEN** a movie has no trailer videos in TMDB
- **WHEN** trailer data is requested
- **THEN** the system returns null for trailer key and marks movie for poster-only display

#### Scenario: Batch fetch trailers for feed
- **GIVEN** initial trending movies are loaded (e.g., 20 movies)
- **WHEN** preparing feed data
- **THEN** the system fetches trailer data for all movies in parallel to minimize load time

### Requirement: Genre Mapping
The system SHALL fetch genre definitions from TMDB and map genre IDs to genre names for display in the feed.

#### Scenario: Load and cache genre list
- **GIVEN** the feed initializes
- **WHEN** genre data is needed
- **THEN** the system fetches `/genre/movie/list` once and caches results in memory

#### Scenario: Map genre IDs to names
- **GIVEN** a movie has genre_ids [28, 12, 878]
- **WHEN** preparing movie for display
- **THEN** the system maps these to ["Action", "Adventure", "Science Fiction"] using cached genre list

#### Scenario: Handle unknown genre IDs
- **GIVEN** a movie has a genre ID not in the cached list
- **WHEN** mapping genres
- **THEN** the system skips the unknown ID and logs a warning

### Requirement: Feed Data Deduplication
The system SHALL track viewed movies in the current session and prevent showing the same movie twice in the feed.

#### Scenario: Track viewed movie IDs
- **GIVEN** a user scrolls through the feed
- **WHEN** each video becomes visible
- **THEN** the movie ID is added to a viewed set in session storage

#### Scenario: Filter out already-viewed movies
- **GIVEN** new movies are being added to feed
- **WHEN** pagination fetches more data
- **THEN** movies with IDs already in the viewed set are filtered out

#### Scenario: Allow duplicates across sessions
- **GIVEN** a user closes and reopens the app
- **WHEN** the feed loads
- **THEN** the viewed set is cleared, allowing movies from previous session to appear

### Requirement: Feed Data Transformation
The system SHALL transform raw TMDB API responses into a feed-optimized format with computed fields and fallback values.

#### Scenario: Transform movie for feed display
- **GIVEN** raw TMDB movie data is received
- **WHEN** preparing for feed
- **THEN** the system creates a FeedMovie object with: id, title, overview, poster_url (computed from poster_path), backdrop_url, trailer_key, genres (mapped names), release_year, rating

#### Scenario: Compute image URLs with TMDB base path
- **GIVEN** a movie has poster_path "/abc123.jpg"
- **WHEN** transforming for display
- **THEN** poster_url is set to "https://image.tmdb.org/t/p/w500/abc123.jpg"

#### Scenario: Handle missing poster gracefully
- **GIVEN** a movie has null poster_path
- **WHEN** transforming data
- **THEN** poster_url is set to a placeholder image URL or null (UI handles fallback)

### Requirement: Error Handling for Missing Data
The system SHALL handle movies with incomplete data gracefully, either skipping them or providing sensible defaults.

#### Scenario: Movie missing critical data
- **GIVEN** a movie in TMDB has no title or ID
- **WHEN** processing trending movies
- **THEN** the movie is filtered out and not added to feed

#### Scenario: Movie with missing optional fields
- **GIVEN** a movie has no overview or release_date
- **WHEN** transforming for feed
- **THEN** overview is set to empty string and release_year to "Unknown", movie is still included

#### Scenario: Trailer fetch fails for specific movie
- **GIVEN** TMDB API returns error for one movie's trailer data
- **WHEN** batch fetching trailers
- **THEN** that movie's trailer_key is set to null (poster fallback) and other movies continue processing

### Requirement: Feed Performance Optimization
The system SHALL optimize data fetching to minimize API calls and reduce feed load time.

#### Scenario: Batch requests for efficiency
- **GIVEN** 20 movies need trailer data
- **WHEN** fetching trailers
- **THEN** requests are batched in groups of 5 concurrent requests to respect rate limits

#### Scenario: Cache genre data across feed sessions
- **GIVEN** genre list has been fetched once
- **WHEN** additional pages of movies are loaded
- **THEN** cached genre data is reused without refetching

#### Scenario: Prefetch next page near end of current page
- **GIVEN** user is within 3 videos of the end
- **WHEN** scrolling continues
- **THEN** next page of movies and their trailers are prefetched before user reaches the end
