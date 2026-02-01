# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Japaneasy is a Japanese language learning platform built with Next.js 16 (App Router) and React 19. It uses a spaced repetition system (SRS) for JLPT vocabulary study, with gamified progression through levels N5 to N1.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server

# Database (requires PostgreSQL via Docker)
docker compose up -d              # Start PostgreSQL 17.0 container
npm run db:generate               # Generate Drizzle migrations from schema
npm run db:migrate                # Apply migrations to database
npm run db:push                   # Push schema directly (skips migration files)
npm run db:studio                 # Open Drizzle Studio visual browser
```

No test runner is currently configured.

## Architecture

### Routing & Layout Groups

The app uses Next.js App Router with route groups for layout separation:
- `src/app/(marketing)/` — Public pages: landing page, auth (signin/signup)
- `src/app/(platform)/` — Protected pages: dashboard and study features

Each group has its own layout, enabling different navigation and styling per context.

### Authentication

Better Auth with Drizzle adapter (`src/lib/auth.ts`). Email/password auth enabled. Better Auth manages its own tables (`user`, `session`, `account`, `verification`) defined in `src/drizzle/schema.ts`. Application-specific user data (e.g., `userProgress`) is separate and references Better Auth's user ID.

### Database

- **ORM**: Drizzle ORM with PostgreSQL (`postgres` driver)
- **Schema**: `src/drizzle/schema.ts` — all table definitions including Better Auth tables and app tables
- **Client**: `src/drizzle/index.ts` — exports singleton `db` instance
- **Migrations**: `src/drizzle/migrations/`
- **Config**: `drizzle.config.ts` — points to schema, uses `DATABASE_URL` from `.env`
- **Docker**: `docker-compose.yml` — PostgreSQL 17.0, reads `DB_NAME`, `DB_USER`, `DB_PASSWORD` from `.env`

The database design doc (`japaneasy-database-implementation.md`) contains the planned full schema with SRS tables (userProgress, words, userWords, userLevelProgress, reviews) and the spaced repetition algorithm design.

### UI Components

shadcn/ui pattern (new-york style) with components in `src/components/ui/`. Uses:
- Class Variance Authority (CVA) for component variants
- Radix UI primitives for accessibility
- Lucide React for icons
- React Hook Form + Zod for form validation

shadcn config is in `components.json`. Add new components with `npx shadcn@latest add <component>`.

### Styling

- Tailwind CSS 4 with PostCSS
- OKLch color space for all design tokens (defined as CSS variables in `src/app/globals.css`)
- Light/dark mode via `.dark` class selector (next-themes)
- Custom brand colors: `--orange-light`, `--orange-medium`, `--orange-dark`, `--peach`, `--cream`
- Three fonts: Geist (sans), Geist Mono, Cherry Bomb One (display/branding)

### Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Code Style

- Prettier with `@ianvs/prettier-plugin-sort-imports` and `prettier-plugin-tailwindcss`
- Single quotes, semicolons, `es5` trailing commas, arrow parens `avoid`, print width 100
- Import order: react > next > third-party > workspace > drizzle > types > config > lib > hooks > auth > components/ui > components > app > relative
- ESLint: `next/core-web-vitals` + `next/typescript` (unused vars rule disabled)
- React Compiler enabled in `next.config.ts`
