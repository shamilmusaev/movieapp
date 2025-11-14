# Type System Specification

## ADDED Requirements

### Requirement: Movie Type Definition
The system SHALL define a `Movie` type that represents movie data from TMDB with all essential properties for display and interaction.

#### Scenario: Movie object contains required display data
- **GIVEN** a movie is fetched from TMDB
- **WHEN** it is typed as Movie
- **THEN** it includes id, title, overview, poster_path, backdrop_path, release_date, vote_average, and genre_ids

#### Scenario: TypeScript validates movie property access
- **GIVEN** a component receives a Movie object
- **WHEN** it accesses movie.title
- **THEN** TypeScript confirms the property exists and is of type string

### Requirement: Video Type Definition
The system SHALL define a `Video` type that represents trailer and clip data from TMDB including YouTube keys and metadata.

#### Scenario: Video object contains YouTube information
- **GIVEN** a video is fetched from TMDB
- **WHEN** it is typed as Video
- **THEN** it includes id, key, name, site, type, and official flag

#### Scenario: Filter official trailers from videos
- **GIVEN** a movie has multiple videos
- **WHEN** filtering for official trailers
- **THEN** TypeScript validates access to `type === "Trailer"` and `official === true` properties

### Requirement: Genre Type Definition
The system SHALL define a `Genre` type that represents genre metadata from TMDB for categorization and filtering.

#### Scenario: Genre object structure
- **GIVEN** genres are fetched from TMDB
- **WHEN** they are typed as Genre
- **THEN** each genre includes id (number) and name (string)

#### Scenario: Genre mapping in movie display
- **GIVEN** a movie with genre_ids array
- **WHEN** mapping IDs to Genre objects
- **THEN** TypeScript validates the transformation returns Genre[] type

### Requirement: API Response Types
The system SHALL define typed responses for TMDB API endpoints to ensure type safety in data fetching logic.

#### Scenario: Paginated movie list response
- **GIVEN** a request is made to trending or popular endpoints
- **WHEN** the response is received
- **THEN** it is typed with page, results: Movie[], total_pages, and total_results

#### Scenario: Movie details response
- **GIVEN** a request is made for movie details
- **WHEN** the response is received
- **THEN** it includes Movie properties plus additional fields like runtime, budget, revenue, and production_companies

#### Scenario: Videos response structure
- **GIVEN** a request is made for movie videos
- **WHEN** the response is received
- **THEN** it is typed with id and results: Video[]

### Requirement: Watch Provider Types
The system SHALL define types for streaming availability data including providers, regions, and link types.

#### Scenario: Watch provider object structure
- **GIVEN** watch providers are fetched
- **WHEN** they are typed
- **THEN** each provider includes logo_path, provider_id, provider_name, and display_priority

#### Scenario: Regional watch provider data
- **GIVEN** watch providers are organized by region
- **WHEN** accessing provider data for a specific country
- **THEN** TypeScript validates the structure includes flatrate, rent, and buy arrays

### Requirement: Error Types
The system SHALL define custom error types for different failure scenarios to enable proper error handling and user feedback.

#### Scenario: API authentication error
- **GIVEN** an API request fails due to invalid credentials
- **WHEN** the error is thrown
- **THEN** it is typed as ApiAuthenticationError with message and statusCode properties

#### Scenario: Network error
- **GIVEN** a network request fails
- **WHEN** the error is thrown
- **THEN** it is typed as NetworkError with original error details

#### Scenario: Not found error
- **GIVEN** a requested resource doesn't exist
- **WHEN** the error is thrown
- **THEN** it is typed as NotFoundError with resourceType and resourceId properties

### Requirement: Utility Types
The system SHALL define utility types for common patterns like loading states, API results, and optional data.

#### Scenario: API result wrapper type
- **GIVEN** a function fetches data asynchronously
- **WHEN** the result is returned
- **THEN** it uses ApiResult<T> type that includes data, loading, and error states

#### Scenario: Nullable types for optional API fields
- **GIVEN** TMDB returns fields that may be null
- **WHEN** defining types
- **THEN** optional fields use `field?: Type` or `field: Type | null` appropriately
