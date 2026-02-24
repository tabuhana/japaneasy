# Japaneasy Database Implementation Plan

## Table of Contents
1. [Database Schema Overview](#database-schema-overview)
2. [Schema Definitions (Drizzle)](#schema-definitions-drizzle)
3. [Implementation Steps](#implementation-steps)
4. [Performance Optimizations](#performance-optimizations)
5. [Key Queries & API Routes](#key-queries--api-routes)
6. [Caching Strategy](#caching-strategy)
7. [Testing Strategy](#testing-strategy)

---

## Database Schema Overview

### Design Philosophy
This database is optimized for **per-user lookups**. Every query in the user-facing app starts with `userId`, which keeps search spaces small (hundreds of rows instead of billions). This pattern allows the app to scale to millions of users without performance degradation.

### Why This Scales
- **Indexed userId lookups**: Database jumps directly to a user's ~500 words instead of scanning 2 billion rows
- **Small result sets**: Even with 1M users, each query only touches one user's data
- **Capped data per user**: Maximum ~2000 words per user (all JLPT levels combined)
- **Simple joins**: UserWord → Word joins happen on pre-filtered sets of 20-50 rows

### Entity Relationship Diagram (Conceptual)
```
Better Auth (user/session tables)
  │
  └─── UserProgress (1) ──── (many) UserWord ──── (many) Word
              │                      │
              │                      └──── (many) Review
              │
              └──── (many) UserLevelProgress
```

**Note on Authentication:**
This app uses Better Auth for authentication, which manages its own `user` and `session` tables. Our application data is stored in `userProgress` (which references Better Auth's user ID) and related tables. This separation keeps auth logic independent from app-specific data.

---

## Schema Definitions (Drizzle)

### Installation & Setup
```bash
# Install Drizzle ORM and PostgreSQL driver
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Install additional dependencies
npm install dotenv
```

### File Structure
```
/src
  /db
    /schema
      userProgress.ts   # App-specific user data (Better Auth handles auth)
      word.ts
      userWord.ts
      userLevelProgress.ts
      review.ts
      enums.ts
      index.ts
    client.ts
    migrations/
  /lib
    /srs
      algorithm.ts
      constants.ts
```

---

### Environment Variables (`.env`)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/japaneasy"
```

---

### `/src/db/schema/enums.ts`
**Purpose:** Centralize enum definitions for type safety and reusability across the codebase.

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

// JLPT levels from beginner (N5) to advanced (N1)
export const jlptLevelEnum = pgEnum('jlpt_level', ['N5', 'N4', 'N3', 'N2', 'N1']);

// User's progress status for a specific level
export const levelStatusEnum = pgEnum('level_status', ['locked', 'active', 'completed']);

// Spaced repetition card status
// Progression: new -> learning -> reviewing -> mastered
// Note: "mastered" cards are still reviewed when due (60+ day intervals)
export const cardStatusEnum = pgEnum('card_status', ['new', 'learning', 'reviewing', 'mastered']);
```

**Reasoning:**
- **jlptLevelEnum**: Standard Japanese Language Proficiency Test levels. N5 = beginner, N1 = advanced.
- **levelStatusEnum**: 
  - `locked`: User hasn't reached this level yet
  - `active`: User is currently studying this level
  - `completed`: User mastered all words + passed test for this level
- **cardStatusEnum**: 
  - `new`: Just added, never reviewed
  - `learning`: Short intervals (1-7 days), building familiarity
  - `reviewing`: Medium intervals (1-8 weeks), strengthening retention
  - `mastered`: Long intervals (60+ days), long-term retention achieved (but still reviewed!)

---

### `/src/db/schema/userProgress.ts`
**Purpose:** Store app-specific user data. Authentication is handled by Better Auth (email, password, sessions).

```typescript
import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { jlptLevelEnum } from './enums';

export const userProgress = pgTable('user_progress', {
  // References Better Auth's user.id
  // This is the connection point between Better Auth and your app data
  userId: uuid('user_id').primaryKey(),
  
  // Which level they're actively studying (only one level at a time)
  // Defaults to N5 for new users
  currentActiveLevel: jlptLevelEnum('current_active_level').notNull().default('N5'),
  
  // Audit timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;
```

**Field Explanations:**
- **userId (uuid, primary key)**: 
  - **This is Better Auth's user ID**, not a separate ID you generate.
  - When Better Auth creates a user, you'll use that ID here.
  - Acts as foreign key reference for all other user-related tables.
  - **No auto-generation**: You manually set this to match Better Auth's user.id.
  
- **currentActiveLevel (enum, default 'N5')**: 
  - **Critical field**: Determines which word pool to draw from when adding new words.
  - Only ONE level is "active" at a time. Users must complete N5 entirely before N4 becomes active.
  - Used in queries: "Add 5 more N5 words for this user."
  
- **createdAt/updatedAt (timestamp)**: 
  - Audit trail for when user started using the app and last activity.
  - `updatedAt` useful for detecting inactive users.

**Index Strategy:**
- **Automatic index**: `userId` (primary key)
- **No additional indexes needed**: All queries use userId from Better Auth session.

**Integration with Better Auth:**

When a user signs up:
```typescript
// Better Auth creates user
const betterAuthUser = await auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'Nathan'
});

// Create corresponding app user progress
await db.insert(userProgress).values({
  userId: betterAuthUser.id, // Use Better Auth's ID
  currentActiveLevel: 'N5',
});
```

When querying user data:
```typescript
// Get user ID from Better Auth session
const session = await auth.getSession();
const userId = session.user.id;

// Get email/name from Better Auth
const email = session.user.email;
const name = session.user.name;

// Get app-specific data from your DB
const [progress] = await db
  .select()
  .from(userProgress)
  .where(eq(userProgress.userId, userId));

const currentLevel = progress.currentActiveLevel;
```

**Why This Separation?**
- **Single source of truth**: Email/password/name managed by Better Auth, not duplicated
- **Clean separation**: Auth logic vs. app logic
- **Easy migration**: If you switch auth providers, only this connection point changes
- **Foreign key integrity**: All your tables reference `userProgress.userId` with proper constraints

---

### `/src/db/schema/word.ts`
**Purpose:** Master word list containing all JLPT vocabulary. Populated once via CSV import script.

```typescript
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { jlptLevelEnum } from './enums';

export const words = pgTable('words', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Japanese representations
  kanji: varchar('kanji', { length: 100 }), // Can be null for kana-only words
  hiragana: varchar('hiragana', { length: 100 }).notNull(),
  romaji: varchar('romaji', { length: 100 }).notNull(),
  
  // English translation
  english: text('english').notNull(),
  
  // JLPT classification
  level: jlptLevelEnum('level').notNull(),
  
  // Optional enrichment (future: audio URLs, example sentences)
  // audioUrl: varchar('audio_url', { length: 500 }),
  // exampleSentence: text('example_sentence'),
  
  // Audit timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;
```

**Field Explanations:**
- **id (uuid)**: 
  - Primary key for word identification.
  - Referenced by `UserWord.wordId` to link users to words.
  
- **kanji (varchar, nullable)**: 
  - Some words are written only in kana (hiragana/katakana), so this can be null.
  - Example: "おはよう" (ohayou) has no kanji.
  
- **hiragana (varchar, required)**: 
  - Every Japanese word has a kana representation.
  - Used for pronunciation and searching.
  
- **romaji (varchar, required)**: 
  - Romanized version for beginners who can't read kana yet.
  - Example: "こんにちは" → "konnichiwa"
  
- **english (text)**: 
  - English translation/meaning.
  - Text type (no length limit) because some definitions are long.
  
- **level (enum, required)**: 
  - **Critical for filtering**: When adding new N5 words, query `WHERE level = 'N5'`.
  - Used in analytics: "How many N3 words are in the system?"
  
- **createdAt (timestamp)**: 
  - When this word was added to the database.
  - Useful for tracking database growth over time.

**Index Strategy:**
```sql
CREATE INDEX idx_words_level ON words(level);
```
- **Why?** Query: "Get random N5 words not yet added to this user's deck" filters by level first.
- **Performance**: Narrows search from 10,000+ words to ~1,000 N5 words before the NOT IN check. Now when you query for level = 'N5', PostgreSQL jumps directly to the N5 entries instead of scanning everything. This is O(log n) instead of O(n).

**Data Population:**
```typescript
// Script: /scripts/import-words.ts
// Reads CSV with columns: kanji, hiragana, romaji, english, level
// Inserts into words table via Drizzle batch insert
```

---

### `/src/db/schema/userWord.ts`
**Purpose:** The heart of spaced repetition. Links users to words with SRS scheduling data.

```typescript
import { pgTable, uuid, integer, real, timestamp, unique } from 'drizzle-orm/pg-core';
import { userProgress } from './userProgress';
import { words } from './word';
import { jlptLevelEnum, cardStatusEnum } from './enums';

export const userWords = pgTable('user_words', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Foreign keys
  userId: uuid('user_id').notNull().references(() => userProgress.userId, { onDelete: 'cascade' }),
  wordId: uuid('word_id').notNull().references(() => words.id, { onDelete: 'cascade' }),
  
  // Spaced repetition algorithm fields
  status: cardStatusEnum('status').notNull().default('new'),
  easeFactor: real('ease_factor').notNull().default(2.5),
  interval: integer('interval').notNull().default(0), // Days until next review
  repetitions: integer('repetitions').notNull().default(0),
  nextReviewDate: timestamp('next_review_date').notNull(),
  
  // Review history counters
  timesCorrect: integer('times_correct').notNull().default(0),
  timesIncorrect: integer('times_incorrect').notNull().default(0),
  lastReviewedAt: timestamp('last_reviewed_at'),
  
  // Metadata
  fromLevel: jlptLevelEnum('from_level').notNull(), // Which level this word came from
  addedAt: timestamp('added_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Ensure user can't have duplicate words
    uniqueUserWord: unique().on(table.userId, table.wordId),
  };
});

export type UserWord = typeof userWords.$inferSelect;
export type NewUserWord = typeof userWords.$inferInsert;
```

**Field Explanations:**

**Foreign Keys:**
- **userId (uuid, foreign key)**: 
  - Links to `userProgress.userId` (which is Better Auth's user ID).
  - **onDelete cascade**: If user deletes account from Better Auth, all their word progress is deleted.
  - **Critical for performance**: Every query filters by this first.
  
- **wordId (uuid, foreign key)**: 
  - Links to `words.id`.
  - Same word can be linked to millions of users.
  - **onDelete cascade**: If a word is removed from master list, all user associations are deleted.

**Spaced Repetition Fields (SRS Algorithm):**
- **status (enum)**: 
  - Tracks card maturity: new → learning → reviewing → mastered.
  - "Mastered" means 60+ day intervals, but card still appears when `nextReviewDate` arrives.
  
- **easeFactor (float, default 2.5)**: 
  - Anki-style difficulty modifier.
  - **Higher = easier** for the user (longer intervals after correct answers).
  - **Lower = harder** for the user (shorter intervals after correct answers).
  - Range: typically 1.3 - 3.0.
  - Decreases by 0.2 on wrong answers, increases by 0.1 on correct answers (optional tuning).
  
- **interval (integer)**: 
  - Days until next review.
  - **New cards**: 0 days (review immediately after introduction).
  - **Learning**: 1-7 days.
  - **Reviewing**: 7-60 days.
  - **Mastered**: 60-180+ days.
  
- **repetitions (integer)**: 
  - How many times the user has gotten this card correct in a row.
  - **Resets to 0 on wrong answer.**
  - Used to determine when to graduate from "learning" to "reviewing" status.
  
- **nextReviewDate (timestamp, critical)**: 
  - **THE query field**: `WHERE nextReviewDate <= NOW()` determines which cards are due.
  - Set when card is reviewed: `nextReviewDate = NOW() + interval days`.
  - **Missed reviews accumulate**: If user doesn't study for a week, all overdue cards show up.

**Review History Counters:**
- **timesCorrect / timesIncorrect (integers)**: 
  - Total lifetime correct/incorrect answers.
  - **Used for 80% accuracy check**: When `timesCorrect / (timesCorrect + timesIncorrect) >= 0.8`, add 5 new words.
  - Not reset when card status changes.
  
- **lastReviewedAt (timestamp, nullable)**: 
  - When this card was last reviewed.
  - Useful for analytics: "Which words haven't been seen in 90+ days?"

**Metadata:**
- **fromLevel (enum)**: 
  - Which JLPT level this word was added from (N5, N4, etc).
  - **Why track this?** So users can filter: "Show me only my N5 words" even after progressing to N4.
  - Doesn't change if user progresses to higher levels.
  
- **addedAt (timestamp)**: 
  - When this word was added to user's deck.
  - Useful for: "You added 127 words in the last 30 days!"

**Constraint:**
- **unique(userId, wordId)**: 
  - Prevents duplicate word entries for same user.
  - Database-level enforcement (better than application-level checks).

**Index Strategy (CRITICAL FOR PERFORMANCE):**
```sql
-- Most important index: Study session query
CREATE INDEX idx_userwords_user_nextreview ON user_words(user_id, next_review_date);

-- Secondary index: Filter by status
CREATE INDEX idx_userwords_user_status ON user_words(user_id, status);

-- Unique constraint automatically creates index on (user_id, word_id)
```

**Why these indexes?**
1. **idx_userwords_user_nextreview**: 
   - Query: "Get all due cards for user" uses `WHERE userId = ? AND nextReviewDate <= NOW()`.
   - Compound index allows database to jump to user's cards, then filter by date within that set.
   - **Without this index**: Scans all 2 billion rows. **With index**: Scans ~50 rows.

2. **idx_userwords_user_status**: 
   - Query: "How many mastered words does user have?" uses `WHERE userId = ? AND status = 'mastered'`.
   - Useful for progress tracking and analytics.

---

### `/src/db/schema/userLevelProgress.ts`
**Purpose:** Track user's progress through each JLPT level (N5 → N4 → N3 → N2 → N1).

```typescript
import { pgTable, uuid, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { userProgress } from './userProgress';
import { jlptLevelEnum, levelStatusEnum } from './enums';

export const userLevelProgress = pgTable('user_level_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Foreign key
  userId: uuid('user_id').notNull().references(() => userProgress.userId, { onDelete: 'cascade' }),
  
  // Which level this tracks
  level: jlptLevelEnum('level').notNull(),
  
  // Progress status
  status: levelStatusEnum('status').notNull().default('locked'),
  
  // Word count tracking
  totalWordsInLevel: integer('total_words_in_level').notNull(), // How many N5 words exist total
  wordsAddedCount: integer('words_added_count').notNull().default(0), // How many added to user's deck
  wordsMasteredCount: integer('words_mastered_count').notNull().default(0), // How many reached "mastered" status
  
  // Test completion
  testPassedAt: timestamp('test_passed_at'), // When user passed the Japaneasy test for this level
  
  // Timestamps
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Each user has exactly one progress entry per level
    uniqueUserLevel: unique().on(table.userId, table.level),
  };
});

export type UserLevelProgress = typeof userLevelProgress.$inferSelect;
export type NewUserLevelProgress = typeof userLevelProgress.$inferInsert;
```

**Field Explanations:**

- **userId (uuid, foreign key)**: 
  - Links to `userProgress.userId` (which is Better Auth's user ID).
  - **onDelete cascade**: User deletion removes all progress records.

- **level (enum)**: 
  - Which JLPT level this record tracks (N5, N4, N3, N2, or N1).
  - Combined with userId in unique constraint.

- **status (enum)**: 
  - **locked**: User hasn't unlocked this level yet (must complete previous level first).
  - **active**: User is currently studying this level (set in `users.currentActiveLevel` too).
  - **completed**: User mastered all words AND passed the test.
  
- **totalWordsInLevel (integer)**: 
  - Total words available in this level.
  - Set when level is created: `SELECT COUNT(*) FROM words WHERE level = 'N5'`.
  - **Why store this?** Avoids recounting on every progress check.
  - Example: N5 might have 800 words total.

- **wordsAddedCount (integer)**: 
  - How many words from this level have been added to user's `userWords` deck.
  - Increments by 5 each time new words are added.
  - **Used to check**: "Has user added all N5 words yet?" → `wordsAddedCount < totalWordsInLevel`.

- **wordsMasteredCount (integer)**: 
  - How many words from this level have reached "mastered" status (60+ day intervals).
  - **Used to check**: "Can user take the level completion test?" → `wordsMasteredCount == totalWordsInLevel`.
  - Updated when a `UserWord` status changes to "mastered".

- **testPassedAt (timestamp, nullable)**: 
  - When user passed the Japaneasy assessment for this level.
  - **Null = hasn't passed yet.**
  - **Level completion requires**: All words mastered AND test passed.

- **startedAt / completedAt (timestamps)**: 
  - When user unlocked this level / when they completed it.
  - Useful for analytics: "Average time to complete N5 = 6 months."

**Constraint:**
- **unique(userId, level)**: 
  - Each user has exactly ONE progress record per level.
  - Prevents duplicate entries.

**Index Strategy:**
```sql
-- Query: "Get user's active level progress"
CREATE INDEX idx_userlevel_user_status ON user_level_progress(user_id, status);

-- Unique constraint automatically creates index on (user_id, level)
```

**Typical Flow:**
1. **New user signup**: Create N5 progress entry with status='active', all other levels status='locked'.
2. **User studies N5**: `wordsAddedCount` and `wordsMasteredCount` increment over time.
3. **User completes N5**: All words mastered + test passed → status='completed'.
4. **N4 unlocks**: Update N4 progress status to 'active', set `users.currentActiveLevel = 'N4'`.

---

### `/src/db/schema/review.ts`
**Purpose:** Audit trail of every review attempt. Used for analytics, accuracy calculations, and debugging SRS algorithm.

```typescript
import { pgTable, uuid, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { userProgress } from './userProgress';
import { userWords } from './userWord';
import { cardStatusEnum } from './enums';

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Foreign keys
  userId: uuid('user_id').notNull().references(() => userProgress.userId, { onDelete: 'cascade' }),
  userWordId: uuid('user_word_id').notNull().references(() => userWords.id, { onDelete: 'cascade' }),
  
  // Review outcome
  wasCorrect: boolean('was_correct').notNull(),
  
  // SRS state changes (for debugging algorithm)
  previousInterval: integer('previous_interval').notNull(),
  newInterval: integer('new_interval').notNull(),
  previousStatus: cardStatusEnum('previous_status').notNull(),
  newStatus: cardStatusEnum('new_status').notNull(),
  
  // Performance metrics
  timeSpent: integer('time_spent'), // Seconds spent on this card (optional)
  
  // Timestamp
  reviewedAt: timestamp('reviewed_at').defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
```

**Field Explanations:**

- **userId / userWordId (foreign keys)**: 
  - Dual foreign keys for flexible querying.
  - **Why both?** Can query "all reviews by user" OR "all reviews for specific word."
  - **onDelete cascade**: Deleting user or word removes associated reviews.

- **wasCorrect (boolean)**: 
  - Did user answer correctly?
  - **Used for 80% accuracy calculation**: `SUM(wasCorrect) / COUNT(*) >= 0.8`.

- **previousInterval / newInterval (integers)**: 
  - Interval before and after this review.
  - **Why track both?** Debugging: "Why did this card jump from 7 days to 60 days?"
  - Example: Correct answer on "reviewing" card might go from 14 days → 35 days.

- **previousStatus / newStatus (enums)**: 
  - Card status before and after review.
  - **Why track both?** Analytics: "How many cards graduated from learning to reviewing today?"
  - Example: Correct answer might change status from "learning" → "reviewing".

- **timeSpent (integer, nullable)**: 
  - How long user spent on this card (in seconds).
  - **Optional feature**: Could track this to identify cards that are confusing (long review times).
  - Could be used for: "You spent 2 hours studying today!"

- **reviewedAt (timestamp)**: 
  - When this review happened.
  - **Critical for accuracy calculations**: "Last 50 reviews" needs ordered by time.

**Index Strategy (CRITICAL FOR ACCURACY CALCULATION):**
```sql
-- Query: "Get user's recent reviews for accuracy calculation"
CREATE INDEX idx_reviews_user_reviewedat ON reviews(user_id, reviewed_at DESC);

-- Query: "Get review history for a specific card"
CREATE INDEX idx_reviews_userword_reviewedat ON reviews(user_word_id, reviewed_at DESC);
```

**Why these indexes?**
1. **idx_reviews_user_reviewedat**: 
   - Query: "Get last 50 reviews for user to check 80% accuracy."
   - Compound index with DESC on timestamp gives us chronologically ordered results fast.
   
2. **idx_reviews_userword_reviewedat**: 
   - Query: "Show review history graph for this word."
   - Useful for user-facing analytics: "You've reviewed this word 12 times with 75% accuracy."

**Growth Rate:**
- This table grows fastest (one row per review).
- With 1M users reviewing 20 cards/day = 20M rows/day.
- With proper indexing, this is fine. Consider archiving reviews older than 1 year if needed.

---

### `/src/db/schema/index.ts`
**Purpose:** Central export point for all schema definitions.

```typescript
export * from './enums';
export * from './userProgress';
export * from './word';
export * from './userWord';
export * from './userLevelProgress';
export * from './review';
```

---

### `/src/db/client.ts`
**Purpose:** Database connection singleton using Drizzle ORM.

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Environment variable validation
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create PostgreSQL connection
const connectionString = process.env.DATABASE_URL;

// Connection pool configuration
const client = postgres(connectionString, {
  max: 10, // Maximum 10 connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Timeout connection attempts after 10 seconds
});

// Drizzle instance
export const db = drizzle(client, { schema });

// Type exports for use throughout the app
export type Database = typeof db;
```

**Connection Pool Explanation:**
- **max: 10**: Limits concurrent database connections. For serverless (Vercel), keep this low.
- **idle_timeout**: Closes unused connections to free resources.
- **connect_timeout**: Prevents hanging on failed connection attempts.

---

## Implementation Steps

### Phase 1: Database Setup (Week 1)

#### Step 1.1: Initialize Drizzle
```bash
# Install dependencies
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Initialize Drizzle config
npx drizzle-kit init
```

#### Step 1.2: Configure Drizzle Kit
Create `/drizzle.config.ts`:
```typescript
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

#### Step 1.3: Create Schema Files
Create all schema files as outlined above:
- `/src/db/schema/enums.ts`
- `/src/db/schema/userProgress.ts`
- `/src/db/schema/word.ts`
- `/src/db/schema/userWord.ts`
- `/src/db/schema/userLevelProgress.ts`
- `/src/db/schema/review.ts`
- `/src/db/schema/index.ts`
- `/src/db/client.ts`

**Note:** Better Auth will create its own `user` and `session` tables. Our `userProgress` table references Better Auth's user IDs.

#### Step 1.4: Generate and Run Migrations
```bash
# Generate migration SQL from schema
npx drizzle-kit generate:pg

# Apply migrations to database
npx drizzle-kit push:pg

# Optional: Open Drizzle Studio to inspect database
npx drizzle-kit studio
```

**Expected Migrations Output:**
```sql
-- Create enums
CREATE TYPE jlpt_level AS ENUM ('N5', 'N4', 'N3', 'N2', 'N1');
CREATE TYPE level_status AS ENUM ('locked', 'active', 'completed');
CREATE TYPE card_status AS ENUM ('new', 'learning', 'reviewing', 'mastered');

-- Create tables with indexes
-- Note: Better Auth creates 'user' and 'session' tables separately
CREATE TABLE user_progress (...);
CREATE TABLE words (...);
CREATE INDEX idx_words_level ON words(level);
CREATE TABLE user_words (...);
CREATE INDEX idx_userwords_user_nextreview ON user_words(user_id, next_review_date);
CREATE INDEX idx_userwords_user_status ON user_words(user_id, status);
-- ... etc
```

#### Step 1.5: Populate Words Table
Create `/scripts/import-words.ts`:
```typescript
import { db } from '@/db/client';
import { words } from '@/db/schema';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

// CSV format: kanji,hiragana,romaji,english,level
const csvPath = './data/jlpt-words.csv';
const csvContent = readFileSync(csvPath, 'utf-8');

const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

const wordData = records.map((record: any) => ({
  kanji: record.kanji || null,
  hiragana: record.hiragana,
  romaji: record.romaji,
  english: record.english,
  level: record.level as 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
}));

// Batch insert (Drizzle handles large inserts efficiently)
await db.insert(words).values(wordData);

console.log(`Imported ${wordData.length} words`);
```

Run: `npx tsx scripts/import-words.ts`

---

### Phase 1.5: Better Auth Integration

Since you're using Better Auth for authentication, you need to integrate it with your user progress system.

#### Step 1.6: Better Auth Setup

Better Auth will create its own tables (`user`, `session`, etc.). Follow Better Auth's installation guide for your setup.

#### Step 1.7: Create User Progress on Signup

Create a server action or API route that runs after Better Auth signup:

```typescript
// /src/app/actions/auth.ts
'use server';

import { db } from '@/db/client';
import { userProgress, userLevelProgress } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function initializeUserProgress(betterAuthUserId: string) {
  // Create user progress record
  await db.insert(userProgress).values({
    userId: betterAuthUserId,
    currentActiveLevel: 'N5',
  });
  
  // Get total N5 words count
  const [wordCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(words)
    .where(eq(words.level, 'N5'));
  
  // Create initial N5 level progress
  await db.insert(userLevelProgress).values({
    userId: betterAuthUserId,
    level: 'N5',
    status: 'active',
    totalWordsInLevel: Number(wordCount.count),
    startedAt: new Date(),
  });
  
  // Add first 10 words
  const initialWords = await db
    .select()
    .from(words)
    .where(eq(words.level, 'N5'))
    .orderBy(sql`RANDOM()`)
    .limit(10);
  
  const now = new Date();
  await db.insert(userWords).values(
    initialWords.map(word => ({
      userId: betterAuthUserId,
      wordId: word.id,
      status: 'new' as const,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: now,
      fromLevel: 'N5' as const,
    }))
  );
  
  // Update words added count
  await db
    .update(userLevelProgress)
    .set({ wordsAddedCount: 10 })
    .where(
      and(
        eq(userLevelProgress.userId, betterAuthUserId),
        eq(userLevelProgress.level, 'N5')
      )
    );
}
```

Call this function after Better Auth signup:
```typescript
// In your signup page/component
const handleSignup = async (formData) => {
  // Better Auth signup
  const result = await auth.signUp({
    email: formData.email,
    password: formData.password,
    name: formData.name,
  });
  
  if (result.success) {
    // Initialize app user progress
    await initializeUserProgress(result.user.id);
  }
};
```

#### Step 1.8: Accessing User Data in Your App

Throughout your app, you'll get user info from two places:

```typescript
// Get Better Auth session
const session = await auth.getSession();

if (session) {
  // From Better Auth: email, name, authentication status
  const email = session.user.email;
  const name = session.user.name;
  const userId = session.user.id;
  
  // From your DB: app-specific data
  const [progress] = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId));
  
  const currentLevel = progress.currentActiveLevel;
}
```

### Phase 2: Core Business Logic (Week 2)

#### Step 2.1: Spaced Repetition Algorithm
Create `/src/lib/srs/constants.ts`:
```typescript
// SRS configuration constants
export const SRS_CONFIG = {
  // Intervals for "learning" status
  LEARNING_INTERVALS: [1, 3, 7], // Days: 1 day, 3 days, 7 days
  
  // Graduating interval (when moving from learning -> reviewing)
  GRADUATING_INTERVAL: 7,
  
  // Mastery threshold (60 days = ~2 months)
  MASTERY_THRESHOLD: 60,
  
  // Ease factor bounds
  EASE_FACTOR_MIN: 1.3,
  EASE_FACTOR_MAX: 3.0,
  EASE_FACTOR_DEFAULT: 2.5,
  
  // Ease adjustments
  EASE_DECREASE_ON_FAIL: 0.2,
  EASE_INCREASE_ON_SUCCESS: 0.1, // Optional: increase ease on consistent success
  
  // New word addition threshold
  ACCURACY_THRESHOLD: 0.8, // 80%
  NEW_WORDS_BATCH_SIZE: 5,
} as const;
```

Create `/src/lib/srs/algorithm.ts`:
```typescript
import { SRS_CONFIG } from './constants';
import type { CardStatusEnum } from '@/db/schema';

type CardStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

interface SRSCard {
  status: CardStatus;
  interval: number;
  repetitions: number;
  easeFactor: number;
}

interface SRSResult {
  newStatus: CardStatus;
  newInterval: number;
  newRepetitions: number;
  newEaseFactor: number;
  nextReviewDate: Date;
}

/**
 * Calculate next review based on SRS algorithm (Anki-style)
 * @param card Current card state
 * @param wasCorrect Did user answer correctly?
 * @returns Updated card state with next review date
 */
export function calculateNextReview(
  card: SRSCard,
  wasCorrect: boolean
): SRSResult {
  const now = new Date();
  let newStatus = card.status;
  let newInterval = card.interval;
  let newRepetitions = card.repetitions;
  let newEaseFactor = card.easeFactor;

  if (wasCorrect) {
    // CORRECT ANSWER LOGIC
    
    if (card.status === 'new') {
      // First time seeing this card
      newStatus = 'learning';
      newInterval = SRS_CONFIG.LEARNING_INTERVALS[0]; // 1 day
      newRepetitions = 1;
    } 
    else if (card.status === 'learning') {
      // Still in learning phase
      newRepetitions++;
      
      // Check if ready to graduate to reviewing
      if (newRepetitions >= SRS_CONFIG.LEARNING_INTERVALS.length) {
        newStatus = 'reviewing';
        newInterval = SRS_CONFIG.GRADUATING_INTERVAL; // 7 days
      } else {
        newInterval = SRS_CONFIG.LEARNING_INTERVALS[newRepetitions - 1];
      }
    } 
    else if (card.status === 'reviewing' || card.status === 'mastered') {
      // Apply ease factor for reviewing/mastered cards
      newRepetitions++;
      newInterval = Math.round(card.interval * card.easeFactor);
      
      // Optional: Increase ease factor slightly on success
      // newEaseFactor = Math.min(
      //   SRS_CONFIG.EASE_FACTOR_MAX,
      //   card.easeFactor + SRS_CONFIG.EASE_INCREASE_ON_SUCCESS
      // );
      
      // Check if reached mastery threshold
      if (newInterval >= SRS_CONFIG.MASTERY_THRESHOLD) {
        newStatus = 'mastered';
      }
    }
  } else {
    // INCORRECT ANSWER LOGIC
    
    // Decrease ease factor (make card harder)
    newEaseFactor = Math.max(
      SRS_CONFIG.EASE_FACTOR_MIN,
      card.easeFactor - SRS_CONFIG.EASE_DECREASE_ON_FAIL
    );
    
    // Reset to learning phase
    if (card.status === 'reviewing' || card.status === 'mastered') {
      newStatus = 'learning';
      newInterval = SRS_CONFIG.LEARNING_INTERVALS[0]; // 1 day
      newRepetitions = 0;
    } else if (card.status === 'learning') {
      // Stay in learning, reset interval
      newInterval = SRS_CONFIG.LEARNING_INTERVALS[0]; // 1 day
      newRepetitions = 0;
    } else {
      // 'new' card answered wrong on first try
      newStatus = 'learning';
      newInterval = SRS_CONFIG.LEARNING_INTERVALS[0];
      newRepetitions = 0;
    }
  }
  
  // Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    newStatus,
    newInterval,
    newRepetitions,
    newEaseFactor,
    nextReviewDate,
  };
}

/**
 * Check if user is ready to add more words based on 80% accuracy
 * @param correctCount Number of correct reviews
 * @param totalCount Total number of reviews
 * @returns True if accuracy >= 80%
 */
export function shouldAddNewWords(
  correctCount: number,
  totalCount: number
): boolean {
  if (totalCount === 0) return false;
  const accuracy = correctCount / totalCount;
  return accuracy >= SRS_CONFIG.ACCURACY_THRESHOLD;
}
```

**Algorithm Explanation:**
- **New → Learning**: First correct answer moves card to "learning" with 1-day interval.
- **Learning → Reviewing**: After 3 successful reviews (1 day, 3 days, 7 days), graduates to "reviewing."
- **Reviewing → Mastered**: When interval reaches 60+ days, card is "mastered" (but still reviewed).
- **Failure**: Any incorrect answer resets to "learning" with 1-day interval and decreases ease factor.

---

#### Step 2.2: API Route - Get Due Cards
Create `/src/app/api/study/due-cards/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { userWords, words } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';

// GET /api/study/due-cards
// Returns all cards due for review today (including overdue cards)
export async function GET(req: NextRequest) {
  try {
    // Get userId from Better Auth session
    const session = await auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = session.user.id;
    
    // Query: Get all due cards with word details
    const dueCards = await db
      .select({
        userWord: userWords,
        word: words,
      })
      .from(userWords)
      .innerJoin(words, eq(userWords.wordId, words.id))
      .where(
        and(
          eq(userWords.userId, userId),
          lte(userWords.nextReviewDate, new Date())
        )
      )
      .orderBy(userWords.nextReviewDate); // Oldest due cards first
    
    return NextResponse.json({
      success: true,
      count: dueCards.length,
      cards: dueCards,
    });
  } catch (error) {
    console.error('Error fetching due cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch due cards' },
      { status: 500 }
    );
  }
}
```

**Query Explanation:**
- `eq(userWords.userId, userId)`: Filter to this user only (indexed lookup).
- `lte(userWords.nextReviewDate, new Date())`: Cards due today or overdue (indexed range scan).
- `innerJoin`: Fetch word details (kanji, english, etc.) in one query instead of N+1 queries.
- `orderBy(nextReviewDate)`: Show oldest overdue cards first.

**Performance:**
- Index used: `idx_userwords_user_nextreview (user_id, next_review_date)`
- Query time: ~5-10ms even with millions of users

---

#### Step 2.3: API Route - Submit Review
Create `/src/app/api/study/submit-review/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { userWords, reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { calculateNextReview } from '@/lib/srs/algorithm';

// POST /api/study/submit-review
// Body: { userWordId: string, wasCorrect: boolean, timeSpent?: number }
export async function POST(req: NextRequest) {
  try {
    const { userWordId, wasCorrect, timeSpent } = await req.json();
    
    // Get userId from Better Auth session
    const session = await auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = session.user.id;
    
    // Get current card state
    const [card] = await db
      .select()
      .from(userWords)
      .where(eq(userWords.id, userWordId))
      .limit(1);
    
    if (!card) {
      return NextResponse.json(
        { success: false, error: 'Card not found' },
        { status: 404 }
      );
    }
    
    // Calculate next review using SRS algorithm
    const result = calculateNextReview(
      {
        status: card.status,
        interval: card.interval,
        repetitions: card.repetitions,
        easeFactor: card.easeFactor,
      },
      wasCorrect
    );
    
    // Update UserWord
    await db
      .update(userWords)
      .set({
        status: result.newStatus,
        interval: result.newInterval,
        repetitions: result.newRepetitions,
        easeFactor: result.newEaseFactor,
        nextReviewDate: result.nextReviewDate,
        lastReviewedAt: new Date(),
        timesCorrect: wasCorrect ? card.timesCorrect + 1 : card.timesCorrect,
        timesIncorrect: !wasCorrect ? card.timesIncorrect + 1 : card.timesIncorrect,
      })
      .where(eq(userWords.id, userWordId));
    
    // Insert review record
    await db.insert(reviews).values({
      userId,
      userWordId,
      wasCorrect,
      previousInterval: card.interval,
      newInterval: result.newInterval,
      previousStatus: card.status,
      newStatus: result.newStatus,
      timeSpent,
    });
    
    return NextResponse.json({
      success: true,
      nextReview: result.nextReviewDate,
      newStatus: result.newStatus,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
```

**Transaction Note:**
For production, wrap the update + insert in a transaction:
```typescript
await db.transaction(async (tx) => {
  await tx.update(userWords).set(...).where(...);
  await tx.insert(reviews).values(...);
});
```

---

#### Step 2.4: API Route - Add New Words
Create `/src/app/api/study/add-words/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { words, userWords, reviews, userProgress, userLevelProgress } from '@/db/schema';
import { eq, and, notInArray, sql } from 'drizzle-orm';
import { shouldAddNewWords } from '@/lib/srs/algorithm';
import { SRS_CONFIG } from '@/lib/srs/constants';

// POST /api/study/add-words
// Checks 80% accuracy and adds 5 new words if eligible
export async function POST(req: NextRequest) {
  try {
    // Get userId from Better Auth session
    const session = await auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = session.user.id;
    
    // Get user's current active level
    const [user] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .limit(1);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User progress not found' },
        { status: 404 }
      );
    }
    
    const currentLevel = user.currentActiveLevel;
    
    // Check level progress
    const [progress] = await db
      .select()
      .from(userLevelProgress)
      .where(
        and(
          eq(userLevelProgress.userId, userId),
          eq(userLevelProgress.level, currentLevel)
        )
      )
      .limit(1);
    
    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Level progress not found' },
        { status: 404 }
      );
    }
    
    // Check if all words already added
    if (progress.wordsAddedCount >= progress.totalWordsInLevel) {
      return NextResponse.json({
        success: false,
        message: 'All words from this level have been added',
      });
    }
    
    // Calculate accuracy from review history
    const accuracyResult = await db
      .select({
        correct: sql<number>`SUM(CASE WHEN ${reviews.wasCorrect} THEN 1 ELSE 0 END)`,
        total: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .innerJoin(userWords, eq(reviews.userWordId, userWords.id))
      .innerJoin(words, eq(userWords.wordId, words.id))
      .where(
        and(
          eq(reviews.userId, userId),
          eq(words.level, currentLevel)
        )
      );
    
    const { correct, total } = accuracyResult[0];
    
    // Check if ready to add more words
    if (!shouldAddNewWords(Number(correct), Number(total))) {
      return NextResponse.json({
        success: false,
        message: `Accuracy is ${((Number(correct) / Number(total)) * 100).toFixed(1)}%. Keep practicing to reach 80%!`,
        accuracy: Number(correct) / Number(total),
      });
    }
    
    // Get IDs of words user already has
    const existingWordIds = await db
      .select({ wordId: userWords.wordId })
      .from(userWords)
      .where(eq(userWords.userId, userId));
    
    const existingIds = existingWordIds.map(w => w.wordId);
    
    // Select random words from current level (not already added)
    const newWords = await db
      .select()
      .from(words)
      .where(
        and(
          eq(words.level, currentLevel),
          existingIds.length > 0 
            ? notInArray(words.id, existingIds)
            : undefined
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(SRS_CONFIG.NEW_WORDS_BATCH_SIZE);
    
    if (newWords.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No new words available',
      });
    }
    
    // Add new words to user's deck
    const now = new Date();
    const newUserWords = newWords.map(word => ({
      userId,
      wordId: word.id,
      status: 'new' as const,
      easeFactor: SRS_CONFIG.EASE_FACTOR_DEFAULT,
      interval: 0,
      repetitions: 0,
      nextReviewDate: now, // Available for review immediately
      fromLevel: currentLevel,
    }));
    
    await db.insert(userWords).values(newUserWords);
    
    // Update progress counter
    await db
      .update(userLevelProgress)
      .set({
        wordsAddedCount: progress.wordsAddedCount + newWords.length,
      })
      .where(eq(userLevelProgress.id, progress.id));
    
    return NextResponse.json({
      success: true,
      message: `Added ${newWords.length} new words!`,
      words: newWords,
    });
  } catch (error) {
    console.error('Error adding new words:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add new words' },
      { status: 500 }
    );
  }
}
```

**Query Breakdown:**
1. **Accuracy calculation**: Joins `reviews` → `userWords` → `words` to filter reviews by current level.
2. **notInArray check**: Excludes words user already has (prevents duplicates).
3. **RANDOM() ordering**: PostgreSQL's random function for word selection.
4. **Transaction recommended**: Wrap insert + update in a transaction for consistency.

---

### Phase 3: Performance Optimizations (Week 3)

#### Step 3.1: Database Indexes
Run these SQL commands or add to migration:

```sql
-- UserWords indexes (CRITICAL)
CREATE INDEX IF NOT EXISTS idx_userwords_user_nextreview 
  ON user_words(user_id, next_review_date);

CREATE INDEX IF NOT EXISTS idx_userwords_user_status 
  ON user_words(user_id, status);

-- Words index
CREATE INDEX IF NOT EXISTS idx_words_level 
  ON words(level);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user_reviewedat 
  ON reviews(user_id, reviewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_userword 
  ON reviews(user_word_id, reviewed_at DESC);

-- UserLevelProgress index
CREATE INDEX IF NOT EXISTS idx_userlevel_user_status 
  ON user_level_progress(user_id, status);
```

**Verify Index Usage:**
```sql
-- Check if query uses index
EXPLAIN ANALYZE 
SELECT * FROM user_words 
WHERE user_id = 'some-uuid' 
  AND next_review_date <= NOW();

-- Look for "Index Scan using idx_userwords_user_nextreview"
-- NOT "Seq Scan" (sequential scan = bad, means no index used)
```

---

#### Step 3.2: Connection Pooling
Already configured in `/src/db/client.ts` with:
```typescript
const client = postgres(connectionString, {
  max: 10, // Max concurrent connections
  idle_timeout: 20,
  connect_timeout: 10,
});
```

**For Serverless (Vercel):**
Use a connection pooler like **Supabase Pooler** or **Neon** to avoid cold start connection issues.

---

#### Step 3.3: Query Optimization Tips

**Avoid N+1 Queries:**
```typescript
// BAD: Fetches words in a loop (N+1 queries)
const userWordList = await db.select().from(userWords).where(...);
for (const uw of userWordList) {
  const word = await db.select().from(words).where(eq(words.id, uw.wordId));
}

// GOOD: Fetch everything in one query with join
const dueCards = await db
  .select()
  .from(userWords)
  .innerJoin(words, eq(userWords.wordId, words.id))
  .where(...);
```

**Use SELECT only what you need:**
```typescript
// BAD: Fetches all columns (including text fields)
const allCards = await db.select().from(userWords).where(...);

// GOOD: Only fetch IDs and nextReviewDate for count query
const cardIds = await db
  .select({ id: userWords.id, nextReviewDate: userWords.nextReviewDate })
  .from(userWords)
  .where(...);
```

**Batch Inserts:**
```typescript
// GOOD: Drizzle handles batch inserts efficiently
await db.insert(userWords).values([word1, word2, word3, ...]);
```

---

## Caching Strategy

### What to Cache
1. **User's current level progress** (rarely changes)
2. **Due card count** (changes once per review)
3. **Word master list** (static data, changes never)

### Implementation with Redis (Optional for Scale)

#### Step 4.1: Install Redis
```bash
npm install ioredis
```

#### Step 4.2: Redis Client
Create `/src/lib/redis.ts`:
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export default redis;
```

#### Step 4.3: Cache Due Card Count
Modify `/src/app/api/study/due-cards/route.ts`:
```typescript
import redis from '@/lib/redis';

export async function GET(req: NextRequest) {
  const userId = 'user-uuid-from-auth';
  const cacheKey = `due-cards:${userId}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }
  
  // Query database
  const dueCards = await db.select()...;
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(dueCards));
  
  return NextResponse.json(dueCards);
}
```

**Invalidate Cache on Review:**
```typescript
// In submit-review route, after updating card:
await redis.del(`due-cards:${userId}`);
```

**Trade-off:**
- **Benefit**: Reduces database load for repeated "due count" checks.
- **Cost**: Adds complexity, requires Redis infrastructure.
- **When to use**: When you have 10k+ concurrent users.

---

### Caching Without Redis (Next.js Cache)

Use React Server Components cache:
```typescript
import { unstable_cache } from 'next/cache';

export const getCachedDueCards = unstable_cache(
  async (userId: string) => {
    return await db.select()...;
  },
  ['due-cards'],
  { revalidate: 300, tags: ['due-cards'] }
);
```

Invalidate:
```typescript
import { revalidateTag } from 'next/cache';

// After review submission:
revalidateTag('due-cards');
```

---

## Testing Strategy

### Unit Tests (SRS Algorithm)
Create `/src/lib/srs/__tests__/algorithm.test.ts`:
```typescript
import { calculateNextReview } from '../algorithm';
import { SRS_CONFIG } from '../constants';

describe('SRS Algorithm', () => {
  it('should move new card to learning on correct answer', () => {
    const card = {
      status: 'new' as const,
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
    };
    
    const result = calculateNextReview(card, true);
    
    expect(result.newStatus).toBe('learning');
    expect(result.newInterval).toBe(1); // 1 day
    expect(result.newRepetitions).toBe(1);
  });
  
  it('should graduate to reviewing after 3 successful learning reviews', () => {
    const card = {
      status: 'learning' as const,
      interval: 7,
      repetitions: 2,
      easeFactor: 2.5,
    };
    
    const result = calculateNextReview(card, true);
    
    expect(result.newStatus).toBe('reviewing');
    expect(result.newInterval).toBe(7);
  });
  
  it('should reset to learning on incorrect answer', () => {
    const card = {
      status: 'reviewing' as const,
      interval: 30,
      repetitions: 5,
      easeFactor: 2.5,
    };
    
    const result = calculateNextReview(card, false);
    
    expect(result.newStatus).toBe('learning');
    expect(result.newInterval).toBe(1);
    expect(result.newRepetitions).toBe(0);
    expect(result.newEaseFactor).toBe(2.3); // Decreased by 0.2
  });
});
```

Run: `npm test`

---

### Integration Tests (API Routes)
Test with actual database (use test database):

```typescript
import { GET } from '@/app/api/study/due-cards/route';

describe('GET /api/study/due-cards', () => {
  beforeAll(async () => {
    // Seed test database with user + due cards
  });
  
  it('should return due cards for user', async () => {
    const req = new NextRequest('http://localhost/api/study/due-cards');
    const response = await GET(req);
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.cards.length).toBeGreaterThan(0);
  });
});
```

---

### Load Testing (Optional)
Use **k6** or **Artillery** to simulate concurrent users:

```javascript
// k6-script.js
import http from 'k6/http';

export default function() {
  http.get('http://localhost:3000/api/study/due-cards');
}

// Run: k6 run --vus 100 --duration 30s k6-script.js
// Simulates 100 concurrent users for 30 seconds
```

---

## Summary Checklist

### Week 1: Database Setup
- [x] Install Drizzle + Postgres
- [x] Create schema files (enums, userProgress, word, userWord, userLevelProgress, review)
- [x] Generate and run migrations
- [x] Create indexes
- [x] Import words from CSV
- [x] Set up Better Auth
- [x] Create user progress initialization function
- [ ] Test signup flow (Better Auth + user progress creation)

### Week 2: Core Logic
- [ ] Implement SRS algorithm
- [ ] Create API route: GET due cards
- [ ] Create API route: POST submit review
- [ ] Create API route: POST add new words
- [ ] Write unit tests for SRS algorithm

### Week 3: Optimization
- [ ] Verify indexes are used (EXPLAIN ANALYZE)
- [ ] Add caching (Redis or Next.js cache)
- [ ] Set up connection pooling
- [ ] Load test with 100+ concurrent users

### Week 4: Production
- [ ] Deploy to Vercel/Railway/Render
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure backups (daily Postgres dumps)
- [ ] Add rate limiting to API routes

---

## Database Monitoring & Maintenance

### Monitoring Queries
```sql
-- Find slow queries (Postgres)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Database size
SELECT pg_size_pretty(pg_database_size('japaneasy'));
```

### Maintenance Tasks
- **Weekly**: Vacuum database to reclaim space
- **Monthly**: Reindex tables if index bloat detected
- **Quarterly**: Archive old review records (>1 year old)

---

## Future Enhancements

### Phase 4: Advanced Features
1. **Audio pronunciation**: Store audio URLs in `words.audioUrl`
2. **Example sentences**: Add `words.exampleSentence`
3. **User streaks**: Track consecutive days studied
4. **Leaderboards**: Compare progress with other users
5. **Custom decks**: Let users create custom word lists
6. **Spaced repetition tuning**: A/B test different interval formulas

### Phase 5: Analytics
1. **User retention dashboard**: Track daily/monthly active users
2. **Word difficulty heatmap**: Which words have lowest accuracy?
3. **Study time tracking**: Total hours studied per user
4. **Level completion funnel**: N5 → N4 → N3 conversion rates

---

## Additional Resources

### Drizzle ORM Docs
- [Drizzle Documentation](https://orm.drizzle.team/)
- [Drizzle with Next.js](https://orm.drizzle.team/docs/get-started-postgresql#nextjs)

### SRS Algorithm References
- [Anki Algorithm Explanation](https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html)
- [SuperMemo SM-2 Algorithm](https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method)

### Performance Optimization
- [Postgres Indexing Strategies](https://www.postgresql.org/docs/current/indexes.html)
- [Database Connection Pooling](https://node-postgres.com/features/pooling)

---

## Questions or Issues?

If you encounter any problems during implementation:
1. Check Drizzle logs: `npx drizzle-kit studio` to inspect database
2. Verify indexes: Run `EXPLAIN ANALYZE` on slow queries
3. Test SRS algorithm: Write unit tests for edge cases
4. Review migration files: Ensure all tables/indexes were created

Good luck building Japaneasy! 🎌

## Pattern to Follow

For your queries/mutations files, use database-specific verbs:
Mutations (writes):

```
insertUserProgress
updateUserProgress
deleteUserProgress
upsertUserWord
```


Queries (reads):
```
getUserProgressById
findUserProgressByUserId
listAllUserProgress
```
This way, your actions keep business-friendly names (createUserProgress), while your database layer uses operation-specific names (insertUserProgress).
