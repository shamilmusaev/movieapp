# Project Structure Specification

## ADDED Requirements

### Requirement: Folder Organization
The project SHALL follow Next.js App Router conventions with clear separation of concerns using the following directory structure:
- `/app` for routes, layouts, and page components
- `/components` for reusable UI components organized by atomic design principles
- `/lib` for utilities, API clients, and shared logic
- `/hooks` for custom React hooks
- `/context` for React context providers
- `/types` for shared TypeScript type definitions
- `/public` for static assets

#### Scenario: Developer locates API client code
- **GIVEN** a developer needs to modify TMDB API integration
- **WHEN** they navigate the project structure
- **THEN** they find all API client code in `/lib/api/` directory

#### Scenario: Component reuse across pages
- **GIVEN** a UI component is needed in multiple pages
- **WHEN** the component is created
- **THEN** it is placed in `/components` with appropriate subdirectory organization (atoms/molecules/organisms)

### Requirement: File Naming Conventions
The project SHALL enforce consistent file naming:
- React components use PascalCase (e.g., `MovieCard.tsx`)
- Utilities and hooks use camelCase (e.g., `useFeedData.ts`, `apiClient.ts`)
- Constants use UPPER_SNAKE_CASE (e.g., `API_CONSTANTS.ts`)
- Type definition files use camelCase with `.types.ts` suffix (e.g., `movie.types.ts`)

#### Scenario: New component file creation
- **GIVEN** a developer creates a new UI component called "Video Player"
- **WHEN** they create the file
- **THEN** the file is named `VideoPlayer.tsx` in PascalCase

#### Scenario: New utility function creation
- **GIVEN** a developer creates a utility for formatting movie data
- **WHEN** they create the file
- **THEN** the file is named `formatMovieData.ts` in camelCase

### Requirement: Path Aliases
The project SHALL configure TypeScript path aliases to enable clean imports:
- `@/` maps to project root
- `@/components` maps to components directory
- `@/lib` maps to lib directory
- `@/hooks` maps to hooks directory
- `@/types` maps to types directory

#### Scenario: Import component using path alias
- **GIVEN** a component needs to import from `/components/atoms/Button.tsx`
- **WHEN** the import statement is written
- **THEN** it uses `import { Button } from '@/components/atoms/Button'` instead of relative paths

#### Scenario: Import type using path alias
- **GIVEN** a file needs to import Movie type
- **WHEN** the import statement is written
- **THEN** it uses `import type { Movie } from '@/types/movie.types'`

### Requirement: Environment Configuration
The project SHALL use `.env.local` for environment variables with the following structure:
- `NEXT_PUBLIC_TMDB_API_KEY` for TMDB API authentication
- `NEXT_PUBLIC_TMDB_BASE_URL` for API base URL (default: https://api.themoviedb.org/3)
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser

#### Scenario: API key configuration
- **GIVEN** a developer needs to configure TMDB API access
- **WHEN** they set up the project
- **THEN** they create `.env.local` with `NEXT_PUBLIC_TMDB_API_KEY=<their-key>`

#### Scenario: Environment variable access in client code
- **GIVEN** the TMDB client needs to access the API key
- **WHEN** it reads the configuration
- **THEN** it accesses `process.env.NEXT_PUBLIC_TMDB_API_KEY`
