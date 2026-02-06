import { index, integer, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { jlptLevelEnum, levelStatusEnum } from './enums';
import { userProgress } from './user-progress';

export const userLevelProgress = pgTable(
  'user_level_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => userProgress.userId, { onDelete: 'cascade' }),
    level: jlptLevelEnum('level').notNull(),
    status: levelStatusEnum('status').notNull().default('locked'),
    totalWordsInLevel: integer('total_words_in_level').notNull(),
    wordsAddedCount: integer('words_added_count').notNull().default(0),
    wordsMasteredCount: integer('words_mastered_count').notNull().default(0),
    testPassedAt: timestamp('test_passed_at'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => {
    return {
      uniqueUserLevel: unique().on(table.userId, table.level),
      idxUserlevelUserStatus: index('idx_userlevel_user_status').on(table.userId, table.status),
    };
  }
);
