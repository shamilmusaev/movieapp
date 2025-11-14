# CineSwipe

A mobile-first video discovery application built with Next.js and TMDB API.

## Environment Setup

Before running the application, you need to configure the TMDB API integration:

1. **Get a TMDB API Key**
   - Visit [TMDB API Settings](https://www.themoviedb.org/settings/api)
   - Sign up for an account (if you don't have one)
   - Request an API key for developer use
   - Copy your API key (it's a 32-character string)

2. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local

   # Edit .env.local and add your TMDB API key
   NEXT_PUBLIC_TMDB_API_KEY=your_actual_api_key_here
   ```

3. **Verify Configuration**
   - Make sure your `.env.local` file is in the project root
   - The API key should be a 32-character hexadecimal string
   - Never commit `.env.local` to version control

## Getting Started

Once you've configured the environment variables, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

This project follows a clean architecture with clear separation of concerns:

```
├── app/                 # Next.js App Router pages and layouts
├── components/          # Reusable UI components
│   ├── atoms/          # Small, single-purpose components
│   ├── molecules/      # Component combinations
│   └── organisms/      # Complex component structures
├── lib/                # Core business logic and utilities
│   ├── api/tmdb/      # TMDB API client and functions
│   └── utils/          # Helper functions and utilities
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── context/            # React context providers
```

## Key Features

- **Type-Safe API Integration**: Full TypeScript support for TMDB API
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Rate Limiting**: Built-in rate limiting to respect TMDB API limits
- **Caching**: Intelligent caching strategy for optimal performance
- **Mobile-First**: Responsive design optimized for mobile devices

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [TMDB API Documentation](https://developer.themoviedb.org/docs) - understand the movie database API
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - learn about TypeScript
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
