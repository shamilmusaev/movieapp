# Project Structure Specification - Delta

## ADDED Requirements

### Requirement: Favorites Page Route
The project SHALL include `/app/favorites/page.tsx` route following Next.js App Router conventions for the Favorites page.

#### Scenario: Favorites page route exists
- **GIVEN** developer navigates to project structure
- **WHEN** looking for Favorites page implementation
- **THEN** they find `/app/favorites/page.tsx` file

#### Scenario: Favorites page is accessible
- **GIVEN** user navigates to `/favorites` URL
- **WHEN** browser renders route
- **THEN** Next.js serves `/app/favorites/page.tsx` component

### Requirement: Favorites Components Organization
The project SHALL organize Favorites-related UI components in `/components/favorites/` directory following atomic design principles.

#### Scenario: Favorites components directory exists
- **GIVEN** developer needs to create favorites UI component
- **WHEN** choosing component location
- **THEN** component is placed in `/components/favorites/` directory

#### Scenario: Favorites components are modular
- **GIVEN** Favorites page has multiple UI elements (grid, card, header, empty state)
- **WHEN** components are organized
- **THEN** each element is separate component: `FavoritesGrid.tsx`, `FavoriteCard.tsx`, `FavoritesHeader.tsx`, `EmptyFavorites.tsx`

### Requirement: Navigation Components Organization
The project SHALL organize global navigation components in `/components/navigation/` directory.

#### Scenario: Navigation components directory exists
- **GIVEN** developer creates bottom tab bar or header navigation
- **WHEN** choosing component location
- **THEN** component is placed in `/components/navigation/` directory

#### Scenario: Bottom tab bar component location
- **GIVEN** bottom navigation is needed globally
- **WHEN** component is created
- **THEN** it is located at `/components/navigation/BottomTabBar.tsx`

### Requirement: Favorites Hooks Organization
The project SHALL provide custom React hooks for favorites and likes management in `/hooks/` directory.

#### Scenario: Favorites hook exists
- **GIVEN** components need to interact with favorites
- **WHEN** importing favorites logic
- **THEN** they import `useFavorites` hook from `/hooks/useFavorites.ts`

#### Scenario: Likes hook exists
- **GIVEN** components need to interact with likes
- **WHEN** importing likes logic
- **THEN** they import `useLikes` hook from `/hooks/useLikes.ts`

### Requirement: Favorites Utilities Organization
The project SHALL provide favorites-related utility functions in `/lib/favorites.ts` for localStorage operations.

#### Scenario: Favorites utilities location
- **GIVEN** developer needs localStorage helper functions for favorites
- **WHEN** looking for utilities
- **THEN** they find `loadFavorites`, `saveFavorite`, `removeFavorite`, `isFavorite` functions in `/lib/favorites.ts`

### Requirement: Favorites Type Definitions
The project SHALL define favorites-related TypeScript types in `/types/favorites.types.ts`.

#### Scenario: Favorites types location
- **GIVEN** developer needs type definitions for favorites
- **WHEN** importing types
- **THEN** they import from `/types/favorites.types.ts` using path alias `@/types/favorites.types`

#### Scenario: Favorites types are comprehensive
- **GIVEN** favorites feature requires type safety
- **WHEN** defining types
- **THEN** file includes: `FavoriteItem`, `FavoritesList`, `SortOption`, `ContentTypeFilter` types
