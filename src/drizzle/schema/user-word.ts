import { index, integer, pgTable, real, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { user } from './auth-schema';
import { cardStatusEnum, jlptLevelEnum } from './enums';
import { words } from './word';

export const userWords = pgTable(
  'user_words',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    wordId: uuid('word_id')
      .notNull()
      .references(() => words.id, { onDelete: 'cascade' }),
    status: cardStatusEnum('status').notNull().default('new'),
    easeFactor: real('ease_factor').notNull().default(2.5),
    interval: integer('interval').notNull().default(0),
    repetitions: integer('repetitions').notNull().default(0),
    nextReviewDate: timestamp('next_review_date').notNull(),
    timesCorrect: integer('times_correct').notNull().default(0),
    timesIncorrect: integer('times_incorrect').notNull().default(0),
    lastReviewedAt: timestamp('last_reviewed_at'),
    fromLevel: jlptLevelEnum('from_level').notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => {
    return {
      uniqueUserWord: unique().on(table.userId, table.wordId),
      idxUserwordsUserNextreview: index('idx_userwords_user_nextreview').on(table.userId, table.nextReviewDate),
      idxUserwordsUserStatus: index('idx_userwords_user_status').on(table.userId, table.status),
    };
  }
);
